"""
NewsDesk.AI - Voice + Avatar (Lip-Sync) Generation Backend
Stages: SCRIPT -> VOICE -> AVATAR (this file covers Voice + Avatar)
Avatar stage runs SadTalker LOCALLY (no ngrok / Colab) via subprocess, CPU mode.
"""

import os
import glob
import uuid
import shutil
import asyncio
import subprocess
from datetime import datetime

import edge_tts
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="NewsDesk.AI - Voice + Avatar Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "audio_output")
VIDEO_DIR = os.path.join(BASE_DIR, "video_output")
AVATAR_DIR = os.path.join(BASE_DIR, "avatars")

# Path to the SadTalker repo you cloned in Step 1 — adjust if you put it elsewhere
SADTALKER_DIR = os.path.join(BASE_DIR, "SadTalker")

for d in (AUDIO_DIR, VIDEO_DIR, AVATAR_DIR):
    os.makedirs(d, exist_ok=True)

app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")
app.mount("/video", StaticFiles(directory=VIDEO_DIR), name="video")


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
    avatar_id: str = Field(
        ...,
        description="Either a preset id (a1-a4) or a filename returned by /upload-avatar",
    )
    audio_filename: str = Field(..., description="filename returned by /generate-voice or /upload-audio")


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


@app.post("/upload-avatar")
async def upload_avatar(image: UploadFile = File(...)):
    ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"custom_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(AVATAR_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await image.read())

    return {"avatar_id": filename, "preview_url": None}


@app.post("/upload-audio")
async def upload_audio(audio: UploadFile = File(...)):
    ext = os.path.splitext(audio.filename)[1] or ".mp3"
    filename = f"custom_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(AUDIO_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await audio.read())

    return {
        "audio_url": f"/audio/{filename}",
        "filename": filename,
    }


def _run_sadtalker_local(image_path: str, audio_path: str, job_id: str) -> str:
    """
    Runs SadTalker's inference.py directly as a subprocess (CPU mode),
    no network hop. Returns the path to the generated mp4.
    """
    if not os.path.isdir(SADTALKER_DIR):
        raise HTTPException(
            status_code=500,
            detail=f"SadTalker folder not found at {SADTALKER_DIR}. Did you clone it into backend/SadTalker?",
        )

    result_dir = os.path.join(VIDEO_DIR, f"job_{job_id}")
    os.makedirs(result_dir, exist_ok=True)

    cmd = [
        "python", "inference.py",
        "--driven_audio", audio_path,
        "--source_image", image_path,
        "--result_dir", result_dir,
        "--still",
        "--preprocess", "crop",  # fastest mode — good enough for a talking-head clip
        "--cpu",                  # force CPU inference (no NVIDIA GPU on this machine)
    ]

    try:
        proc = subprocess.run(
            cmd,
            cwd=SADTALKER_DIR,
            capture_output=True,
            text=True,
            timeout=1800,  # 30 min hard ceiling on CPU — should return much sooner for a 1-2s clip
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="SadTalker timed out (30 min) on CPU.")

    if proc.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"SadTalker failed:\nSTDOUT:\n{proc.stdout[-1500:]}\nSTDERR:\n{proc.stderr[-1500:]}",
        )

    videos = glob.glob(os.path.join(result_dir, "*.mp4")) + glob.glob(os.path.join(result_dir, "**", "*.mp4"))
    if not videos:
        raise HTTPException(
            status_code=500,
            detail=f"SadTalker ran but produced no .mp4 in {result_dir}.\nSTDOUT:\n{proc.stdout[-1000:]}",
        )

    return max(videos, key=os.path.getctime)


@app.post("/generate-avatar-video", response_model=AvatarVideoResponse)
async def generate_avatar_video(req: AvatarVideoRequest):
    if req.avatar_id in AVATAR_FILES:
        avatar_path = os.path.join(AVATAR_DIR, AVATAR_FILES[req.avatar_id])
    else:
        avatar_path = os.path.join(AVATAR_DIR, req.avatar_id)

    audio_path = os.path.join(AUDIO_DIR, req.audio_filename)

    if not os.path.exists(avatar_path):
        raise HTTPException(status_code=404, detail=f"Avatar file not found: {avatar_path}")
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail=f"Audio file not found: {audio_path}")

    job_id = uuid.uuid4().hex

    try:
        result_video_path = await asyncio.to_thread(_run_sadtalker_local, avatar_path, audio_path, job_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar video generation failed: {e}")

    # Copy the result to a flat, predictable filename under video_output/
    final_filename = f"{job_id}.mp4"
    final_path = os.path.join(VIDEO_DIR, final_filename)
    shutil.copy(result_video_path, final_path)

    return AvatarVideoResponse(video_url=f"/video/{final_filename}")


@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat(), "sadtalker_dir_exists": os.path.isdir(SADTALKER_DIR)}


# Run with: uvicorn main:app --reload --port 8000