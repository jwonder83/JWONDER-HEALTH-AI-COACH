"use client";

import { ONBOARDING_LS_KEY, type OnboardingProfile } from "@/lib/onboarding/types";
import Link from "next/link";
import { useState } from "react";

export function OnboardingClient() {
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
      setRoutineMd("루틴 초안을 불러오지 못했습니다. 홈으로 이동한 뒤 다시 시도해 주세요.");
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-[11px] font-semibold tracking-[-0.01em] text-apple-subtle">시작 설정</p>
      <h1 className="font-display mt-2 text-[1.75rem] font-bold tracking-[-0.02em] text-apple-ink">프로필에 맞춘 루틴</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-apple-subtle">네 가지 질문에 답하면 주간 루틴 초안을 생성합니다.</p>

      {step < 4 ? (
        <div className="mt-8 space-y-8">
          {step === 0 ? (
            <fieldset className="space-y-3">
              <legend className="text-[13px] font-semibold text-apple-ink">1. 운동 목표</legend>
              {(
                [
                  ["bulk", "벌크업·힘 키우기"],
                  ["cut", "컷·체지방 줄이기"],
                  ["maintain", "유지·건강 관리"],
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
              <legend className="text-[13px] font-semibold text-apple-ink">2. 운동 경력</legend>
              {(
                [
                  ["beginner", "입문 ~ 1년 차"],
                  ["intermediate", "1~3년 차"],
                  ["advanced", "3년 이상 꾸준히"],
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
              <legend className="text-[13px] font-semibold text-apple-ink">3. 일주일에 몇 번?</legend>
              {([2, 3, 4, 5, 6] as const).map((n) => (
                <label key={n} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                  <input
                    type="radio"
                    name="days"
                    checked={daysPerWeek === n}
                    onChange={() => setDaysPerWeek(n)}
                    className="size-4 accent-black"
                  />
                  <span className="text-[15px] font-medium text-apple-ink">주 {n}회</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {step === 3 ? (
            <label className="block">
              <span className="text-[13px] font-semibold text-apple-ink">4. 이용 가능한 장비</span>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-[15px] text-apple-ink shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="예: 바벨, 스미스, 케이블, 덤벨 2~20kg"
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
                뒤로
              </button>
            ) : null}
            {step < 3 ? (
              <button
                type="button"
                disabled={(step === 0 && !goal) || (step === 1 && !experience) || (step === 2 && !daysPerWeek)}
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full border border-black bg-black px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                다음
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => void finish()}
                className="rounded-full border border-black bg-black px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                {loading ? "초안 생성 중…" : "루틴 초안 생성"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-[13px] font-semibold text-emerald-800">프로필이 저장되었습니다.</p>
          <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-[13px] leading-relaxed text-apple-ink">
            {routineMd}
          </pre>
          <Link href="/" className="inline-flex rounded-full border border-black bg-black px-6 py-2.5 text-[13px] font-semibold text-white">
            홈으로 이동
          </Link>
        </div>
      )}
    </div>
  );
}
