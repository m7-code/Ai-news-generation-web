import { Globe } from "lucide-react";

export default function NewsTicker({ theme, items }) {
  // Duplicate the items so the loop feels seamless with no visible gap/restart
  const loopItems = [...items, ...items];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-9 flex items-center overflow-hidden border-t z-30"
      style={{ backgroundColor: "#f32b43", borderColor: theme.panelBorder }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-1 shrink-0"
        style={{ backgroundColor: "#000", color: "#fff" }}
      >
        <Globe size={12} strokeWidth={2} />
        <span className="font-mono text-[9px] tracking-widest">WORLD</span>
      </div>
      <div className="relative flex-1 h-full overflow-hidden">
        <div className="ticker-track flex items-center h-full whitespace-nowrap absolute left-0 top-0">
          {loopItems.map((text, i) => (
            <span key={i} className="flex items-center">
              <span className="text-white text-xs font-medium px-4">{text}</span>
              <span className="text-white/50 text-xs">●</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 35s linear infinite;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}