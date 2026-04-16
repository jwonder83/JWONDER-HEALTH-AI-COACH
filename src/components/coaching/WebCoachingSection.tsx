"use client";

import { SiteFillImage } from "@/components/site/SiteFillImage";
import { mapCoachingLogRow } from "@/lib/coaching/map-db-row";
import { createClient } from "@/lib/supabase/client";
import type { CoachingLogRow } from "@/types/coaching";
import type { ImageSlot } from "@/types/site-settings";
import type { WorkoutRow } from "@/types/workout";
import { useCallback, useEffect, useState } from "react";

type Props = {
  userId: string;
  workoutsSnapshot: WorkoutRow[];
  coachingImage: ImageSlot;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  historyTitle: string;
  /** 카드 내부 제목·설명 숨김(상단 SectionTitleBlock과 중복 방지) */
  omitInnerTitle?: boolean;
};

const shell =
  "overflow-hidden rounded-[2rem] border border-orange-100/90 bg-white/90 shadow-[0_16px_48px_-20px_rgba(233,75,60,0.12)] ring-1 ring-orange-50/80 backdrop-blur-md sm:rounded-[2.25rem]";

function formatLogDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function WebCoachingSection({
  userId,
  workoutsSnapshot,
  coachingImage,
  eyebrow,
  title,
  description,
  buttonLabel,
  historyTitle,
  omitInnerTitle = false,
}: Props) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<CoachingLogRow[]>([]);

  const loadLogs = useCallback(async () => {
    const supabase = createClient();
    const { data, error: qErr } = await supabase
      .from("coaching_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);
    if (qErr) {
      setLogs([]);
      return;
    }
    setLogs((data ?? []).map((r) => mapCoachingLogRow(r as Record<string, unknown>)));
  }, [userId]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  async function run() {
    setError(null);
    setText(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workouts: workoutsSnapshot }),
      });
      const body = (await res.json()) as { coaching?: string; error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "코칭 요청에 실패했습니다.");
      }
      const coaching = body.coaching ?? "";
      setText(coaching);

      const supabase = createClient();
      const { error: insErr } = await supabase.from("coaching_logs").insert({
        user_id: userId,
        body: coaching,
      });
      if (!insErr) {
        await loadLogs();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || workoutsSnapshot.length === 0;

  return (
    <div className={shell} role="region" aria-label={title}>
      <div className="grid gap-0 lg:grid-cols-[1fr_min(38%,300px)]">
        <div className="border-b border-orange-100/80 p-8 sm:border-b-0 sm:border-r sm:p-10">
          {omitInnerTitle ? null : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple">{eyebrow}</p>
              <h2 className="font-display mt-3 text-[1.5rem] font-bold tracking-[-0.02em] text-apple-ink sm:text-[1.75rem]">{title}</h2>
              <p className="mt-3 max-w-md text-[17px] font-normal leading-[1.47] tracking-[-0.012em] text-apple-subtle">{description}</p>
            </>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={run}
            className={`rounded-full bg-gradient-to-br from-apple to-[#ff8a7a] px-8 py-2.5 text-[15px] font-bold text-white shadow-[0_2px_0_rgba(255,255,255,0.35)_inset,0_10px_28px_-6px_rgba(233,75,60,0.4)] transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${omitInnerTitle ? "mt-0" : "mt-8"}`}
          >
            {loading ? "불러오는 중…" : buttonLabel}
          </button>
          {error ? (
            <p className="mt-6 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-[15px] leading-snug text-rose-800 shadow-sm">
              {error}
            </p>
          ) : null}
          {loading ? (
            <div className="mt-8 space-y-3 rounded-xl border border-orange-100/90 bg-u-lavender/15 p-5 shadow-inner">
              <div className="h-4 w-2/5 max-w-[12rem] animate-pulse rounded-lg bg-zinc-200/90" />
              <div className="h-3 w-full animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-3 w-[92%] animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-3 w-4/5 animate-pulse rounded-lg bg-zinc-100" />
            </div>
          ) : null}
          {text ? (
            <article className="mt-8 whitespace-pre-wrap rounded-xl border border-orange-100/90 bg-white/90 px-5 py-4 text-[17px] font-normal leading-[1.55] tracking-[-0.01em] text-apple-ink shadow-sm">
              {text}
            </article>
          ) : null}

          {logs.length > 0 ? (
            <div className="mt-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple">{historyTitle}</p>
              <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-xl border border-orange-100/90 bg-u-mint/20 p-3">
                {logs.map((log) => (
                  <li key={log.id} className="border-b border-orange-100/70 pb-2 last:border-0 last:pb-0">
                    <p className="text-[11px] font-medium text-apple-subtle">{formatLogDate(log.created_at)}</p>
                    <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-apple-ink">{log.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="relative min-h-[200px] w-full sm:min-h-[220px] lg:min-h-full">
          <SiteFillImage src={coachingImage.src} alt={coachingImage.alt} className="saturate-[1.02]" />
          <div
            className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent sm:bg-gradient-to-r sm:from-white/95 sm:via-white/30 sm:to-transparent lg:from-white/90 lg:via-transparent lg:to-zinc-900/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_100%_100%,rgba(233,75,60,0.1),transparent)] sm:hidden"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
