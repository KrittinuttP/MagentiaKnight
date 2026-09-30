/** Shared HBD upload constraints — file size only (no pixel lock) */
export const HBD_CARD_TEMPLATE = {
  path: "/assets/hbd/template/hbd-card-template.png",
  /** Small copy for on-page display; `path` stays full-size for download */
  previewPath: "/assets/hbd/template/hbd-card-template-preview.jpg",
  filename: "roselia-hbd-card-template.png",
  /** Template art size (not enforced on upload) */
  suggestedWidth: 2000,
  suggestedHeight: 1414,
  /** Server-side cap, checked after client resize */
  maxBytes: 5 * 1024 * 1024,
  /** Largest original the browser will attempt to resize */
  maxInputBytes: 25 * 1024 * 1024,
  resize: { maxEdge: 2000, quality: 0.88 },
  accept: "image/jpeg,image/png,image/webp",
} as const;

export const HBD_AVATAR_DEFAULT = "/assets/hbd/default-avatar.jpg";

export const HBD_AVATAR_LIMITS = {
  maxBytes: 2 * 1024 * 1024,
  maxInputBytes: 15 * 1024 * 1024,
  resize: { maxEdge: 512, quality: 0.85 },
  accept: "image/jpeg,image/png,image/webp",
} as const;

/** e.g. HBD-Magentia_by_Seknight_มิลด์_อาร์.jpg */
export function hbdCardDownloadName(from: string) {
  const name = from.trim().replace(/[\\/:*?"<>|\s]+/g, "_") || "Seknight";
  return `HBD-Magentia_by_Seknight_${name}.jpg`;
}

export type HbdContactChannel = "x" | "discord";

export type HbdUploadDraft = {
  displayName: string;
  message: string;
  contactChannel: HbdContactChannel;
  contactHandle: string;
  cardFileName?: string;
  cardPreviewUrl?: string;
  avatarFileName?: string;
  avatarPreviewUrl?: string;
};
