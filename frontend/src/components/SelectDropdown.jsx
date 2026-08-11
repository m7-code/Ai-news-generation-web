import { useState, useRef, useEffect } from "react";
import { ChevronDown, Upload } from "lucide-react";

/**
 * Generic labeled dropdown.
 * kind: "voice" | "avatar" | "video" — controls how each row/trigger renders.
 * Pass onUpload + uploadAccept to show an "Upload your own" row at the bottom.
 */
export default function SelectDropdown({
  theme,
  heading,
  kind,
  options,
  value,
  onChange,
  onUpload,
  uploadAccept,
  uploading,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const Thumb = ({ item, size = 32 }) => {
    const style = {
      width: size,
      height: size,
      borderRadius: kind === "avatar" ? "9999px" : "4px",
      overflow: "hidden",
      flexShrink: 0,
      border: `1px solid ${theme.panelBorder}`,
    };
    if (kind === "avatar") {
      return (
        <div style={style}>
          <img src={item.img} alt="" className="w-full h-full object-cover" />
        </div>
      );
    }
    if (kind === "video") {
      return (
        <div style={style}>
          <video
            src={item.src}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        </div>
      );
    }
    // voice — colored dot instead of a thumbnail
    return (
      <div
        style={{
          ...style,
          borderRadius: "9999px",
          backgroundColor: theme.accent2,
          opacity: 0.85,
        }}
      />
    );
  };

  return (
    <div ref={ref} className="relative">
      <label
        className="font-mono text-[11px] tracking-widest mb-2 block"
        style={{ color: theme.textMuted }}
      >
        {heading}
      </label>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border transition"
        style={{
          backgroundColor: theme.inputBg,
          borderColor: open ? theme.accent : theme.inputBorder,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selected ? (
            <Thumb item={selected} />
          ) : (
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: kind === "avatar" ? "9999px" : "4px",
                border: `1px dashed ${theme.textFaint}`,
              }}
            >
              <Upload size={13} style={{ color: theme.textMuted }} />
            </div>
          )}
          <div className="min-w-0 text-left">
            <div
              className="text-sm font-medium truncate"
              style={{ color: selected ? theme.text : theme.textMuted }}
            >
              {selected ? selected.name || selected.label : "Upload your own or select from the list"}
            </div>
            {selected?.tag && (
              <div
                className="font-mono text-[9px] truncate"
                style={{ color: theme.textFaint }}
              >
                {selected.tag}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: theme.textMuted,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms ease",
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-md border shadow-lg overflow-hidden"
          style={{ backgroundColor: theme.panelBg, borderColor: theme.panelBorder }}
        >
          {options.map((opt) => {
            const active = opt.id === value;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 transition text-left"
                style={{
                  backgroundColor: active ? `${theme.accent}14` : "transparent",
                }}
              >
                <Thumb item={opt} size={28} />
                <div className="min-w-0">
                  <div
                    className="text-sm truncate"
                    style={{ color: active ? theme.accent : theme.text }}
                  >
                    {opt.name || opt.label}
                  </div>
                  {opt.tag && (
                    <div
                      className="font-mono text-[9px] truncate"
                      style={{ color: theme.textFaint }}
                    >
                      {opt.tag}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {onUpload && (
            <>
              <div
                className="h-px mx-2"
                style={{ backgroundColor: theme.panelBorder }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 transition text-left"
                disabled={uploading}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: kind === "avatar" ? "9999px" : "4px",
                    border: `1px dashed ${theme.textFaint}`,
                  }}
                >
                  <Upload size={12} style={{ color: theme.textMuted }} />
                </div>
                <span
                  className="text-sm"
                  style={{ color: theme.textMuted }}
                >
                  {uploading ? "Uploading…" : "Upload your own"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={uploadAccept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                  setOpen(false);
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}