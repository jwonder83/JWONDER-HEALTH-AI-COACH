import type { OnboardingProfile } from "@/lib/onboarding/types";

/** 규칙 엔진 결과 · 추후 GPT가 같은 필드로 덮어쓸 수 있음 */
export type RoutineInsightSource = "rules" | "gpt";

export type RoutineAdjustmentType = "substitute_stale" | "add_weak_muscle" | "schedule_hint";

export type RoutineAdjustment = {
  type: RoutineAdjustmentType;
  /** 사용자에게 보이는 한 줄(읽는 리포트 톤) */
  message: string;
};

export type TodayRoutinePlan = {
  title: string;
  description: string;
  estimatedMinutesMin: number;
  estimatedMinutesMax: number;
  /** 기록·프로필 기반 자동 코멘트(최대 3줄 권장) */
  liveMessages?: string[];
  adjustments?: RoutineAdjustment[];
  source?: RoutineInsightSource;
};

function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** 목표·요일 기반 기본 루틴(고정 템플릿) — 최적화 레이어가 여기서 확장 */
export function planTodayRoutine(profile: OnboardingProfile | null, now = new Date()): TodayRoutinePlan {
  const goal = profile?.goal;
  const dow = mondayIndex(now);

  if (!goal) {
    return {
      title: "오늘의 운동",
      description: "목표를 설정하면 요일에 맞춘 루틴 제안을 보여 드려요. 지금은 가벼운 전신 워밍업부터 시작해 보세요.",
      estimatedMinutesMin: 25,
      estimatedMinutesMax: 40,
    };
  }

  if (goal === "bulk") {
    const cycle: TodayRoutinePlan[] = [
      { title: "하체 루틴", description: "스쿼트·힙힌지·런지 중심. 코어는 짧게 마무리하세요.", estimatedMinutesMin: 45, estimatedMinutesMax: 65 },
      { title: "상체 밀기 루틴", description: "벤치·오버헤드·삼두. 가슴·어깨 정렬을 의식하세요.", estimatedMinutesMin: 40, estimatedMinutesMax: 55 },
      { title: "상체 당기기 루틴", description: "로우·풀업·이두. 견갑을 모은 채로 당겨 주세요.", estimatedMinutesMin: 40, estimatedMinutesMax: 55 },
      { title: "하체 루틴", description: "전면·후면 체인을 골고루. 컨트롤된 템포를 유지하세요.", estimatedMinutesMin: 45, estimatedMinutesMax: 65 },
      { title: "상체 밀기 루틴", description: "중량 점진 상승. 마지막 세트는 RPE 7~8을 목표로.", estimatedMinutesMin: 40, estimatedMinutesMax: 55 },
      { title: "전신 루틴", description: "복합 위주로 볼륨을 나눠 가볍게 돌려보세요.", estimatedMinutesMin: 50, estimatedMinutesMax: 70 },
      {
        title: "가벼운 전신 · 회복",
        description: "저강도 전신과 스트레칭. 다음 주 메인 세션을 위해 움직임만 유지하세요.",
        estimatedMinutesMin: 25,
        estimatedMinutesMax: 40,
      },
    ];
    return cycle[dow] ?? cycle[0];
  }

  if (goal === "cut") {
    const cycle: TodayRoutinePlan[] = [
      { title: "전신 서킷 A", description: "복합 4~5동작, 휴식 짧게. 심박은 올리되 관절은 보호하세요.", estimatedMinutesMin: 30, estimatedMinutesMax: 45 },
      { title: "상체 슈퍼셋", description: "밀기·당기기 교차. 세트 간 이동을 최소화하세요.", estimatedMinutesMin: 35, estimatedMinutesMax: 50 },
      { title: "하체 HIIT 라이트", description: "스쿼트·런지·케틀 패턴. 무리한 점프는 줄이세요.", estimatedMinutesMin: 30, estimatedMinutesMax: 45 },
      { title: "전신 서킷 B", description: "코어 포함 전신. 마지막 5분은 천천히 걷기로 마무리.", estimatedMinutesMin: 30, estimatedMinutesMax: 45 },
      { title: "상체 밀기 · 유산소 마무리", description: "근력 후 가볍게 걷기/사이클 10~15분.", estimatedMinutesMin: 40, estimatedMinutesMax: 55 },
      { title: "하체 안정 패턴", description: "런지·힙힌지·백 익스텐션. 템포 3-1-1로 자극을 늘리세요.", estimatedMinutesMin: 35, estimatedMinutesMax: 50 },
      { title: "액티브 리커버리", description: "가벼운 유동성과 보행. 다음 세션을 위한 회복에 집중하세요.", estimatedMinutesMin: 20, estimatedMinutesMax: 35 },
    ];
    return cycle[dow] ?? cycle[0];
  }

  const cycle: TodayRoutinePlan[] = [
    { title: "전신 균형 루틴", description: "상·하체를 고르게. 중량은 익숙한 범위에서 유지하세요.", estimatedMinutesMin: 35, estimatedMinutesMax: 50 },
    { title: "가동성 + 근력", description: "동적 스트레칭 후 복합 3~4종목.", estimatedMinutesMin: 35, estimatedMinutesMax: 48 },
    { title: "하체 가벼운 볼륨", description: "스쿼트 패턴과 힙 교차. 무릎 각도를 의식하세요.", estimatedMinutesMin: 35, estimatedMinutesMax: 50 },
    { title: "상체 균형", description: "밀기·당기기 1:1 비율로 구성해 보세요.", estimatedMinutesMin: 35, estimatedMinutesMax: 48 },
    { title: "전신 균형 루틴", description: "전날 느낌이 들었던 부위를 짧게 점검하세요.", estimatedMinutesMin: 35, estimatedMinutesMax: 50 },
    { title: "코어 · 안정성", description: "플랭크·팔로우·숄더 패킹. 호흡과 복압을 맞추세요.", estimatedMinutesMin: 30, estimatedMinutesMax: 45 },
    { title: "가벼운 산책 겸 스트레칭", description: "장시간 앉은 날엔 특히 추천해요.", estimatedMinutesMin: 20, estimatedMinutesMax: 35 },
  ];
  return cycle[dow] ?? cycle[0];
}

export function formatEstimatedLabel(min: number, max: number): string {
  if (min === max) return `약 ${min}분`;
  return `약 ${min}–${max}분`;
}
