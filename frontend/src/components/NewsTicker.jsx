export default function NewsTicker({ theme, items }) {
  const loopItems = [...items, ...items];

  return (
    <div
      className="absolute left-0 right-0 top-full mt-1 h-12 flex items-center overflow-hidden border z-30 rounded-[20px]"
      style={{
        background:
          "linear-gradient(180deg, #ff5265 0%, #f32b43 50%, #c9142c 100%)",
        borderColor: "rgba(255,255,255,0.35)",
        boxShadow:
          "0 3px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      {/* Image */}
      <div className="relative w-11 h-7 shrink-0">
        <img
          src="/new.jpg"
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-10 h-10 rounded-full object-cover z-40"
          style={{
            border: "2px solid rgba(255,255,255,0.75)",
            boxShadow:
              "0 0 7px rgba(255,255,255,0.65), 0 0 5px rgba(255,50,70,0.8)",
          }}
        />
      </div>

      {/* Scrolling ticker */}
      <div className="relative flex-1 overflow-hidden h-full">
        <div className="ticker-track flex items-center gap-4 whitespace-nowrap h-full px-3">
          {loopItems.map((text, i) => (
            <div
              key={i}
              className="flex items-center gap-4 shrink-0"
            >
              <span
                className="text-white text-[10px] font-medium"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                {text}
              </span>

              <span
                className="text-white text-[9px] font-bold"
                style={{
                  textShadow: "0 0 4px rgba(255,255,255,0.8)",
                }}
              >
                ●
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-track {
          width: max-content;
          animation: ticker-scroll 35s linear infinite;
          will-change: transform;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}