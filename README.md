# NewsDesk.AI — AI News Video Generator

Turn a written news script into a fully generated broadcast bulletin: pick a voice, pick an anchor avatar, pick a studio background, and get a lip-synced talking-head video with narrated audio — all running on your own machine.

**Pipeline:** `SCRIPT → VOICE → AVATAR → RENDER`

---

## ✨ Features

- **Script-to-speech** — Type any script and generate natural narration with [edge-tts](https://github.com/rany2/edge-tts) (free, no API key, multiple English/Urdu voices)
- **Talking-head avatar video** — [SadTalker](https://github.com/OpenTalker/SadTalker) generates a lip-synced video of your chosen avatar reading the script, running **fully locally** (no third-party API costs)
- **Custom uploads** — Bring your own avatar photo, background video, or pre-recorded audio instead of using the presets
- **Broadcast-style UI** — Light/dark theme toggle, live pipeline status bar, scrolling news ticker, VLC-style audio player
- **Graceful fallback** — If avatar video generation is slow or fails, the generated audio still plays instead of the whole request failing

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Voice generation | `edge-tts` |
| Avatar / lip-sync | [SadTalker](https://github.com/OpenTalker/SadTalker) (runs locally, CPU or GPU) |
| Icons | `lucide-react` |

---

## 📁 Project Structure

```
ai-news-generation-web/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── theme.js              # light/dark color tokens
│   │   ├── data.js                # voices, avatars, videos, API_BASE
│   │   ├── assets/
│   │   │   ├── avatars/           # preset avatar photos
│   │   │   └── videos/            # preset studio background loops
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── PipelineBar.jsx
│   │       ├── ScriptPanel.jsx
│   │       ├── SelectDropdown.jsx
│   │       ├── ControlDesk.jsx
│   │       ├── Monitor.jsx
│   │       ├── AudioPlayerBar.jsx
│   │       └── NewsTicker.jsx
│   └── package.json
│
└── backend/
    ├── main.py                    # FastAPI app (voice + avatar endpoints)
    ├── requirements.txt
    ├── avatars/                   # preset avatar images used by the backend
    ├── audio_output/              # generated voice files (gitignored)
    ├── video_output/              # generated talking-head videos (gitignored)
    └── SadTalker/                 # cloned separately, not committed (gitignored)
```

---

## ⚙️ Setup

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` by default.

### 2. Backend

SadTalker requires **Python 3.10** (newer versions have dependency conflicts with its pinned libraries).

```bash
cd backend
py -3.10 -m venv venv
source venv/Scripts/activate      # Windows (Git Bash)
# or: venv\Scripts\activate       # Windows (cmd/PowerShell)

pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 3. SadTalker (avatar / lip-sync engine)

Clone it directly into the `backend/` folder — it's excluded from git via `.gitignore`, so every environment needs to set this up once:

```bash
cd backend
git clone https://github.com/OpenTalker/SadTalker.git
cd SadTalker
pip install -r requirements.txt
```

If you hit a Windows path-length error while installing `basicsr`, install `torch` first so `basicsr` doesn't try to fetch it via its own build process:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

**Download the model checkpoints (~4GB):**

```bash
pip install -U "huggingface_hub[cli]"
hf download vinthony/SadTalker --local-dir ./checkpoints
```

**Known fix for older `basicsr`/`gfpgan`:** if you get
`ModuleNotFoundError: No module named 'torchvision.transforms.functional_tensor'`,
open `venv/Lib/site-packages/basicsr/data/degradations.py` and change:

```python
from torchvision.transforms.functional_tensor import rgb_to_grayscale
```
to:
```python
from torchvision.transforms.functional import rgb_to_grayscale
```

### 4. FFmpeg

SadTalker needs `ffmpeg` on your PATH for the final video muxing step.

```bash
winget install ffmpeg
```

Restart your terminal (or your PC, if the PATH doesn't refresh) and confirm with `ffmpeg -version`.

### 5. Run the backend

```bash
cd backend
source venv/Scripts/activate
uvicorn main:app --reload --port 9000
```

> If port `9000` is already in use on your machine, pick another port and update `API_BASE` in `frontend/src/data.js` to match.

Health check: `http://localhost:9000/health` should return `"sadtalker_dir_exists": true`.

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/voices` | List available TTS voices |
| `POST` | `/generate-voice` | Generate narration audio from script text |
| `POST` | `/upload-avatar` | Upload a custom avatar image |
| `POST` | `/upload-audio` | Upload a custom pre-recorded audio file (skips TTS) |
| `POST` | `/generate-avatar-video` | Run SadTalker to produce the lip-synced video |
| `GET` | `/health` | Backend + SadTalker status check |

---

## ⚠️ Known Limitations

- **CPU inference is slow.** Without an NVIDIA GPU, SadTalker can take several minutes even for a short (1–2 second) clip. The frontend has a client-side timeout (`AVATAR_TIMEOUT_MS` in `App.jsx`) that falls back to audio-only playback if the video isn't ready in time — increase this value if you have more patience than a fast machine.
- **`backend/SadTalker/` is not committed to git** — it's a ~4GB third-party repo with model checkpoints that exceed GitHub's 100MB file limit. Anyone setting up this project needs to clone it separately (see Setup step 3).
- Custom background videos are cosmetic only (not sent to SadTalker) — only the avatar photo and audio affect the generated lip-sync video.

---

## 🗺️ Roadmap Ideas

- GPU-accelerated inference support (drop `--cpu` flag when CUDA is available)
- Job queue for handling multiple generation requests without blocking
- Persisted bulletin history / download page
- Editable news ticker content from the UI

---

## 📝 License

Personal / educational project. SadTalker and edge-tts retain their own respective licenses — see their repositories for details.