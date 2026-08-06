"""
NewsDesk.AI - Voice + Avatar (Lip-Sync) Generation Backend
Stages: SCRIPT -> VOICE -> AVATAR (this file covers Voice + Avatar)
Avatar stage calls your self-hosted SadTalker server (Colab + ngrok).
"""

import os
import uuid
import asyncio
from datetime import datetime

import edge_tts
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()  # reads SADTALKER_API_URL from .env

app = FastAPI(title="NewsDesk.AI - Voice + Avatar Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIO_DIR = "audio_output"
VIDEO_DIR = "video_output"
AVATAR_DIR = "avatars"
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")
app.mount("/video", StaticFiles(directory=VIDEO_DIR), name="video")

# This changes every time you restart the Colab notebook — update it in .env each session
SADTALKER_API_URL = os.getenv("SADTALKER_API_URL")


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


def _call_sadtalker(image_path: str, audio_path: str) -> bytes:
    """Sends the avatar image + audio to your Colab SadTalker server, returns the mp4 bytes."""
    if not SADTALKER_API_URL:
        raise HTTPException(status_code=500, detail="SADTALKER_API_URL is not set in .env")

    url = f"{SADTALKER_API_URL.rstrip('/')}/generate-talking-video"
    headers = {"ngrok-skip-browser-warning": "true"}

    with open(image_path, "rb") as img_f, open(audio_path, "rb") as aud_f:
        files = {
            "image": (os.path.basename(image_path), img_f, "image/jpeg"),
            "audio": (os.path.basename(audio_path), aud_f, "audio/mpeg"),
        }
        resp = requests.post(url, headers=headers, files=files, timeout=600)

    if not resp.ok:
        raise HTTPException(
            status_code=500,
            detail=f"SadTalker server error: {resp.status_code} {resp.text[:300]}",
        )
    return resp.content


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
        video_bytes = await asyncio.to_thread(_call_sadtalker, avatar_path, audio_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar video generation failed: {e}")

    filename = f"{uuid.uuid4().hex}.mp4"
    filepath = os.path.join(VIDEO_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(video_bytes)

    return AvatarVideoResponse(video_url=f"/video/{filename}")


@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


# Run with: uvicorn main:app --reload --port 8000