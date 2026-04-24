"use client";

import { siteAssetDisplayImageUrl } from "@/lib/supabase/storage-image-url";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** LCP 등 우선 로드 */
  priority?: boolean;
  /** 최대 표시 너비(px). Supabase Storage 공개 URL이면 변환 API로 리사이즈·용량 최적화 */
  maxDisplayWidth?: number;
  /** 이미지가 덮기 전 보이는 단색 레이어(Tailwind 클래스). CLS·가독성용 */
  placeholderClassName?: string;
  /** `sizes` 힌트(반응형 폭 추정). 생략 시 `100vw` */
  sizes?: string;
  /** 로드 완료 후 페이드인(기본 true) */
  fadeIn?: boolean;
};

export function SiteFillImage({
  src,
  alt,
  className,
  priority,
  maxDisplayWidth = 1600,
  placeholderClassName = "bg-zinc-900",
  sizes = "100vw",
  fadeIn = true,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const displaySrc = useMemo(() => siteAssetDisplayImageUrl(src, maxDisplayWidth), [src, maxDisplayWidth]);

  useEffect(() => {
    setLoaded(false);
  }, [displaySrc]);

  const onLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const setImgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  const imgBase =
    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none";
  const opacityCls = fadeIn ? (loaded ? "opacity-100" : "opacity-0") : "opacity-100";

  return (
    <>
      <div className={["pointer-events-none absolute inset-0", placeholderClassName].filter(Boolean).join(" ")} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={setImgRef}
        src={displaySrc}
        alt={alt}
        sizes={sizes}
        className={[imgBase, opacityCls, className].filter(Boolean).join(" ")}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        onLoad={onLoad}
      />
    </>
  );
}
