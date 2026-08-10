import { Radio, Circle, Sun, Moon } from "lucide-react";

export default function Header({ theme, onToggleTheme, generating, timeStr }) {
  return (
    <header
      className="flex items-center justify-between border-b px-6 py-4"
      style={{ borderColor: theme.panelBorder }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-[#E63946] flex items-center justify-center">
          <Radio size={16} strokeWidth={2.5} color="#fff" />
        </div>
        <div>
          <div className="font-display text-sm tracking-wide" style={{ color: theme.text }}>
            NEWSDESK.AI
          </div>
          <div
            className="font-mono text-[10px] tracking-widest"
            style={{ color: theme.textMuted }}
          >
            BROADCAST GENERATION CONSOLE
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Circle
            size={8}
            fill={generating ? "#E63946" : theme.textFaint}
            stroke="none"
            className={generating ? "animate-pulse" : ""}
          />
          <span
            className="font-mono text-[11px] tracking-wider"
            style={{ color: theme.textMuted }}
          >
            {generating ? "ON AIR" : "STANDBY"}
          </span>
        </div>

        <span className="font-mono text-[11px]" style={{ color: theme.textMuted }}>
          {timeStr}
        </span>

        <button
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-md flex items-center justify-center border transition"
          style={{ borderColor: theme.panelBorder, color: theme.textMuted }}
          title="Toggle light / dark"
        >
          {theme.mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </header>
  );
}