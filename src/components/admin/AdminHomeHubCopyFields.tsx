"use client";

import type { ReactNode } from "react";
import type { SiteHomeHubCopy } from "@/types/site-home-hub-copy";

type Props = {
  value: SiteHomeHubCopy;
  onChange: (next: SiteHomeHubCopy) => void;
};

function Field({
  label,
  rows,
  v,
  onText,
}: {
  label: string;
  rows: number;
  v: string;
  onText: (t: string) => void;
}) {
  return (
    <label className={`block text-[12px] font-medium text-apple-subtle ${rows >= 3 ? "sm:col-span-2" : ""}`}>
      {label}
      {rows > 1 ? (
        <textarea
          rows={rows}
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={v}
          onChange={(e) => onText(e.target.value)}
        />
      ) : (
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={v}
          onChange={(e) => onText(e.target.value)}
        />
      )}
    </label>
  );
}

function Subgrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-2">{children}</div>;
}

/** `/admin/site` — 홈 상단 액션 허브·기록 목록 인사이트 문구 */
export function AdminHomeHubCopyFields({ value: hb, onChange }: Props) {
  const p = onChange;

  return (
    <section className="mb-10 space-y-8">
      <div>
        <h2 className="text-[15px] font-semibold text-apple-ink">홈 상단·기록 목록 (액션 허브)</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-apple-subtle">
          메인(/) 최상단 CTA, 「기록·분석·코치」 영역(리본·플랜·히어로 카드·한 줄 요약), 온보딩 배너, 기록 섹션 상단 요약 블록 문구입니다.{" "}
          <code className="rounded bg-neutral-100 px-1 text-[11px]">{"{seconds}"}</code>{" "}
          <code className="rounded bg-neutral-100 px-1 text-[11px]">{"{pct}"}</code>{" "}
          <code className="rounded bg-neutral-100 px-1 text-[11px]">{"{current}"}</code>{" "}
          <code className="rounded bg-neutral-100 px-1 text-[11px]">{"{target}"}</code>{" "}
          <code className="rounded bg-neutral-100 px-1 text-[11px]">{"{reps}"}</code>{" "}
          <code className="rounded bg-neutral-100 px-1 text-[11px]">{"{sets}"}</code> 등은 화면에서 치환됩니다.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">최상단 단일 CTA</h3>
        <Subgrid>
          <Field label="eyebrow (플랜 고정됨)" rows={1} v={hb.singleAction.eyebrowWhenPlanLocked} onText={(t) => p({ ...hb, singleAction: { ...hb.singleAction, eyebrowWhenPlanLocked: t } })} />
          <Field label="eyebrow (기본)" rows={1} v={hb.singleAction.eyebrowDefault} onText={(t) => p({ ...hb, singleAction: { ...hb.singleAction, eyebrowDefault: t } })} />
          <Field label="버튼: 세션 진행 중" rows={1} v={hb.singleAction.ctaWhenSessionActive} onText={(t) => p({ ...hb, singleAction: { ...hb.singleAction, ctaWhenSessionActive: t } })} />
          <Field label="버튼: 오늘 완료 후" rows={1} v={hb.singleAction.ctaWhenDone} onText={(t) => p({ ...hb, singleAction: { ...hb.singleAction, ctaWhenDone: t } })} />
          <Field label="버튼: 운동 시작" rows={1} v={hb.singleAction.ctaStart} onText={(t) => p({ ...hb, singleAction: { ...hb.singleAction, ctaStart: t } })} />
          <Field label="플랜만 바꾸기 링크" rows={1} v={hb.singleAction.linkChangePlanOptional} onText={(t) => p({ ...hb, singleAction: { ...hb.singleAction, linkChangePlanOptional: t } })} />
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">2차 섹션 소제목</h3>
        <Subgrid>
          <Field label="기록·분석·코치 등 eyebrow" rows={1} v={hb.secondary.sectionEyebrow} onText={(t) => p({ ...hb, secondary: { sectionEyebrow: t } })} />
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">온보딩 배너 (미완료 시)</h3>
        <Subgrid>
          <Field label="본문 앞부분" rows={2} v={hb.onboardingBanner.bodyPrefix} onText={(t) => p({ ...hb, onboardingBanner: { ...hb.onboardingBanner, bodyPrefix: t } })} />
          <Field label="본문 강조" rows={1} v={hb.onboardingBanner.bodyStrong} onText={(t) => p({ ...hb, onboardingBanner: { ...hb.onboardingBanner, bodyStrong: t } })} />
          <Field label="본문 뒷부분" rows={2} v={hb.onboardingBanner.bodySuffix} onText={(t) => p({ ...hb, onboardingBanner: { ...hb.onboardingBanner, bodySuffix: t } })} />
          <Field label="시작하기" rows={1} v={hb.onboardingBanner.ctaStart} onText={(t) => p({ ...hb, onboardingBanner: { ...hb.onboardingBanner, ctaStart: t } })} />
          <Field label="나중에" rows={1} v={hb.onboardingBanner.ctaLater} onText={(t) => p({ ...hb, onboardingBanner: { ...hb.onboardingBanner, ctaLater: t } })} />
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">상단 리본 (오늘 운동 상태)</h3>
        <Subgrid>
          {(
            [
              ["stateIdle", "상태: 운동 전"],
              ["stateActive", "상태: 운동 중"],
              ["stateCompleted", "상태: 완료"],
              ["stateMissed", "상태: 미완"],
              ["ariaLabelTemplate", "접근성 라벨 ({label})"],
              ["messageIdleBefore", "메시지·전·앞"],
              ["messageIdleHighlight", "메시지·전·강조"],
              ["messageIdleAfter", "메시지·전·뒤"],
              ["messageActive", "메시지·진행 중"],
              ["messageCompleted", "메시지·완료"],
              ["messageMissed", "메시지·미완"],
              ["ctaStartWorkout", "CTA 운동 시작"],
              ["ctaResumeSession", "CTA 세션 이어가기"],
              ["ctaViewAnalysis", "CTA 분석"],
              ["ctaQuickStart", "CTA 빠른 시작"],
              ["ctaFindShortRoutine", "CTA 짧은 루틴"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              rows={k.startsWith("message") || k === "ariaLabelTemplate" ? 2 : 1}
              v={hb.userRibbon[k]}
              onText={(t) => {
                p({ ...hb, userRibbon: { ...hb.userRibbon, [k]: t } });
              }}
            />
          ))}
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">스트릭 마일스톤 뱃지</h3>
        <Subgrid>
          {(
            [
              ["titleEyebrow", "소제목"],
              ["streakWord", "뱃지 내부 연속"],
              ["unlocked", "획득"],
              ["locked", "잠금"],
              ["nextBadgeTemplate", "다음까지 ({next}, {remaining})"],
              ["fullComboLine", "30일 달성 문구"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              rows={k === "nextBadgeTemplate" ? 2 : 1}
              v={hb.streakBadges[k]}
              onText={(t) => {
                p({ ...hb, streakBadges: { ...hb.streakBadges, [k]: t } });
              }}
            />
          ))}
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">미운동 개입 카드</h3>
        <Subgrid>
          {(
            [
              ["phaseMorning", "시간대: 오전"],
              ["phaseAfternoon", "오후"],
              ["phaseEvening", "저녁"],
              ["phaseNight", "밤"],
              ["eyebrowTodayLine", "eyebrow"],
              ["reasonBadge", "이유 뱃지"],
              ["routineLinePlanLockedSuffix", "루틴 줄·플랜 고정 접미"],
              ["routineLinePlanOpenSuffix", "루틴 줄·플랜 열림 접미"],
              ["nightStreakHint", "밤 스트릭 힌트"],
              ["ctaStartNow", "CTA 지금 시작"],
              ["ctaQuickRoutine", "CTA 빠른 루틴"],
              ["programLink", "프로그램 링크"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              rows={2}
              v={hb.noWorkout[k]}
              onText={(t) => {
                p({ ...hb, noWorkout: { ...hb.noWorkout, [k]: t } });
              }}
            />
          ))}
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">오늘 운동 히어로 카드</h3>
        <Subgrid>
          {(
            [
              ["routineFeedEyebrow", "루틴 피드 eyebrow"],
              ["reasonChip", "이유 칩"],
              ["rulesEngineFootnote", "규칙 엔진 각주"],
              ["liveFeedFootnote", "라이브 피드 각주"],
              ["pickEyebrow", "오늘 픽"],
              ["badgeTodayLocked", "뱃지·플랜 고정"],
              ["badgeSessionActive", "뱃지·세션 중"],
              ["missedHint", "미완 힌트"],
              ["decisionEyebrow", "결정 eyebrow"],
              ["trustTemplate", "신뢰도 ({percent})"],
              ["primaryReasonBadge", "핵심 근거"],
              ["dataBadge", "데이터"],
              ["approxDurationPrefix", "예상 시간 접두"],
              ["chipPlanConfirmed", "칩·플랜 고정"],
              ["chipPickPlan", "칩·플랜 고르기"],
              ["chipSessionLogged", "칩·세션 기록됨"],
              ["linkWorkoutScreen", "운동 화면 링크"],
              ["linkProgram", "프로그램"],
              ["ctaOneMoreSet", "한 세트 더"],
              ["ctaResumeSession", "세션 이어가기"],
              ["ctaStartWorkout", "운동 시작"],
              ["ctaPickPlanFirst", "플랜 먼저"],
              ["linkProgramBrowse", "프로그램 훑기"],
              ["linkReferenceOnly", "참고만"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              rows={["rulesEngineFootnote", "liveFeedFootnote"].includes(k) ? 2 : 1}
              v={hb.todayHero[k]}
              onText={(t) => {
                p({ ...hb, todayHero: { ...hb.todayHero, [k]: t } });
              }}
            />
          ))}
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">오늘 플랜 카드</h3>
        <Subgrid>
          {(
            [
              ["statusSuggested", "상태·추천"],
              ["statusConfirmed", "상태·고정"],
              ["statusCompleted", "상태·완료"],
              ["cardHeading", "카드 제목 라벨"],
              ["confirmedTitle", "고정 시 제목"],
              ["confirmedSubtitle", "고정 시 부제"],
              ["estimateLineTemplate", "예상 줄 ({duration}, {minutes})"],
              ["decisionReasonBadge", "결정 근거 뱃지"],
              ["btnUsePlan", "플랜 확정 버튼"],
              ["linkChangePlan", "플랜 바꾸기"],
              ["thExercise", "표 헤더·운동"],
              ["thSets", "표 헤더·세트"],
              ["thReps", "표 헤더·횟수"],
              ["thEstimate", "표 헤더·예상"],
              ["rowMinutesSuffix", "행 분 접미"],
              ["footnoteWhenConfirmed", "각주·고정 후"],
              ["hintWhenSuggested", "힌트·추천"],
              ["hintWhenConfirmed", "힌트·고정"],
              ["hintWhenDoneTitle", "힌트·완료 제목"],
              ["hintWhenDoneStreakTemplate", "힌트·스트릭 ({days})"],
              ["footnoteAutoTimeTemplate", "하단 각주 ({planLabel})"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              rows={["footnoteWhenConfirmed", "hintWhenSuggested", "hintWhenConfirmed", "footnoteAutoTimeTemplate", "estimateLineTemplate"].includes(k) ? 2 : 1}
              v={hb.todayPlan[k]}
              onText={(t) => {
                p({ ...hb, todayPlan: { ...hb.todayPlan, [k]: t } });
              }}
            />
          ))}
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">오늘 한 줄 요약 카드</h3>
        <Subgrid>
          {(
            [
              ["titleEyebrow", "소제목"],
              ["loadingMain", "불러오는 중 메인"],
              ["lineCompleted", "완료 줄 앞"],
              ["lineCompletedWord", "완료 줄 강조"],
              ["lineActive", "진행 줄 앞"],
              ["lineActiveWord", "진행 줄 강조"],
              ["lineMissed", "미완 줄 앞"],
              ["lineMissedWord", "미완 줄 강조"],
              ["lineBefore", "전 줄 앞"],
              ["lineBeforeWord", "전 줄 강조"],
              ["streakEyebrow", "연속 스택 라벨"],
              ["streakDaysSuffix", "연속 일수 접미(예: 일)"],
              ["recoveryModeBadge", "유지 모드"],
              ["idleNudgeBefore", "전·유도 앞"],
              ["idleNudgeBold", "전·유도 강조"],
              ["idleNudgeAfter", "전·유도 뒤"],
              ["activeNudgeTemplate", "진행·유도 ({seconds})"],
              ["missedNudge", "미완·유도"],
              ["completedNudge", "완료·유도"],
              ["weeklyLoading", "주간 줄·로딩"],
              ["weeklyProgressTemplate", "주간 진행 ({pct}{current}{target})"],
              ["weeklyNoGoalHint", "주간 목표 없을 때"],
              ["progressAriaLabel", "진행바 접근성"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              rows={["activeNudgeTemplate", "weeklyProgressTemplate", "weeklyNoGoalHint", "missedNudge", "completedNudge"].includes(k) ? 2 : 1}
              v={hb.todayStatus[k]}
              onText={(t) => {
                p({ ...hb, todayStatus: { ...hb.todayStatus, [k]: t } });
              }}
            />
          ))}
        </Subgrid>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-apple-ink">기록 목록 상단 인사이트</h3>
        <Subgrid>
          {(
            [
              ["eyebrow", "소제목"],
              ["title", "제목"],
              ["subtitle", "부제"],
              ["volumeEyebrow", "누적 볼륨"],
              ["volumeUnitHint", "볼륨 단위 설명"],
              ["prEyebrow", "PR 블록 제목"],
              ["prCountSuffix", "PR 횟수 접미"],
              ["prHint", "PR 설명"],
              ["rowsEyebrow", "세트 행 제목"],
              ["rowsHint", "세트 행 설명"],
              ["muscleEyebrow", "부위 비중 제목"],
              ["volumePrefix", "행 뱃지·볼륨"],
              ["weightPrefix", "행 뱃지·중량"],
              ["deltaFlat", "증감 유지"],
              ["success", "성공"],
              ["fail", "실패"],
              ["delete", "지우기"],
              ["repsSetsTemplate", "횟수×세트 ({reps}{sets})"],
              ["volumeInlinePrefix", "행 볼륨 접두"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              rows={["subtitle", "prHint", "repsSetsTemplate"].includes(k) ? 2 : 1}
              v={hb.workoutList[k]}
              onText={(t) => {
                p({ ...hb, workoutList: { ...hb.workoutList, [k]: t } });
              }}
            />
          ))}
        </Subgrid>
      </div>
    </section>
  );
}
