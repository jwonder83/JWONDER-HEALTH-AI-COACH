export type BodyWeightEntry = {
  /** ISO 날짜 문자열 (YYYY-MM-DD) */
  day: string;
  kg: number;
};

const KEY = "jws_bodyweight_v1";
const MAX = 120;

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loadBodyWeights(): BodyWeightEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    const out: BodyWeightEntry[] = [];
    for (const x of arr) {
      if (!x || typeof x !== "object") continue;
      const o = x as Record<string, unknown>;
      if (typeof o.day !== "string" || typeof o.kg !== "number") continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(o.day)) continue;
      if (o.kg <= 0 || o.kg > 500) continue;
      out.push({ day: o.day, kg: Math.round(o.kg * 10) / 10 });
    }
    return out.sort((a, b) => (a.day < b.day ? -1 : 1));
  } catch {
    return [];
  }
}

export function saveBodyWeights(entries: BodyWeightEntry[]) {
  if (typeof window === "undefined") return;
  const sorted = [...entries].sort((a, b) => (a.day < b.day ? -1 : 1)).slice(-MAX);
  localStorage.setItem(KEY, JSON.stringify(sorted));
}

export function upsertBodyWeight(day: string, kg: number): BodyWeightEntry[] {
  const cur = loadBodyWeights();
  const next = cur.filter((e) => e.day !== day);
  next.push({ day, kg: Math.round(kg * 10) / 10 });
  saveBodyWeights(next);
  return loadBodyWeights();
}

export function todayKey(): string {
  return dayKey(new Date());
}
