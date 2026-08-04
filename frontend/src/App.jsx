import { useState, useEffect, useRef } from "react";
import { Radio, Mic2, UserRound, Play, Loader2, Circle, Film } from "lucide-react";
import female1 from "./assets/avatars/female1.jpg";
import female2 from "./assets/avatars/female2.jpg";
import male1 from "./assets/avatars/male1.jpg";
import male2 from "./assets/avatars/male2.jpg";
import video1 from "./assets/videos/video1.mp4";
import video2 from "./assets/videos/video2.mp4";
import video3 from "./assets/videos/video3.mp4";
import video4 from "./assets/videos/video4.mp4";

const VOICES = [
  { id: "en-US-AriaNeural", name: "Aria", tag: "English (US) · Female", freq: [0.4, 0.7, 0.5, 0.9, 0.6, 0.3] },
  { id: "en-US-GuyNeural", name: "Guy", tag: "English (US) · Male", freq: [0.6, 0.4, 0.8, 0.5, 0.7, 0.4] },
  { id: "ur-PK-UzmaNeural", name: "Uzma", tag: "Urdu (PK) · Female", freq: [0.3, 0.8, 0.4, 0.6, 0.9, 0.5] },
  { id: "ur-PK-AsadNeural", name: "Asad", tag: "Urdu (PK) · Male", freq: [0.5, 0.5, 0.7, 0.4, 0.5, 0.8] },
];

const AVATARS = [
  { id: "a1", label: "Female 01", hue: "#E63946", img: female1 },
  { id: "a2", label: "Female 02", hue: "#F2B705", img: female2 },
  { id: "a3", label: "Male 01", hue: "#2EC4B6", img: male1 },
  { id: "a4", label: "Male 02", hue: "#8E7DFF", img: male2 },
];

const VIDEOS = [
  { id: "v1", label: "Studio 01", src: video1 },
  { id: "v2", label: "Studio 02", src: video2 },
  { id: "v3", label: "Studio 03", src: video3 },
  { id: "v4", label: "Studio 04", src: video4 },
];

const STAGES = ["SCRIPT", "VOICE", "AVATAR", "RENDER"];
const API_BASE = "http://localhost:8000";

function Waveform({ freq, active }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {freq.map((f, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            height: `${Math.max(f * 20, 4)}px`,
            backgroundColor: active ? "#F2B705" : "#4A5160",
            transition: "background-color 200ms ease",
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("en-US-AriaNeural");
  const [avatar, setAvatar] = useState("a1");
  const [bgVideo, setBgVideo] = useState("v1");
  const [generating, setGenerating] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [audioUrl, setAudioUrl] = useState(null);
  const [talkingVideoUrl, setTalkingVideoUrl] = useState(null);
  const timerRef = useRef(null);

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

    try {
      const voiceRes = await fetch(`${API_BASE}/generate-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, voice_id: voice }),
      });
      if (!voiceRes.ok) throw new Error(`Voice failed: ${voiceRes.status}`);
      const voiceData = await voiceRes.json();
      setAudioUrl(`${API_BASE}${voiceData.audio_url}`);

      setStageIdx(2); // AVATAR — this can take 30-60s+ on D-ID
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
    }
  };

  const timeStr = clock.toLocaleTimeString("en-GB", { hour12: false });
  const selectedAvatar = AVATARS.find((a) => a.id === avatar);
  const selectedVideo = VIDEOS.find((v) => v.id === bgVideo);
  const showAnchor = generating || done;

  return (
    <div className="min-h-screen w-full bg-[#0C0F14] text-[#E8EAED] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Archivo Black', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-[#1E232C] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#E63946] flex items-center justify-center">
            <Radio size={16} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-sm tracking-wide">NEWSDESK.AI</div>
            <div className="font-mono text-[10px] text-[#6B7280] tracking-widest">
              BROADCAST GENERATION CONSOLE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Circle
              size={8}
              fill={generating ? "#E63946" : "#4A5160"}
              stroke="none"
              className={generating ? "animate-pulse" : ""}
            />
            <span className="font-mono text-[11px] text-[#8B93A1] tracking-wider">
              {generating ? "ON AIR" : "STANDBY"}
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#8B93A1]">{timeStr}</div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0">
        {/* Control desk */}
        <div className="border-r border-[#1E232C] px-6 py-6 flex flex-col gap-7 overflow-y-auto">
          {/* Script */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-[11px] tracking-widest text-[#8B93A1]">
                01 · SCRIPT
              </label>
              <span className="font-mono text-[10px] text-[#4A5160]">
                {script.length} CHARS
              </span>
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Type the news script the anchor will read..."
              rows={6}
              className="w-full resize-none bg-[#151920] border border-[#262C38] rounded-md px-3 py-2.5 text-sm text-[#E8EAED] placeholder-[#4A5160] focus:outline-none focus:ring-1 focus:ring-[#E63946] focus:border-[#E63946] transition"
            />
          </div>

          {/* Voice */}
          <div>
            <label className="font-mono text-[11px] tracking-widest text-[#8B93A1] mb-2 block">
              02 · VOICE
            </label>
            <div className="flex flex-col gap-2">
              {VOICES.map((v) => {
                const active = voice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md border transition text-left ${
                      active
                        ? "border-[#F2B705] bg-[#1B1A12]"
                        : "border-[#262C38] bg-[#151920] hover:border-[#3A4150]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Mic2
                        size={14}
                        className={active ? "text-[#F2B705]" : "text-[#6B7280]"}
                      />
                      <div>
                        <div className="text-sm font-medium leading-tight">{v.name}</div>
                        <div className="font-mono text-[10px] text-[#6B7280]">{v.tag}</div>
                      </div>
                    </div>
                    <Waveform freq={v.freq} active={active} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="font-mono text-[11px] tracking-widest text-[#8B93A1] mb-2 block">
              03 · AVATAR
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATARS.map((a) => {
                const active = avatar === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setAvatar(a.id)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className="w-full aspect-square rounded-md overflow-hidden border-2 transition"
                      style={{ borderColor: active ? a.hue : "#262C38" }}
                    >
                      <img
                        src={a.img}
                        alt={a.label}
                        className="w-full h-full object-cover"
                        style={{ opacity: active ? 1 : 0.55 }}
                      />
                    </div>
                    <span
                      className="font-mono text-[9px] tracking-wide"
                      style={{ color: active ? a.hue : "#4A5160" }}
                    >
                      {a.label.split(" ")[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Video */}
          <div>
            <label className="font-mono text-[11px] tracking-widest text-[#8B93A1] mb-2 block">
              04 · BACKGROUND
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {VIDEOS.map((v) => {
                const active = bgVideo === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setBgVideo(v.id)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className="w-full aspect-square rounded-md overflow-hidden border-2 transition relative bg-[#151920]"
                      style={{ borderColor: active ? "#F2B705" : "#262C38" }}
                    >
                      <video
                        src={v.src}
                        className="w-full h-full object-cover"
                        style={{ opacity: active ? 1 : 0.55 }}
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                      <Film
                        size={12}
                        className="absolute top-1 right-1 text-white/70"
                      />
                    </div>
                    <span
                      className="font-mono text-[9px] tracking-wide"
                      style={{ color: active ? "#F2B705" : "#4A5160" }}
                    >
                      {v.label.split(" ")[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`mt-auto flex items-center justify-center gap-2 py-3 rounded-md font-display text-xs tracking-widest transition ${
              canGenerate
                ? "bg-[#E63946] text-white hover:bg-[#D32F3D] cursor-pointer"
                : "bg-[#1B1F27] text-[#4A5160] cursor-not-allowed"
            }`}
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> GENERATING
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" /> GO LIVE
              </>
            )}
          </button>
        </div>

        {/* Broadcast monitor */}
        <div className="flex flex-col items-center justify-center px-6 py-10 bg-[#08090C]">
          <div className="w-full max-w-2xl">
            {/* TV bezel */}
            <div className="rounded-xl border border-[#1E232C] bg-[#0F1218] p-3 shadow-2xl">
              <div className="rounded-md bg-black aspect-video relative overflow-hidden flex items-center justify-center">
                {/* Background video — always mounted, visible once anchor is showing */}
                <video
                  key={selectedVideo.id}
                  src={selectedVideo.src}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: showAnchor ? 1 : 0.15 }}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
                <div className="absolute inset-0 bg-black/35" />

                {/* Foreground states, layered above the video */}
                {!showAnchor && (
                  <div className="relative flex flex-col items-center gap-2 text-[#2A2F38]">
                    <UserRound size={56} strokeWidth={1} />
                    <span className="font-mono text-[10px] tracking-widest">
                      NO SIGNAL
                    </span>
                  </div>
                )}
                {generating && (
                  <div
                    className="absolute overflow-hidden rounded-sm border-2 animate-pulse"
                    style={{
                      right: "0%",
                      top: "0%",
                      width: "35%",
                      height: "86.5%",
                      borderColor: selectedAvatar.hue,
                    }}
                  >
                    <img
                      src={selectedAvatar.img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[8px] tracking-widest text-[#E8EAED] bg-black/60 py-0.5">
                      {STAGES[stageIdx]}…
                    </span>
                  </div>
                )}
                {done && (
                  <div
                    className="absolute overflow-hidden rounded-sm border-2"
                    style={{
                      right: "0%",
                      top: "0%",
                      width: "35%",
                      height: "86.5%",
                      borderColor: selectedAvatar.hue,
                    }}
                  >
                    {talkingVideoUrl ? (
                      <video
                        src={talkingVideoUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        controls
                        playsInline
                      />
                    ) : (
                      <img
                        src={selectedAvatar.img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[8px] tracking-widest text-[#E8EAED] bg-black/60 py-0.5 pointer-events-none">
                      {talkingVideoUrl ? "LIVE ANCHOR" : "READY"}
                    </span>
                  </div>
                )}

                {/* Lower-third */}
                {showAnchor && (
                  <div
                    className="absolute left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pt-6 pb-3 transition-all"
                    style={{ bottom: done && audioUrl && !talkingVideoUrl ? "44px" : "0px" }}
                  >
                    <div className="font-mono text-[9px] tracking-widest text-[#F2B705] mb-0.5">
                      {done ? "READY" : "PROCESSING"}
                    </div>
                    <div className="text-xs text-[#D8DBE0] line-clamp-1">
                      {script || "Untitled bulletin"}
                    </div>
                  </div>
                )}

                {/* Bottom audio player bar — only shown as a fallback if the talking video hasn't loaded */}
                {done && audioUrl && !talkingVideoUrl && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0A0C10] border-t border-white/10 px-3 py-2">
                    <audio
                      controls
                      autoPlay
                      src={audioUrl}
                      className="w-full h-8"
                      style={{ filter: "invert(0.9) hue-rotate(180deg)" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline ticker */}
            <div className="flex items-center justify-between mt-4 px-1">
              {STAGES.map((s, i) => {
                const active = i === stageIdx;
                const passed = done || i < stageIdx;
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: active
                          ? "#F2B705"
                          : passed
                          ? "#2EC4B6"
                          : "#262C38",
                      }}
                    />
                    <span
                      className="font-mono text-[10px] tracking-widest"
                      style={{
                        color: active ? "#F2B705" : passed ? "#2EC4B6" : "#4A5160",
                      }}
                    >
                      {s}
                    </span>
                    {i < STAGES.length - 1 && (
                      <div className="flex-1 h-px bg-[#1E232C] mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}