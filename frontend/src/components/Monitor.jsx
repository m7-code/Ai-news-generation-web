import { UserRound } from "lucide-react";
import { STAGES } from "../data";

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
}) {
  const showAnchor = generating || done;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div
          className="rounded-xl border p-3 shadow-2xl"
          style={{ borderColor: theme.panelBorder, backgroundColor: theme.monitorFrame }}
        >
          <div className="rounded-md bg-black aspect-video relative overflow-hidden flex items-center justify-center">
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

            {!showAnchor && (
              <div className="relative flex flex-col items-center gap-2 text-[#2A2F38]">
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
              <div
                className="absolute left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pt-6 pb-3 transition-all"
                style={{ bottom: audioUrl && !talkingVideoUrl ? "44px" : "0px" }}
              >
                <div className="font-mono text-[9px] tracking-widest text-[#F2B705] mb-0.5">
                  {done ? "READY" : "PROCESSING"}
                </div>
                <div className="text-xs text-[#D8DBE0] line-clamp-1">
                  {script || "Untitled bulletin"}
                </div>
              </div>
            )}

            {audioUrl && !talkingVideoUrl && (
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

        <div className="flex items-center justify-between mt-4 px-1">
          {STAGES.map((s, i) => {
            const active = i === stageIdx;
            const passed = done || i < stageIdx;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: active ? "#F2B705" : passed ? "#2EC4B6" : theme.panelBorder,
                  }}
                />
                <span
                  className="font-mono text-[10px] tracking-widest"
                  style={{
                    color: active ? "#F2B705" : passed ? "#2EC4B6" : theme.textFaint,
                  }}
                >
                  {s}
                </span>
                {i < STAGES.length - 1 && (
                  <div
                    className="flex-1 h-px mx-1"
                    style={{ backgroundColor: theme.panelBorder }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}