import Image from "next/image";

const figureRing =
  "overflow-hidden rounded-2xl border border-orange-100/85 bg-white shadow-[0_16px_48px_-20px_rgba(233,75,60,0.18)] ring-1 ring-orange-50/70";

type FigureProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

export function GuideFigure({ src, alt, priority = false, className = "mt-5" }: FigureProps) {
  return (
    <figure className={`${figureRing} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={675}
        className="aspect-[16/9] w-full object-cover"
        sizes="(max-width: 640px) 100vw, 896px"
        priority={priority}
      />
    </figure>
  );
}

type EmbedProps = { id: string; title: string };

export function YouTubeEmbed({ id, title }: EmbedProps) {
  return (
    <figure className="mt-5">
      <div className={`relative aspect-video w-full ${figureRing}`}>
        <iframe
          className="absolute left-0 top-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption className="mt-2 text-[12px] leading-snug text-apple-subtle">
        참고용 교육 영상(YouTube). 본 서비스와 채널 간 제휴·보증 관계는 없습니다.
      </figcaption>
    </figure>
  );
}
