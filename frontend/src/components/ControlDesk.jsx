import { Play, Loader2 } from "lucide-react";
import ScriptPanel from "./ScriptPanel";
import SelectDropdown from "./SelectDropdown";
import { VOICES, AVATARS, VIDEOS } from "../data";

export default function ControlDesk({
  theme,
  script,
  setScript,
  voice,
  setVoice,
  avatar,
  setAvatar,
  bgVideo,
  setBgVideo,
  generating,
  canGenerate,
  onGenerate,
}) {
  return (
    <div
      className="border-r px-6 py-6 flex flex-col gap-6 overflow-y-auto"
      style={{ borderColor: theme.panelBorder }}
    >
      <ScriptPanel theme={theme} script={script} setScript={setScript} />

      <SelectDropdown
        theme={theme}
        heading="02 · VOICE"
        kind="voice"
        options={VOICES}
        value={voice}
        onChange={setVoice}
      />

      <SelectDropdown
        theme={theme}
        heading="03 · AVATAR"
        kind="avatar"
        options={AVATARS}
        value={avatar}
        onChange={setAvatar}
      />

      <SelectDropdown
        theme={theme}
        heading="04 · BACKGROUND"
        kind="video"
        options={VIDEOS}
        value={bgVideo}
        onChange={setBgVideo}
      />

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mt-auto flex items-center justify-center gap-2 py-3 rounded-md font-display text-xs tracking-widest transition"
        style={{
          backgroundColor: canGenerate ? theme.accent : theme.panelBorder,
          color: canGenerate ? "#fff" : theme.textFaint,
          cursor: canGenerate ? "pointer" : "not-allowed",
        }}
      >
        {generating ? (
          <>
            <Loader2 size={14} className="animate-spin" /> GENERATING
          </>
        ) : (
          <>
            <Play size={14} fill="currentColor" /> GO LIVE
          </>
        )}
      </button>
    </div>
  );
}