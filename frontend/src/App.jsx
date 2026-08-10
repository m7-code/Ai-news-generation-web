import { useState, useEffect } from "react";
import Header from "./components/Header";
import PipelineBar from "./components/PipelineBar";
import ControlDesk from "./components/ControlDesk";
import Monitor from "./components/Monitor";
import NewsTicker from "./components/NewsTicker";
import { THEMES } from "./theme";
import { VOICES, AVATARS, VIDEOS, API_BASE } from "./data";

const TICKER_ITEMS = [
  "NEWSDESK.AI — AI-GENERATED BROADCAST BULLETIN",
  "TYPE A SCRIPT, PICK A VOICE AND AVATAR, GO LIVE",
  "POWERED BY EDGE-TTS AND SADTALKER",
];

export default function App() {
  const [themeMode, setThemeMode] = useState("light"); // default = white
  const theme = THEMES[themeMode];

  const [script, setScript] = useState("");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [bgVideo, setBgVideo] = useState(VIDEOS[0].id);

  const [generating, setGenerating] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [talkingVideoUrl, setTalkingVideoUrl] = useState(null);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const canGenerate = script.trim().length > 0 && !generating;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setDone(false);
    setAudioUrl(null);
    setTalkingVideoUrl(null);
    setGenerating(true);
    setStageIdx(1); // VOICE

    let localAudioUrl = null;

    try {
      const voiceRes = await fetch(`${API_BASE}/generate-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, voice_id: voice }),
      });
      if (!voiceRes.ok) throw new Error(`Voice failed: ${voiceRes.status}`);
      const voiceData = await voiceRes.json();
      localAudioUrl = `${API_BASE}${voiceData.audio_url}`;
      setAudioUrl(localAudioUrl);

      setStageIdx(2); // AVATAR
      const avatarRes = await fetch(`${API_BASE}/generate-avatar-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_id: avatar, audio_filename: voiceData.filename }),
      });
      if (!avatarRes.ok) throw new Error(`Avatar failed: ${avatarRes.status}`);
      const avatarData = await avatarRes.json();
      setTalkingVideoUrl(avatarData.video_url);

      setStageIdx(3); // RENDER
      setGenerating(false);
      setDone(true);
      setStageIdx(-1);
    } catch (err) {
      console.error("Generation failed:", err);
      setGenerating(false);
      setStageIdx(-1);
      if (localAudioUrl) setDone(true); // voice succeeded even if avatar failed
    }
  };

  const timeStr = clock.toLocaleTimeString("en-GB", { hour12: false });
  const selectedAvatar = AVATARS.find((a) => a.id === avatar);
  const selectedVideo = VIDEOS.find((v) => v.id === bgVideo);

  return (
    <div
      className="min-h-screen w-full font-sans transition-colors duration-200"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Archivo Black', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <Header
        theme={theme}
        onToggleTheme={() => setThemeMode((m) => (m === "light" ? "dark" : "light"))}
        generating={generating}
        timeStr={timeStr}
      />

      <PipelineBar theme={theme} stageIdx={stageIdx} done={done} />

      <main className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 pb-9">
        <ControlDesk
          theme={theme}
          script={script}
          setScript={setScript}
          voice={voice}
          setVoice={setVoice}
          avatar={avatar}
          setAvatar={setAvatar}
          bgVideo={bgVideo}
          setBgVideo={setBgVideo}
          generating={generating}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
        />

        <Monitor
          theme={theme}
          script={script}
          selectedAvatar={selectedAvatar}
          selectedVideo={selectedVideo}
          generating={generating}
          done={done}
          stageIdx={stageIdx}
          audioUrl={audioUrl}
          talkingVideoUrl={talkingVideoUrl}
        />
      </main>

      <NewsTicker theme={theme} items={TICKER_ITEMS} />
    </div>
  );
}