import female1 from "./assets/avatars/female1.jpg";
import female2 from "./assets/avatars/female2.jpg";
import male1 from "./assets/avatars/male1.jpg";
import male2 from "./assets/avatars/male2.jpg";
import video1 from "./assets/videos/video1.mp4";
import video2 from "./assets/videos/video2.mp4";
import video3 from "./assets/videos/video3.mp4";
import video4 from "./assets/videos/video4.mp4";

export const VOICES = [
  { id: "en-US-AriaNeural", name: "Aria", tag: "English (US) · Female" },
  { id: "en-US-GuyNeural", name: "Guy", tag: "English (US) · Male" },
  { id: "ur-PK-UzmaNeural", name: "Uzma", tag: "Urdu (PK) · Female" },
  { id: "ur-PK-AsadNeural", name: "Asad", tag: "Urdu (PK) · Male" },
];

export const AVATARS = [
  { id: "a1", label: "Female 01", hue: "#E63946", img: female1 },
  { id: "a2", label: "Female 02", hue: "#F2B705", img: female2 },
  { id: "a3", label: "Male 01", hue: "#2EC4B6", img: male1 },
  { id: "a4", label: "Male 02", hue: "#8E7DFF", img: male2 },
];

export const VIDEOS = [
  { id: "v1", label: "Studio 01", src: video1 },
  { id: "v2", label: "Studio 02", src: video2 },
  { id: "v3", label: "Studio 03", src: video3 },
  { id: "v4", label: "Studio 04", src: video4 },
];

export const STAGES = ["SCRIPT", "VOICE", "AVATAR", "RENDER"];
export const API_BASE = "http://localhost:9000";