import { useState, useEffect } from "react";
import Header from "./components/Header";
import PipelineBar from "./components/PipelineBar";
import ControlDesk from "./components/ControlDesk";
import Monitor from "./components/Monitor";
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

  // Preset + custom-uploaded options live together in these lists
  const [voiceOptions, setVoiceOptions] = useState(VOICES);
  const [avatarOptions, setAvatarOptions] = useState(AVATARS);
  const [videoOptions, setVideoOptions] = useState(VIDEOS);

  const [voice, setVoice] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [bgVideo, setBgVideo] = useState(null);

  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

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

  const canGenerate =
    script.trim().length > 0 && !!voice && !!avatar && !!bgVideo && !generating;

  // ---------------------------------------------------------------
  // Uploads
  // ---------------------------------------------------------------

  // Custom voice = a pre-recorded audio file. We upload it right away so
  // it's ready to use the moment the user hits Go Live.
  const handleVoiceUpload = async (file) => {
    setUploadingVoice(true);
    try {
      const form = new FormData();
      form.append("audio", file);
      const res = await fetch(`${API_BASE}/upload-audio`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();

      const newOption = {
        id: data.filename,
        name: file.name.length > 18 ? file.name.slice(0, 15) + "…" : file.name,
        tag: "Custom upload",
        isCustomAudio: true,
        audioUrl: `${API_BASE}${data.audio_url}`,
      };
      setVoiceOptions((prev) => [...prev, newOption]);
      setVoice(newOption.id);
    } catch (err) {
      console.error("Voice upload failed:", err);
      alert("Audio upload failed. Check the backend terminal for details.");
    } finally {
      setUploadingVoice(false);
    }
  };

  // Custom avatar = upload the image to the backend right away so it's on
  // disk and ready for /generate-avatar-video later.
  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`${API_BASE}/upload-avatar`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();

      const newOption = {
        id: data.avatar_id,
        label: "Custom",
        hue: "#8E7DFF",
        img: URL.createObjectURL(file),
      };
      setAvatarOptions((prev) => [...prev, newOption]);
      setAvatar(newOption.id);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Avatar upload failed. Check the backend terminal for details.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Custom background video is purely cosmetic (loops behind the anchor),
  // so no backend call is needed — just use it locally in the browser.
  const handleVideoUpload = (file) => {
    setUploadingVideo(true);
    try {
      const newOption = {
        id: `custom-${Date.now()}`,
        label: "Custom",
        src: URL.createObjectURL(file),
      };
      setVideoOptions((prev) => [...prev, newOption]);
      setBgVideo(newOption.id);
    } finally {
      setUploadingVideo(false);
    }
  };

  // ---------------------------------------------------------------
  // Generate
  // ---------------------------------------------------------------

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setDone(false);
    setAudioUrl(null);
    setTalkingVideoUrl(null);
    setGenerating(true);
    setStageIdx(1); // VOICE

    let localAudioUrl = null;

    try {
      const selectedVoiceOpt = voiceOptions.find((v) => v.id === voice);
      let audioFilename;

      if (selectedVoiceOpt?.isCustomAudio) {
        // Already uploaded — skip TTS generation entirely.
        audioFilename = selectedVoiceOpt.id;
        localAudioUrl = selectedVoiceOpt.audioUrl;
        setAudioUrl(localAudioUrl);
      } else {
        const voiceRes = await fetch(`${API_BASE}/generate-voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script, voice_id: voice }),
        });
        if (!voiceRes.ok) throw new Error(`Voice failed: ${voiceRes.status}`);
        const voiceData = await voiceRes.json();
        audioFilename = voiceData.filename;
        localAudioUrl = `${API_BASE}${voiceData.audio_url}`;
        setAudioUrl(localAudioUrl);
      }

      setStageIdx(2); // AVATAR
      const avatarRes = await fetch(`${API_BASE}/generate-avatar-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_id: avatar, audio_filename: audioFilename }),
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
  const selectedAvatar = avatarOptions.find((a) => a.id === avatar);
  const selectedVideo = videoOptions.find((v) => v.id === bgVideo);

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

      <main className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0">
        <ControlDesk
          theme={theme}
          script={script}
          setScript={setScript}
          voice={voice}
          setVoice={setVoice}
          voiceOptions={voiceOptions}
          onVoiceUpload={handleVoiceUpload}
          uploadingVoice={uploadingVoice}
          avatar={avatar}
          setAvatar={setAvatar}
          avatarOptions={avatarOptions}
          onAvatarUpload={handleAvatarUpload}
          uploadingAvatar={uploadingAvatar}
          bgVideo={bgVideo}
          setBgVideo={setBgVideo}
          videoOptions={videoOptions}
          onVideoUpload={handleVideoUpload}
          uploadingVideo={uploadingVideo}
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
          tickerItems={TICKER_ITEMS}
        />
      </main>
    </div>
  );
}