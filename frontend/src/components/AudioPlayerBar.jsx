import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function AudioPlayerBar({ audioUrl }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play().catch(() => {});
    setIsPlaying(true);

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="w-full h-12 mt-3 flex items-center gap-3 px-4 rounded-[20px] border"
      style={{
        background: "linear-gradient(180deg, #ff5265 0%, #f32b43 50%, #c9142c 100%)",
        borderColor: "rgba(255,255,255,0.35)",
        boxShadow: "0 3px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      <audio ref={audioRef} src={audioUrl} className="hidden" />

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      >
        {isPlaying ? (
          <Pause size={13} color="#fff" fill="#fff" />
        ) : (
          <Play size={13} color="#fff" fill="#fff" style={{ marginLeft: 1 }} />
        )}
      </button>

      {/* Current time */}
      <span
        className="text-white text-[10px] font-mono shrink-0 w-8 text-right"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
      >
        {formatTime(currentTime)}
      </span>

      {/* Progress bar */}
      <div
        onClick={handleSeek}
        className="relative flex-1 h-1.5 rounded-full cursor-pointer"
        style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${progressPct}%`, backgroundColor: "#fff" }}
        />
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full -translate-y-1/2 -translate-x-1/2 shadow"
          style={{
            left: `${progressPct}%`,
            backgroundColor: "#fff",
            boxShadow: "0 0 4px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Duration */}
      <span
        className="text-white text-[10px] font-mono shrink-0 w-8"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
      >
        {formatTime(duration)}
      </span>

      <Volume2 size={14} color="#fff" className="shrink-0" style={{ opacity: 0.85 }} />
    </div>
  );
}