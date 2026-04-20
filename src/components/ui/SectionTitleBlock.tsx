import type { ReactNode } from "react";

type Props = {
  step: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  right?: ReactNode;
  /** 상단 장식 바 (그라데이션) */
  showAccent?: boolean;
  className?: string;
};

export function SectionTitleBlock({
  step,
  eyebrow,
  title,
  description,
  right,
  showAccent = true,
  className = "",
}: Props) {
  return (
    <header className={`relative mb-6 sm:mb-10 ${className}`}>
      {showAccent ? (
        <div className="mb-5 h-px w-12 bg-apple-ink sm:mb-6 sm:w-16" aria-hidden />
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <div
            className="font-display flex size-11 shrink-0 items-center justify-center rounded-lg border border-apple-ink/80 bg-white text-sm font-semibold text-apple-ink sm:size-12 sm:text-base"
            aria-hidden
          >
            {step}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] font-medium tracking-[-0.01em] text-apple-subtle sm:text-[12px]">{eyebrow}</p>
            <h2 className="font-display mt-1.5 text-[1.45rem] font-bold leading-snug tracking-[-0.02em] text-apple-ink sm:text-[1.65rem]">
              {title}
            </h2>
            {description ? (
              <div className="mt-2 max-w-2xl text-[13px] leading-snug text-apple-subtle sm:text-[14px]">{description}</div>
            ) : null}
          </div>
        </div>
        {right ? <div className="flex shrink-0 items-start pt-1">{right}</div> : null}
      </div>
    </header>
  );
}
