import { STAGES } from "../data";

export default function PipelineBar({ theme, stageIdx, done }) {
  return (
    <div
      className="flex items-center justify-between px-6 py-2.5 border-b"
      style={{ borderColor: theme.panelBorder, backgroundColor: theme.panelBg }}
    >
      {STAGES.map((s, i) => {
        const active = i === stageIdx;
        const passed = done || i < stageIdx;
        return (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: active ? "#F2B705" : passed ? "#c42e2e" : theme.panelBorder,
              }}
            />
            <span
              className="font-mono text-[10px] tracking-widest"
              style={{
                color: active ? "#F2B705" : passed ? "#c42e47" : theme.textFaint,
              }}
            >
              {s}
            </span>
            {i < STAGES.length - 1 && (
              <div className="flex-1 h-px mx-1" style={{ backgroundColor: theme.panelBorder }} />
            )}
          </div>
        );
      })}
    </div>
  );
}