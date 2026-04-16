type Props = {
  src: string;
  alt: string;
  className?: string;
  /** LCP 등 우선 로드 */
  priority?: boolean;
};

/** DB·관리자에서 온 임의 URL용( next/image 원격 도메인 제한 없음 ) */
export function SiteFillImage({ src, alt, className, priority }: Props) {
  const cls = ["absolute inset-0 h-full w-full object-cover", className].filter(Boolean).join(" ");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cls} loading={priority ? "eager" : "lazy"} decoding="async" />
  );
}
