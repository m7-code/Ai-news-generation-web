
export default function NewsTicker({ theme, items }) {
  // Duplicate the items so the loop feels seamless
  const loopItems = [...items, ...items];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-9 flex items-center overflow-hidden border-t z-30"
      style={{
        background:
          "linear-gradient(180deg, #f12a42 0%, #f32b43 45%, #c9142c 100%)",
        borderColor: theme.panelBorder,
        boxShadow:
          "0 -2px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      {/* Only image */}
      <div className="relative w-14 h-9 shrink-0 flex items-center justify-center">
        <img
          src="/new.jpg"
          alt=""
          className="relative w-12 h-12 rounded-full object-cover"
          style={{
            border: "2px solid rgba(255,255,255,0.7)",
            boxShadow:
              "0 0 8px rgba(255,255,255,0.7), 0 0 6px rgba(255,50,70,0.8)",
          }}
        />
      </div>

      {/* Scrolling ticker */}
      <div className="relative flex-1 overflow-hidden h-full">
        <div className="ticker-track flex items-center gap-5 whitespace-nowrap h-full px-4">
          {loopItems.map((text, i) => (
            <div key={i} className="flex items-center gap-5 shrink-0">
              <span
                className="text-white text-sm font-medium"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                }}
              >
                {text}
              </span>

              <span
                className="text-white font-bold"
                style={{
                  textShadow: "0 0 5px rgba(255,255,255,0.8)",
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

