import { UserRound } from "lucide-react";
import NewsTicker from "./NewsTicker";
import AudioPlayerBar from "./AudioPlayerBar";

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
          {/* Side-by-Side Container */}
          <div className="relative w-full h-full flex gap-2 rounded-lg overflow-hidden bg-black/80 p-1">
            
            {/* LEFT BOX: Video / Footage */}
            <div className="relative flex-1 h-full rounded overflow-hidden bg-black/40 flex items-center justify-center border border-white/5">
              {selectedVideo ? (
                <video
                  key={selectedVideo.id}
                  src={selectedVideo.src}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: showAnchor ? 1 : 0.4 }}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 text-[#2A2F38]">
                  <UserRound size={40} strokeWidth={1} />
                  <span className="font-mono text-[9px] tracking-widest">NO FOOTAGE</span>
                </div>
              )}
              <span className="absolute top-2 left-2 font-mono text-[8px] bg-black/70 text-[#D8DBE0] px-1.5 py-0.5 rounded pointer-events-none">
                MEDIA
              </span>
            </div>

            {/* RIGHT BOX: Avatar / Presenter */}
            <div
              className="relative w-[42%] h-full rounded overflow-hidden bg-black/40 border-2"
              style={{ borderColor: selectedAvatar?.hue || "#333" }}
            >
              {!showAnchor && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#2A2F38]">
                  <UserRound size={40} strokeWidth={1} />
                  <span className="font-mono text-[9px] tracking-widest">NO SIGNAL</span>
                </div>
              )}

              {generating && (
                <div className="w-full h-full relative animate-pulse">
                  {selectedAvatar?.img && (
                    <img src={selectedAvatar.img} alt="" className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[8px] tracking-widest text-[#E8EAED] bg-black/60 py-0.5">
                    {STAGES[stageIdx]}…
                  </span>
                </div>
              )}

              {done && (
                <div className="w-full h-full relative">
                  {talkingVideoUrl ? (
                    <video
                      src={talkingVideoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      controls
                      playsInline
                    />
                  ) : (
                    selectedAvatar?.img && (
                      <img src={selectedAvatar.img} alt="" className="w-full h-full object-cover" />
                    )
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[8px] tracking-widest text-[#E8EAED] bg-black/60 py-0.5 pointer-events-none">
                    {talkingVideoUrl ? "LIVE ANCHOR" : "READY"}
                  </span>
                </div>
              )}
            </div>

            {/* Lower Third Overlay */}
            {showAnchor && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pt-6 pb-2 pointer-events-none">
                <div className="font-mono text-[9px] tracking-widest text-[#F2B705] mb-0.5">
                  {done ? "READY" : "PROCESSING"}
                </div>
                <div className="text-xs text-[#D8DBE0] line-clamp-1">
                  {script || "Untitled bulletin"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AUDIO BAR */}
        {audioUrl && !talkingVideoUrl && <AudioPlayerBar audioUrl={audioUrl} />}

        {/* TICKER */}
        <NewsTicker theme={theme} items={tickerItems} />
      </div>
    </div>
  );
}