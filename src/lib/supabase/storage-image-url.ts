const OBJECT_PUBLIC = "/storage/v1/object/public/";
const RENDER_IMAGE_PUBLIC = "/storage/v1/render/image/public/";

/** Supabase Storage 공개 객체 URL (`…/object/public/{bucket}/…`) 여부 */
export function isSupabaseStoragePublicObjectUrl(url: string): boolean {
  try {
    return new URL(url).pathname.includes(OBJECT_PUBLIC);
  } catch {
    return false;
  }
}

export type SupabaseStorageImageTransform = {
  width: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
  /** `origin`이면 원본 포맷 유지. 생략 시 호스트가 WebP 등으로 자동 최적화(호스티드 Supabase 기준). */
  format?: "origin";
};

/**
 * 공개 객체 URL을 이미지 변환(render) URL로 바꿉니다.
 * 호스티드 프로젝트에서는 Storage 이미지 변환이 켜져 있어야 하며(대개 Pro),
 * 로컬/변환 비활성 시 4xx일 수 있으므로 `NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=0`으로 끌 수 있습니다.
 */
export function supabaseStoragePublicToRenderUrl(url: string, opts: SupabaseStorageImageTransform): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === "0") {
    return url;
  }
  if (!isSupabaseStoragePublicObjectUrl(url)) {
    return url;
  }
  try {
    const u = new URL(url);
    const i = u.pathname.indexOf(OBJECT_PUBLIC);
    if (i === -1) return url;
    const bucketAndPath = u.pathname.slice(i + OBJECT_PUBLIC.length);
    u.pathname = RENDER_IMAGE_PUBLIC + bucketAndPath;
    const w = Math.min(2500, Math.max(1, Math.round(opts.width)));
    u.searchParams.set("width", String(w));
    if (opts.height != null) {
      const h = Math.min(2500, Math.max(1, Math.round(opts.height)));
      u.searchParams.set("height", String(h));
    }
    u.searchParams.set("quality", String(opts.quality ?? 78));
    u.searchParams.set("resize", opts.resize ?? "cover");
    if (opts.format === "origin") {
      u.searchParams.set("format", "origin");
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** `SiteFillImage` 등에서 쓰는 표시용 URL (Supabase가 아니면 원본 그대로) */
export function siteAssetDisplayImageUrl(src: string, maxWidth: number, height?: number): string {
  return supabaseStoragePublicToRenderUrl(src, { width: maxWidth, height, resize: "cover" });
}
