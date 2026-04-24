"use client";

import { ONBOARDING_LS_KEY, type OnboardingProfile } from "@/lib/onboarding/types";
import type { SiteOnboardingCopy } from "@/types/site-settings";
import Link from "next/link";
import { useState } from "react";

type Props = { copy: SiteOnboardingCopy };

export function OnboardingClient({ copy }: Props) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<OnboardingProfile["goal"]>("");
  const [experience, setExperience] = useState<OnboardingProfile["experience"]>("");
  const [daysPerWeek, setDaysPerWeek] = useState<OnboardingProfile["daysPerWeek"]>(undefined);
  const [equipment, setEquipment] = useState("");
  const [routineMd, setRoutineMd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finish() {
    const profile: OnboardingProfile = {
      goal,
      experience,
      daysPerWeek,
      equipment: equipment.trim(),
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(ONBOARDING_LS_KEY, JSON.stringify(profile));
    setLoading(true);
    try {
      const res = await fetch("/api/coaching/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const body = (await res.json()) as { markdown?: string; error?: string };
      if (res.ok && body.markdown) {
        setRoutineMd(body.markdown);
        setStep(4);
        return;
      }
      setRoutineMd(copy.errorRoutineMd);
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-[11px] font-semibold tracking-[-0.01em] text-apple-subtle">{copy.eyebrow}</p>
      <h1 className="font-display mt-2 text-[1.75rem] font-bold tracking-[-0.02em] text-apple-ink">{copy.title}</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-apple-subtle">{copy.intro}</p>

      {step < 4 ? (
        <div className="mt-8 space-y-8">
          {step === 0 ? (
            <fieldset className="space-y-3">
              <legend className="text-[13px] font-semibold text-apple-ink">{copy.goalLegend}</legend>
              {(
                [
                  ["bulk", copy.goalBulk],
                  ["cut", copy.goalCut],
                  ["maintain", copy.goalMaintain],
                ] as const
              ).map(([v, lab]) => (
                <label key={v} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                  <input type="radio" name="goal" checked={goal === v} onChange={() => setGoal(v)} className="size-4 accent-black" />
                  <span className="text-[15px] font-medium text-apple-ink">{lab}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {step === 1 ? (
            <fieldset className="space-y-3">
              <legend className="text-[13px] font-semibold text-apple-ink">{copy.expLegend}</legend>
              {(
                [
                  ["beginner", copy.expBeginner],
                  ["intermediate", copy.expIntermediate],
                  ["advanced", copy.expAdvanced],
                ] as const
              ).map(([v, lab]) => (
                <label key={v} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                  <input type="radio" name="exp" checked={experience === v} onChange={() => setExperience(v)} className="size-4 accent-black" />
                  <span className="text-[15px] font-medium text-apple-ink">{lab}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset className="space-y-3">
              <legend className="text-[13px] font-semibold text-apple-ink">{copy.daysLegend}</legend>
              {([2, 3, 4, 5, 6] as const).map((n) => (
                <label key={n} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                  <input
                    type="radio"
                    name="days"
                    checked={daysPerWeek === n}
                    onChange={() => setDaysPerWeek(n)}
                    className="size-4 accent-black"
                  />
                  <span className="text-[15px] font-medium text-apple-ink">{copy.daysPerWeekTemplate.replace("{n}", String(n))}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {step === 3 ? (
            <label className="block">
              <span className="text-[13px] font-semibold text-apple-ink">{copy.equipmentLegend}</span>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-[15px] text-apple-ink shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder={copy.equipmentPlaceholder}
              />
            </label>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-[13px] font-semibold text-apple-ink"
              >
                {copy.back}
              </button>
            ) : null}
            {step < 3 ? (
              <button
                type="button"
                disabled={(step === 0 && !goal) || (step === 1 && !experience) || (step === 2 && !daysPerWeek)}
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full border border-black bg-black px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                {copy.next}
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => void finish()}
                className="rounded-full border border-black bg-black px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                {loading ? copy.generating : copy.submit}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-[13px] font-semibold text-emerald-800">{copy.savedTitle}</p>
          <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-[13px] leading-relaxed text-apple-ink">
            {routineMd}
          </pre>
          <Link href="/" className="inline-flex rounded-full border border-black bg-black px-6 py-2.5 text-[13px] font-semibold text-white">
            {copy.homeCta}
          </Link>
        </div>
      )}
    </div>
  );
}
