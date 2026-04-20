"use client";

import type { RecentActivityItem } from "@/lib/dashboard/home-action-state";
import Link from "next/link";

const shell =
  "rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-5 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.04]";

type Props = {
  items: RecentActivityItem[];
  hydrated: boolean;
};

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "";
  }
}

export function RecentActivitySummaryCard({ items, hydrated }: Props) {
  return (
    <section className={shell} aria-labelledby="recent-activity-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="recent-activity-heading" className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">
          최근 활동
        </h2>
        <Link href="/performance" className="text-[11px] font-semibold text-apple-ink underline underline-offset-4 hover:opacity-60">
          전체 보기
        </Link>
      </div>

      {!hydrated ? (
        <p className="mt-4 text-[13px] text-apple-subtle">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-[13px] leading-relaxed text-apple-subtle">아직 저장된 세트가 없어요. 위에서 운동을 시작하고 첫 기록을 남겨 보세요.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((w) => (
            <li key={w.id} className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 last:border-0 last:pb-0 dark:border-zinc-800">
              <div className="min-w-0">
                <p className="truncate font-semibold text-apple-ink">{w.exerciseName}</p>
                <p className="mt-0.5 text-[12px] tabular-nums text-apple-subtle">{w.detail}</p>
              </div>
              <time className="shrink-0 text-[11px] font-medium tabular-nums text-apple-subtle" dateTime={w.createdAt}>
                {formatShortDate(w.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
