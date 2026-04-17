import type { ProgramBuiltinImages, SiteImagesConfig } from "@/types/site-settings";

export const SITE_ASSETS_BUCKET = "site-assets";

/** `/program` 내장 가이드 이미지 — `site-assets` 폴더명 (사이트 `hero` 등과 충돌 방지) */
export const PROGRAM_BUILTIN_IMAGE_STORAGE_SLOTS = [
  "program_hero",
  "program_barbell",
  "program_plates",
  "program_calm",
  "program_athlete",
  "program_stretch",
  "program_kettle",
  "program_rack",
] as const;

export type ProgramBuiltinImageStorageSlot = (typeof PROGRAM_BUILTIN_IMAGE_STORAGE_SLOTS)[number];

export const PROGRAM_BUILTIN_IMAGE_SLOT_FOR_KEY: Record<keyof ProgramBuiltinImages, ProgramBuiltinImageStorageSlot> = {
  hero: "program_hero",
  barbell: "program_barbell",
  plates: "program_plates",
  calm: "program_calm",
  athlete: "program_athlete",
  stretch: "program_stretch",
  kettle: "program_kettle",
  rack: "program_rack",
};

export const SITE_IMAGE_SLOTS = [
  "headerLogo",
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
