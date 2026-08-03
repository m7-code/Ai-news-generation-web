"""
NewsDesk.AI - Voice Generation Backend
Stage: SCRIPT -> VOICE (this file)
Avatar/video stage will be added later.
"""

import os
import uuid
import asyncio
from datetime import datetime

import edge_tts
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="NewsDesk.AI - Voice Service")

# Allow the React frontend (vite dev server) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIO_DIR = "audio_output"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Serve generated audio files at /audio/<filename>
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")


# -----------------------------------------------------------------
# Curated voice list (edge-tts voice IDs).
# Mix of English + Urdu neural voices so the user can pick.
# Full list can be fetched live with: edge-tts --list-voices
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


class VoiceGenerateRequest(BaseModel):
    script: str = Field(..., min_length=1, max_length=5000, description="News script text")
    voice_id: str = Field(..., description="One of the IDs from /voices")
    rate: str = Field("+0%", description="Speed adjustment, e.g. '+10%' or '-10%'")
    pitch: str = Field("+0Hz", description="Pitch adjustment, e.g. '+5Hz' or '-5Hz'")


class VoiceGenerateResponse(BaseModel):
    audio_url: str
    voice_id: str
    duration_hint_chars: int
    filename: str


@app.get("/voices")
def list_voices():
    """Frontend calls this to populate the voice-selection cards."""
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
        communicate = edge_tts.Communicate(
            text=script,
            voice=req.voice_id,
            rate=req.rate,
            pitch=req.pitch,
        )
        await communicate.save(filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {e}")

    return VoiceGenerateResponse(
        audio_url=f"/audio/{filename}",
        voice_id=req.voice_id,
        duration_hint_chars=len(script),
        filename=filename,
    )


@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


# Run with: uvicorn main:app --reload --port 8000