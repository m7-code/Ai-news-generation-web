"""
NewsDesk.AI - Voice + Avatar (Lip-Sync) Generation Backend
Stages: SCRIPT -> VOICE -> AVATAR (this file covers Voice + Avatar)
Avatar stage uses D-ID's Talks API.
"""

import os
import time
import uuid
import base64
import asyncio
from datetime import datetime

import edge_tts
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()  # reads DID_API_KEY from .env

app = FastAPI(title="NewsDesk.AI - Voice + Avatar Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIO_DIR = "audio_output"
AVATAR_DIR = "avatars"
os.makedirs(AUDIO_DIR, exist_ok=True)

app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

DID_API_KEY = os.getenv("DID_API_KEY")
DID_BASE_URL = "https://api.d-id.com"


def _did_headers(json_content=True):
    """D-ID auth: Basic <base64(api_key)> where api_key already contains the colon."""
    if not DID_API_KEY:
        raise HTTPException(status_code=500, detail="DID_API_KEY is not set in .env")
    token = base64.b64encode(DID_API_KEY.encode()).decode()
    headers = {"Authorization": f"Basic {token}"}
    if json_content:
        headers["Content-Type"] = "application/json"
    return headers


# -----------------------------------------------------------------
# Voice list (unchanged)
# -----------------------------------------------------------------
VOICES = [
    {"id": "en-US-AriaNeural", "name": "Aria", "tag": "English (US) - Female"},
    {"id": "en-US-GuyNeural", "name": "Guy", "tag": "English (US) - Male"},
    {"id": "en-GB-SoniaNeural", "name": "Sonia", "tag": "English (UK) - Female"},
    {"id": "en-GB-RyanNeural", "name": "Ryan", "tag": "English (UK) - Male"},
    {"id": "ur-PK-UzmaNeural", "name": "Uzma", "tag": "Urdu (PK) - Female"},
    {"id": "ur-PK-AsadNeural", "name": "Asad", "tag": "Urdu (PK) - Male"},
]
VOICE_IDS = {v["id"] for v in VOICES}

# Maps the avatar_id the frontend sends to the local file in /avatars
AVATAR_FILES = {
    "a1": "female1.jpg",
    "a2": "female2.jpg",
    "a3": "male1.jpg",
    "a4": "male2.jpg",
}


class VoiceGenerateRequest(BaseModel):
    script: str = Field(..., min_length=1, max_length=5000)
    voice_id: str
    rate: str = "+0%"
    pitch: str = "+0Hz"


class VoiceGenerateResponse(BaseModel):
    audio_url: str
    voice_id: str
    duration_hint_chars: int
    filename: str


class AvatarVideoRequest(BaseModel):
    avatar_id: str = Field(..., description="One of: a1, a2, a3, a4")
    audio_filename: str = Field(..., description="filename returned by /generate-voice")


class AvatarVideoResponse(BaseModel):
    video_url: str


@app.get("/voices")
def list_voices():
    return {"voices": VOICES}


@app.post("/generate-voice", response_model=VoiceGenerateResponse)
async def generate_voice(req: VoiceGenerateRequest):
    if req.voice_id not in VOICE_IDS:
        raise HTTPException(status_code=400, detail="Unknown voice_id. Call /voices for valid options.")

    script = req.script.strip()
    if not script:
        raise HTTPException(status_code=400, detail="Script cannot be empty.")

    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    try:
        communicate = edge_tts.Communicate(text=script, voice=req.voice_id, rate=req.rate, pitch=req.pitch)
        await communicate.save(filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {e}")

    return VoiceGenerateResponse(
        audio_url=f"/audio/{filename}",
        voice_id=req.voice_id,
        duration_hint_chars=len(script),
        filename=filename,
    )


def _did_upload(filepath: str, endpoint: str) -> str:
    """Uploads a local file to D-ID's /images or /audios endpoint, returns the hosted URL."""
    with open(filepath, "rb") as f:
        files = {"image" if endpoint == "images" else "audio": f}
        resp = requests.post(
            f"{DID_BASE_URL}/{endpoint}",
            headers=_did_headers(json_content=False),
            files=files,
        )
    if not resp.ok:
        raise HTTPException(status_code=500, detail=f"D-ID upload to /{endpoint} failed: {resp.status_code} {resp.text}")
    return resp.json()["url"]


def _did_create_and_wait(image_url: str, audio_url: str, timeout_s: int = 120) -> str:
    """Creates a talk and polls until it's done. Returns the final video URL."""
    create_resp = requests.post(
        f"{DID_BASE_URL}/talks",
        headers=_did_headers(),
        json={
            "source_url": image_url,
            "script": {"type": "audio", "audio_url": audio_url},
        },
    )
    if not create_resp.ok:
        raise HTTPException(status_code=500, detail=f"D-ID /talks failed: {create_resp.status_code} {create_resp.text}")

    talk_id = create_resp.json()["id"]

    start = time.time()
    while time.time() - start < timeout_s:
        status_resp = requests.get(f"{DID_BASE_URL}/talks/{talk_id}", headers=_did_headers())
        data = status_resp.json()
        status = data.get("status")
        if status == "done":
            return data["result_url"]
        if status == "error" or status == "rejected":
            raise HTTPException(status_code=500, detail=f"D-ID generation failed: {data}")
        time.sleep(3)

    raise HTTPException(status_code=504, detail="D-ID generation timed out.")


@app.post("/generate-avatar-video", response_model=AvatarVideoResponse)
async def generate_avatar_video(req: AvatarVideoRequest):
    if req.avatar_id not in AVATAR_FILES:
        raise HTTPException(status_code=400, detail="Unknown avatar_id. Use a1, a2, a3, or a4.")

    avatar_path = os.path.join(AVATAR_DIR, AVATAR_FILES[req.avatar_id])
    audio_path = os.path.join(AUDIO_DIR, req.audio_filename)

    if not os.path.exists(avatar_path):
        raise HTTPException(status_code=404, detail=f"Avatar file not found: {avatar_path}")
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail=f"Audio file not found: {audio_path}")

    try:
        image_url = await asyncio.to_thread(_did_upload, avatar_path, "images")
        audio_url = await asyncio.to_thread(_did_upload, audio_path, "audios")
        video_url = await asyncio.to_thread(_did_create_and_wait, image_url, audio_url)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar video generation failed: {e}")

    return AvatarVideoResponse(video_url=video_url)


@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


# Run with: uvicorn main:app --reload --port 8000