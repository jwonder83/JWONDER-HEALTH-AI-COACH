import { SiteFillImage } from "@/components/site/SiteFillImage";

const figureRing =
  "overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.08)] ring-1 ring-neutral-100";

type FigureProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

/** 관리자 업로드(Supabase 등) URL은 `next/image` 원격 허용 목록과 어긋날 수 있어 `SiteFillImage`(일반 img) 사용 */
export function GuideFigure({ src, alt, priority = false, className = "mt-5" }: FigureProps) {
  return (
    <figure className={`${figureRing} ${className}`}>
      <div className="relative aspect-[16/9] w-full">
        <SiteFillImage src={src} alt={alt} priority={priority} />
      </div>
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
        참고용 YouTube 영상이에요. 서비스와 채널은 제휴 관계가 아니며, 영상 내용은 보증하지 않아요.
      </figcaption>
    </figure>
  );
}
