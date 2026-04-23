"use client";

import type { PaywallReason } from "@/types/subscription";
import { useMemo } from "react";

type Props = {
  open: boolean;
  reason: PaywallReason | null;
  onClose: () => void;
  onPay: () => void;
  busy?: boolean;
};

function reasonCopy(reason: PaywallReason | null): { sub: string } {
  switch (reason) {
    case "ai_daily_limit":
      return { sub: "오늘 무료 AI 코칭은 이미 사용했어요. 프리미엄에서 무제한으로 이어가요." };
    case "routine_weekly_limit":
      return { sub: "이번 주 무료 루틴 생성 횟수를 모두 썼어요. 자동 생성·최적화는 프리미엄 기능이에요." };
    case "workout_complete":
      return { sub: "오늘 완벽한 흐름이에요. 프리미엄이면 방금 세션까지 합쳐 AI가 더 깊게 짚어줘요." };
    case "streak_3":
      return { sub: "3일 연속 성공 중이에요. 이 리듬을 유지하려면 AI 코치를 풀가동해 보세요." };
    case "report_unlock":
      return { sub: "주간 리포트·패턴 분석은 프리미엄에서 선명하게 확인할 수 있어요." };
    default:
      return { sub: "개인화 코칭, 루틴 자동 최적화, 데이터 기반 분석을 한 번에 켜요." };
  }
}

export function PaywallModal({ open, reason, onClose, onPay, busy }: Props) {
  const subline = useMemo(() => reasonCopy(reason).sub, [reason]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full px-2 py-1 text-[12px] font-semibold text-apple-subtle hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          닫기
        </button>

        <div className="p-6 pb-5 pt-10 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400/90">프리미엄</p>
          <h2 id="paywall-title" className="font-display mt-2 text-[1.45rem] font-bold tracking-[-0.03em] text-apple-ink dark:text-zinc-100">
            AI 코치를 잠금 해제하세요
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-apple-subtle dark:text-zinc-400">{subline}</p>

          <ul className="mt-5 space-y-2.5 text-[14px] font-medium text-apple-ink dark:text-zinc-200">
            <li className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>
                ✓
              </span>
              개인화 코칭 (기록·부위·주간 흐름 반영)
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>
                ✓
              </span>
              루틴 자동 최적화
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>
                ✓
              </span>
              데이터 기반 분석·주간 리포트
            </li>
          </ul>

          <p className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-[14px] font-bold text-apple-ink dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
            단건 결제 <span className="tabular-nums">₩4,900</span>
            <span className="mt-1 block text-[11px] font-semibold text-apple-subtle dark:text-zinc-500">PortOne 단건 결제</span>
          </p>

          <div className="mt-6">
            <button
              type="button"
              disabled={busy}
              onClick={onPay}
              className="w-full rounded-xl border-2 border-emerald-600 bg-emerald-600 py-3.5 text-[15px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {busy ? "결제창 여는 중…" : "프리미엄 구독하기 (₩4,900)"}
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-apple-subtle dark:text-zinc-500">
            카드 결제는 PortOne(구 아임포트) 창에서 진행됩니다. &quot;등록된 PG 설정 정보가 없습니다&quot;가 뜨면 PortOne 관리자 콘솔에서 KG이니시스(또는 사용할 PG)를
            결제 연동으로 추가한 뒤, <span className="font-mono">NEXT_PUBLIC_PORTONE_PG</span> 값을 콘솔에 표시된 채널과 맞춰 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
