import type { SiteImagesConfig } from "@/types/site-settings";

export const SITE_ASSETS_BUCKET = "site-assets";

export const SITE_IMAGE_SLOTS = [
  "hero",
  "authPanel",
  "dashTile1",
  "dashTile2",
  "dashTile3",
  "coaching",
  "listEmpty",
] as const satisfies readonly (keyof SiteImagesConfig)[];

export type SiteImageSlot = (typeof SITE_IMAGE_SLOTS)[number];

export const SITE_IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const SITE_IMAGE_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
