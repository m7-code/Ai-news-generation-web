import { Play, Loader2 } from "lucide-react";
import ScriptPanel from "./ScriptPanel";
import SelectDropdown from "./SelectDropdown";

export default function ControlDesk({
  theme,
  script,
  setScript,
  voice,
  setVoice,
  voiceOptions,
  onVoiceUpload,
  uploadingVoice,
  avatar,
  setAvatar,
  avatarOptions,
  onAvatarUpload,
  uploadingAvatar,
  bgVideo,
  setBgVideo,
  videoOptions,
  onVideoUpload,
  uploadingVideo,
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
        options={voiceOptions}
        value={voice}
        onChange={setVoice}
        onUpload={onVoiceUpload}
        uploadAccept="audio/*"
        uploading={uploadingVoice}
      />

      <SelectDropdown
        theme={theme}
        heading="03 · AVATAR"
        kind="avatar"
        options={avatarOptions}
        value={avatar}
        onChange={setAvatar}
        onUpload={onAvatarUpload}
        uploadAccept="image/*"
        uploading={uploadingAvatar}
      />

      <SelectDropdown
        theme={theme}
        heading="04 · BACKGROUND"
        kind="video"
        options={videoOptions}
        value={bgVideo}
        onChange={setBgVideo}
        onUpload={onVideoUpload}
        uploadAccept="video/*"
        uploading={uploadingVideo}
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