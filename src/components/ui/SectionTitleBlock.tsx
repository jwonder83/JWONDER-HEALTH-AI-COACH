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
            className="font-display flex size-11 shrink-0 items-center justify-center border border-apple-ink bg-white text-sm font-semibold text-apple-ink sm:size-12 sm:text-base"
            aria-hidden
          >
            {step}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-apple-subtle sm:text-[11px]">{eyebrow}</p>
            <h2 className="font-display mt-1.5 text-[1.5rem] font-bold leading-[1.15] tracking-[-0.02em] text-apple-ink sm:text-[1.75rem]">
              {title}
            </h2>
            {description ? (
              <div className="mt-2 max-w-2xl text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]">{description}</div>
            ) : null}
          </div>
        </div>
        {right ? <div className="flex shrink-0 items-start pt-1">{right}</div> : null}
      </div>
    </header>
  );
}
