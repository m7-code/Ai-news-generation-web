import { UserRound } from "lucide-react";
import NewsTicker from "./NewsTicker";

export default function Monitor({
  theme,
  script,
  selectedAvatar,
  selectedVideo,
  generating,
  done,
  stageIdx,
  audioUrl,
  talkingVideoUrl,
  tickerItems,
}) {
  const showAnchor = generating || done;
  const STAGES = ["SCRIPT", "VOICE", "AVATAR", "RENDER"];

  return (
    <div className="w-full pt-25 flex flex-col items-center gap-6">
      {/* Monitor + audio bar + ticker wrapper */}
      <div className="relative w-full max-w-[760px] mx-auto">
        {/* ACTUAL MONITOR */}
        <div
          className="relative w-full aspect-video rounded-xl border p-3 shadow-2xl overflow-hidden"
          style={{
            borderColor: theme.panelBorder,
            backgroundColor: theme.monitorFrame,
          }}
        >
          <video
            key={selectedVideo.id}
            src={selectedVideo.src}
            className="absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500"
            style={{ opacity: showAnchor ? 1 : 0.15 }}
            muted
            loop
            playsInline
            autoPlay
          />
          <div className="absolute inset-0 bg-black/35 rounded-lg" />

          {!showAnchor && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#2A2F38]">
              <UserRound size={56} strokeWidth={1} />
              <span className="font-mono text-[10px] tracking-widest">NO SIGNAL</span>
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
              <img src={selectedAvatar.img} alt="" className="w-full h-full object-cover" />
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
                <img src={selectedAvatar.img} alt="" className="w-full h-full object-cover" />
              )}
              <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[8px] tracking-widest text-[#E8EAED] bg-black/60 py-0.5 pointer-events-none">
                {talkingVideoUrl ? "LIVE ANCHOR" : "READY"}
              </span>
            </div>
          )}

          {showAnchor && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pt-6 pb-3">
              <div className="font-mono text-[9px] tracking-widest text-[#F2B705] mb-0.5">
                {done ? "READY" : "PROCESSING"}
              </div>
              <div className="text-xs text-[#D8DBE0] line-clamp-1">
                {script || "Untitled bulletin"}
              </div>
            </div>
          )}
        </div>

        {/* AUDIO BAR — same red-gradient pill style as the ticker, shown until the talking video is ready */}
        {audioUrl && !talkingVideoUrl && (
          <div
            className="w-full h-12 mt-3 flex items-center gap-3 px-4 rounded-[20px] border"
            style={{
              background: "linear-gradient(180deg, #ff5265 0%, #f32b43 50%, #c9142c 100%)",
              borderColor: "rgba(255,255,255,0.35)",
              boxShadow: "0 3px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            <span
              className="text-white text-[9px] font-mono tracking-widest shrink-0"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
            >
              AUDIO READY
            </span>
            <audio
              controls
              autoPlay
              src={audioUrl}
              className="flex-1 h-8"
              style={{ filter: "invert(0.9) hue-rotate(180deg)" }}
            />
          </div>
        )}

        {/* TICKER — sits right under the monitor (and under the audio bar, if present) */}
        <NewsTicker theme={theme} items={tickerItems} />
      </div>
    </div>
  );
}