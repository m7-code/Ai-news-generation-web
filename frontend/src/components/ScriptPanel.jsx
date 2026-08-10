export default function ScriptPanel({ theme, script, setScript }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          className="font-mono text-[11px] tracking-widest"
          style={{ color: theme.textMuted }}
        >
          01 · SCRIPT
        </label>
        <span className="font-mono text-[10px]" style={{ color: theme.textFaint }}>
          {script.length} CHARS
        </span>
      </div>
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Type the news script the anchor will read..."
        rows={11}
        className="w-full resize-none rounded-md px-3 py-2.5 text-sm transition focus:outline-none focus:ring-1"
        style={{
          backgroundColor: theme.inputBg,
          border: `1px solid ${theme.inputBorder}`,
          color: theme.text,
        }}
      />
    </div>
  );
}