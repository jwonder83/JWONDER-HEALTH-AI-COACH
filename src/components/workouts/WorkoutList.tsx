import { SiteFillImage } from "@/components/site/SiteFillImage";
import type { ImageSlot } from "@/types/site-settings";
import type { WorkoutRow } from "@/types/workout";

type Props = {
  items: WorkoutRow[];
  loading: boolean;
  listEmptyImage: ImageSlot;
  listEmptyTitle: string;
  listEmptySubtitle: string;
  onDeleteItem?: (id: string) => void;
};

const listShell =
  "overflow-hidden border border-neutral-200 bg-white shadow-sm backdrop-blur-md";

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
        <div key={i} className={`flex animate-pulse gap-4 py-4 ${i > 0 ? "border-t border-neutral-200" : ""}`}>
          <div className="size-12 shrink-0 rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-200/90" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-2/5 max-w-[10rem] rounded-lg bg-zinc-200/80" />
            <div className="h-3 w-3/5 max-w-[14rem] rounded-lg bg-zinc-100/90" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkoutList({ items, loading, listEmptyImage, listEmptyTitle, listEmptySubtitle, onDeleteItem }: Props) {
  if (loading) {
    return <Skeleton />;
  }

  if (items.length === 0) {
    return (
      <div
        className="relative overflow-hidden border border-neutral-200 bg-white shadow-sm"
      >
        <div className="relative aspect-[5/3] max-h-[220px] w-full sm:aspect-[2.3/1] sm:max-h-[240px]">
          <SiteFillImage
            src={listEmptyImage.src}
            alt={listEmptyImage.alt}
            className="object-[center_28%] saturate-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/92 to-white/20" aria-hidden />
        </div>
        <div className="relative -mt-14 px-6 pb-11 pt-2 text-center sm:-mt-16 sm:px-10">
          <p className="font-display text-[19px] font-semibold tracking-[-0.022em] text-apple-ink">{listEmptyTitle}</p>
          <p className="mt-2 text-[17px] font-normal leading-[1.47] tracking-[-0.01em] text-apple-subtle">{listEmptySubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <ul className={listShell}>
      {items.map((w, i) => (
        <li key={w.id} className={`relative ${i > 0 ? "border-t border-neutral-200" : ""}`}>
          <div className="group flex flex-col gap-3 border-l-2 border-transparent px-5 py-4 transition-[background-color,border-color] duration-200 hover:border-black hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-200/95 text-[15px] font-semibold tracking-[-0.02em] text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-black/[0.06] transition-transform duration-200 group-hover:scale-[1.02]"
                aria-hidden
              >
                {w.exercise_name.trim().charAt(0) || "·"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[17px] font-semibold tracking-[-0.02em] text-apple-ink">{w.exercise_name}</p>
                <p className="mt-0.5 text-[15px] text-apple-subtle">
                  <span className="font-medium text-apple-ink/85">{Number(w.weight_kg)}kg</span>
                  <span className="mx-2 text-zinc-300">·</span>
                  {w.reps}회 × {w.sets}세트
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
              <span
                className={
                  w.success
                    ? "border border-neutral-300 bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-apple-ink"
                    : "border border-neutral-400 bg-neutral-200 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-apple-ink"
                }
              >
                {w.success ? "성공" : "실패"}
              </span>
              <time className="text-[12px] tabular-nums text-apple-subtle">{formatDate(w.created_at)}</time>
              {onDeleteItem ? (
                <button
                  type="button"
                  onClick={() => onDeleteItem(w.id)}
                  className="border border-neutral-300 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-apple-subtle transition hover:border-black hover:text-apple-ink"
                >
                  삭제
                </button>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
