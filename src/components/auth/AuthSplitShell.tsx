"use client";

import { SiteFillImage } from "@/components/site/SiteFillImage";
import type { ImageSlot } from "@/types/site-settings";
import type { ReactNode } from "react";

type Props = {
  panelImage: ImageSlot;
  eyebrow: string;
  panelTitle: string;
  panelDescription: string;
  children: ReactNode;
};

export function AuthSplitShell({ panelImage, eyebrow, panelTitle, panelDescription, children }: Props) {
  return (
    <div className="relative min-h-screen bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* 데스크톱: 좌측 풀블리드 이미지 */}
        <div className="relative hidden min-h-screen lg:block">
          <SiteFillImage
            src={panelImage.src}
            alt={panelImage.alt}
            priority
            className="object-[center_20%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/70 to-zinc-950/15"
            aria-hidden
          />
          <div className="absolute inset-0 flex flex-col justify-end p-10 xl:p-14">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/65">{eyebrow}</p>
            <h2 className="font-display mt-3 max-w-md text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white xl:text-[2.25rem]">
              {panelTitle}
            </h2>
            <p className="mt-4 max-w-sm text-[17px] font-normal leading-[1.45] tracking-[-0.012em] text-white/72">{panelDescription}</p>
          </div>
        </div>

        {/* 모바일: 상단 이미지 띠 */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden lg:hidden">
          <SiteFillImage
            src={panelImage.src}
            alt={panelImage.alt}
            priority
            className="object-[center_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-zinc-900/30 to-transparent" aria-hidden />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">{eyebrow}</p>
            <p className="mt-1 text-[1.125rem] font-semibold tracking-[-0.02em] text-white">{panelTitle}</p>
          </div>
        </div>

        {/* 폼 영역 */}
        <div className="relative flex flex-col justify-center px-5 py-12 sm:px-8 lg:px-12 lg:py-16 xl:px-16">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_0%,rgba(255,255,255,0.9),transparent_52%)] lg:bg-neutral-50"
            aria-hidden
          />
          <div className="mx-auto w-full max-w-[440px]">
            <div className="border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
