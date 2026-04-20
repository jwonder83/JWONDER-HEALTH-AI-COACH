import { SiteFillImage } from "@/components/site/SiteFillImage";
import { aggregateVolumeByMuscle, type MuscleGroupId } from "@/lib/workouts/exercise-muscle-group";
import {
  computeWorkoutRowInsights,
  countVolumePrs,
  totalVolume,
  type WorkoutRowInsight,
} from "@/lib/workouts/row-insights";
import type { ImageSlot } from "@/types/site-settings";
import type { WorkoutRow } from "@/types/workout";
import { useMemo, type ReactNode } from "react";

type Props = {
  items: WorkoutRow[];
  loading: boolean;
  listEmptyImage: ImageSlot;
  listEmptyTitle: string;
  listEmptySubtitle: string;
  onDeleteItem?: (id: string) => void;
};

const listShell =
  "overflow-hidden border border-neutral-200 bg-white shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950";

const BAR_BG: Record<MuscleGroupId, string> = {
  chest: "bg-rose-500",
  back: "bg-violet-600",
  shoulders: "bg-sky-500",
  arms: "bg-amber-500",
  legs: "bg-emerald-600",
  core: "bg-cyan-500",
  full: "bg-neutral-500 dark:bg-zinc-400",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function Skeleton() {
  return (
    <div className={`${listShell} p-5`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex animate-pulse gap-4 py-4 ${i > 0 ? "border-t border-neutral-200 dark:border-zinc-800" : ""}`}>
          <div className="size-12 shrink-0 rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-200/90 dark:from-zinc-800 dark:to-zinc-900" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-2/5 max-w-[10rem] rounded-lg bg-zinc-200/80 dark:bg-zinc-700" />
            <div className="h-3 w-3/5 max-w-[14rem] rounded-lg bg-zinc-100/90 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeltaBadges({
  volumePct,
  weightPct,
}: {
  volumePct: number | null;
  weightPct: number | null;
}) {
  const nodes: ReactNode[] = [];
  if (volumePct !== null) {
    const up = volumePct > 0;
    const flat = volumePct === 0;
    nodes.push(
      <span
        key="v"
        className={
          flat
            ? "rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900"
            : up
              ? "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        }
      >
        볼륨 {flat ? "유지" : `${up ? "+" : ""}${volumePct}%`}
      </span>,
    );
  }
  if (weightPct !== null) {
    const up = weightPct > 0;
    const flat = weightPct === 0;
    nodes.push(
      <span
        key="w"
        className={
          flat
            ? "rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900"
            : up
              ? "rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300"
              : "rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200"
        }
      >
        중량 {flat ? "유지" : `${up ? "+" : ""}${weightPct}%`}
      </span>,
    );
  }
  if (nodes.length === 0) return null;
  return <div className="mt-2 flex flex-wrap gap-1.5">{nodes}</div>;
}

function PerformanceOverview({
  items,
  insights,
}: {
  items: WorkoutRow[];
  insights: Map<string, WorkoutRowInsight>;
}) {
  const volTotal = useMemo(() => totalVolume(items), [items]);
  const prCount = useMemo(() => countVolumePrs(items, insights), [items, insights]);
  const muscleSlices = useMemo(() => aggregateVolumeByMuscle(items), [items]);
  const muscleTotal = muscleSlices.reduce((a, s) => a + s.volume, 0) || 1;

  return (
    <div className="border-b border-neutral-200 bg-gradient-to-b from-neutral-50/90 to-white px-4 py-5 dark:border-zinc-800 dark:from-zinc-900/80 dark:to-zinc-950 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-apple-subtle">성과 요약</p>
          <h3 className="font-display mt-1 text-[1.25rem] font-bold tracking-[-0.02em] text-apple-ink dark:text-zinc-100 sm:text-[1.4rem]">기록 분석</h3>
          <p className="mt-1 max-w-md text-[13px] leading-relaxed text-apple-subtle">볼륨·PR·부위 비중은 저장된 세트를 자동으로 묶어 보여 줘요.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple-subtle">누적 볼륨</p>
          <p className="font-display mt-1 text-[1.35rem] font-bold tabular-nums text-apple-ink dark:text-zinc-100">{volTotal}</p>
          <p className="mt-0.5 text-[11px] text-apple-subtle">kg×회×세트 합</p>
        </div>
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900/80 dark:text-amber-200/90">볼륨 PR</p>
          <p className="font-display mt-1 text-[1.35rem] font-bold tabular-nums text-amber-950 dark:text-amber-100">{prCount}회</p>
          <p className="mt-0.5 text-[11px] text-amber-900/70 dark:text-amber-200/70">종목별 최고 갱신</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm sm:col-span-1 dark:border-zinc-800 dark:bg-zinc-900/80">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple-subtle">총 세트 행</p>
          <p className="font-display mt-1 text-[1.35rem] font-bold tabular-nums text-apple-ink dark:text-zinc-100">{items.length}</p>
          <p className="mt-0.5 text-[11px] text-apple-subtle">저장 건수</p>
        </div>
      </div>

      {muscleSlices.length > 0 ? (
        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">부위별 볼륨 비중(추정)</p>
          <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-zinc-800" aria-hidden>
            {muscleSlices.map((s) => (
              <div
                key={s.id}
                className={`${BAR_BG[s.id]} min-w-0 transition-[flex-grow]`}
                style={{ flexGrow: s.volume, flexBasis: 0 }}
                title={`${s.label} ${Math.round((s.volume / muscleTotal) * 100)}%`}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            {muscleSlices.map((s) => (
              <li key={s.id} className="flex items-center gap-1.5 tabular-nums text-apple-subtle">
                <span className={`size-2.5 shrink-0 rounded-sm ${BAR_BG[s.id]}`} aria-hidden />
                <span className="font-medium text-apple-ink dark:text-zinc-200">{s.label}</span>
                <span>{Math.round((s.volume / muscleTotal) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function WorkoutList({ items, loading, listEmptyImage, listEmptyTitle, listEmptySubtitle, onDeleteItem }: Props) {
  const insights = useMemo(() => (items.length > 0 ? computeWorkoutRowInsights(items) : new Map()), [items]);

  if (loading) {
    return <Skeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden border border-neutral-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative aspect-[5/3] max-h-[220px] w-full sm:aspect-[2.3/1] sm:max-h-[240px]">
          <SiteFillImage
            src={listEmptyImage.src}
            alt={listEmptyImage.alt}
            className="object-[center_28%] saturate-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/92 to-white/20 dark:from-zinc-950 dark:via-zinc-950/92 dark:to-zinc-950/20" aria-hidden />
        </div>
        <div className="relative -mt-14 px-6 pb-11 pt-2 text-center sm:-mt-16 sm:px-10">
          <p className="font-display text-[19px] font-semibold tracking-[-0.022em] text-apple-ink dark:text-zinc-100">{listEmptyTitle}</p>
          <p className="mt-2 text-[17px] font-normal leading-[1.47] tracking-[-0.01em] text-apple-subtle">{listEmptySubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={listShell}>
      <PerformanceOverview items={items} insights={insights} />
      <ul>
        {items.map((w, i) => {
          const row = insights.get(w.id);
          const vol = row?.volume ?? Math.round(Number(w.weight_kg) * w.reps * w.sets * 10) / 10;
          return (
            <li key={w.id} className={`relative ${i > 0 ? "border-t border-neutral-200 dark:border-zinc-800" : ""}`}>
              <div className="group flex flex-col gap-3 px-4 py-4 transition-[background-color] duration-200 hover:bg-neutral-50/90 dark:hover:bg-zinc-900/60 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-200/95 text-[15px] font-semibold tracking-[-0.02em] text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-black/[0.06] transition-transform duration-200 group-hover:scale-[1.02] dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-300 dark:ring-white/10"
                    aria-hidden
                  >
                    {w.exercise_name.trim().charAt(0) || "·"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[17px] font-semibold tracking-[-0.02em] text-apple-ink dark:text-zinc-100">{w.exercise_name}</p>
                      {row?.muscleLabel ? (
                        <span className="shrink-0 rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900">
                          {row.muscleLabel}
                        </span>
                      ) : null}
                      {row?.isVolumePr ? (
                        <span className="shrink-0 rounded-full border border-amber-300 bg-gradient-to-r from-amber-100 to-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-950 shadow-sm dark:border-amber-700/60 dark:from-amber-950/80 dark:to-amber-900/40 dark:text-amber-100">
                          PR
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[14px] text-apple-subtle">
                      <span className="font-semibold text-apple-ink dark:text-zinc-200">{Number(w.weight_kg)}kg</span>
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
                      {w.reps}회 × {w.sets}세트
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
                      <span className="font-semibold text-apple-ink dark:text-zinc-200">볼륨 {vol}</span>
                    </p>
                    <DeltaBadges volumePct={row?.volumeDeltaPct ?? null} weightPct={row?.weightDeltaPct ?? null} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-2 dark:border-zinc-800/80 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0">
                  <span
                    className={
                      w.success
                        ? "border border-emerald-200/90 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "border border-neutral-300 bg-neutral-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-apple-ink dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }
                  >
                    {w.success ? "성공" : "실패"}
                  </span>
                  <time className="text-[12px] tabular-nums text-apple-subtle">{formatDate(w.created_at)}</time>
                  {onDeleteItem ? (
                    <button
                      type="button"
                      onClick={() => onDeleteItem(w.id)}
                      className="border border-neutral-300 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-apple-subtle transition hover:border-black hover:text-apple-ink dark:border-zinc-600 dark:bg-zinc-900 dark:hover:border-zinc-400"
                    >
                      삭제
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
