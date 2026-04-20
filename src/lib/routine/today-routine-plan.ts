import type { OnboardingProfile } from "@/lib/onboarding/types";



/** 규칙 엔진 결과 · 추후 GPT가 같은 필드로 덮어쓸 수 있음 */

export type RoutineInsightSource = "rules" | "gpt";



export type RoutineAdjustmentType = "substitute_stale" | "add_weak_muscle" | "schedule_hint";



export type RoutineAdjustment = {

  type: RoutineAdjustmentType;

  /** 사용자에게 보이는 한 줄(읽는 리포트 톤) */

  message: string;

  /** 데이터·규칙에 기반한 근거(신뢰용, 짧게) */

  reason: string;

};



export type TodayRoutinePlan = {

  title: string;

  description: string;

  estimatedMinutesMin: number;

  estimatedMinutesMax: number;

  /** 이 루틴 제안 전체의 근거 한 줄(홈·카드 상단 등) */

  recommendationReason: string;

  /** 기록·프로필 기반 자동 코멘트(최대 3줄 권장) */

  liveMessages?: string[];

  adjustments?: RoutineAdjustment[];

  source?: RoutineInsightSource;

};



type RoutinePlanCore = Omit<TodayRoutinePlan, "recommendationReason">;



function withReason(core: RoutinePlanCore, recommendationReason: string): TodayRoutinePlan {

  return { ...core, recommendationReason };

}



function mondayIndex(d: Date): number {

  return (d.getDay() + 6) % 7;

}



function defaultReasonForGoal(goal: NonNullable<OnboardingProfile["goal"]> | undefined): string {

  if (!goal) return "목표가 비어 있어서 전신 워밍업 위주로 가볍게 짜 뒀어요. 온보딩만 채워도 오늘 픽이 훨씬 잘 맞아요.";

  if (goal === "bulk") return "벌크 목표랑 오늘 요일(월~일 기준)에 맞춘 주간 볼륨 스플릿이에요. 중량은 천천히 올려도 괜찮아요.";

  if (goal === "cut") return "컷 목표라 밀도랑 심박을 살짝 올리고, 유산소도 섞인 템플릿이에요. 무리한 점프는 빼도 돼요.";

  if (goal === "maintain") return "유지 목표에 맞는 밸런스 스플릿이에요. 꾸준히 하는 게 제일 잘 맞는 타입이에요.";

  return "온보딩에서 고른 목표에 맞춘 기본 스플릿이에요.";

}



/** 목표·요일 기반 기본 루틴(고정 템플릿) — 최적화 레이어가 여기서 확장 */

export function planTodayRoutine(profile: OnboardingProfile | null, now = new Date()): TodayRoutinePlan {

  const goal = profile?.goal;

  const dow = mondayIndex(now);



  if (!goal) {

    return withReason(

      {

        title: "오늘의 운동 · 몸부터 깨우기",

        description:

          "목표만 정해 주면 요일 맞춤 루틴이 더 촘촘해져요. 지금은 가벼운 전신 워밍업으로 관절이랑 심장만 깨워요.",

        estimatedMinutesMin: 25,

        estimatedMinutesMax: 40,

      },

      defaultReasonForGoal(undefined),

    );

  }



  if (goal === "bulk") {

    const cycle: RoutinePlanCore[] = [

      {

        title: "하체 루틴 · 다리 오늘 커미션",

        description: "스쿼트·힙힌지·런지로 하체 감 잡고, 코어는 짧게 끊어서 마무리해요.",

        estimatedMinutesMin: 45,

        estimatedMinutesMax: 65,

      },

      {

        title: "상체 밀기 루틴 · 밀어붙이는 날",

        description: "벤치·오버헤드·삼두. 가슴·어깨 라인만 살짝 의식해도 퀄리티 올라가요.",

        estimatedMinutesMin: 40,

        estimatedMinutesMax: 55,

      },

      {

        title: "상체 당기기 루틴 · 등 켜기",

        description: "로우·풀업·이두. 견갑 모아서 당기면 등 느낌 바로 옵니다.",

        estimatedMinutesMin: 40,

        estimatedMinutesMax: 55,

      },

      {

        title: "하체 루틴 · 앞뒤 체인 밸런스",

        description: "앞·뒤 체인 골고루. 템포만 살짝 컨트롤해도 자극 달라져요.",

        estimatedMinutesMin: 45,

        estimatedMinutesMax: 65,

      },

      {

        title: "상체 밀기 루틴 · 중량 천천히",

        description: "중량은 한 칸씩만. 마지막 세트는 RPE 7~8 느낌으로 가보면 돼요.",

        estimatedMinutesMin: 40,

        estimatedMinutesMax: 55,

      },

      {

        title: "전신 루틴 · 복합 위주",

        description: "큰 동작 위주로 볼륨만 나눠서 가볍게 한 바퀴 돌려요.",

        estimatedMinutesMin: 50,

        estimatedMinutesMax: 70,

      },

      {

        title: "가벼운 전신 · 회복 데이",

        description: "저강도 전신 + 스트레칭. 다음 주 메인 전에 움직임만 유지하는 느낌으로.",

        estimatedMinutesMin: 25,

        estimatedMinutesMax: 40,

      },

    ];

    return withReason(cycle[dow] ?? cycle[0], defaultReasonForGoal("bulk"));

  }



  if (goal === "cut") {

    const cycle: RoutinePlanCore[] = [

      {

        title: "전신 서킷 A · 심박 살짝",

        description: "복합 4~5동작, 휴식 짧게. 심박은 올리되 무릎·발목은 아끼는 쪽으로.",

        estimatedMinutesMin: 30,

        estimatedMinutesMax: 45,

      },

      {

        title: "상체 슈퍼셋 · 밀당 번갈",

        description: "밀기·당기기 교차. 세트 사이 이동은 최소로 해서 템포 유지해요.",

        estimatedMinutesMin: 35,

        estimatedMinutesMax: 50,

      },

      {

        title: "하체 HIIT 라이트",

        description: "스쿼트·런지·케틀 패턴. 점프 과몰입은 피하고 리듬만 타요.",

        estimatedMinutesMin: 30,

        estimatedMinutesMax: 45,

      },

      {

        title: "전신 서킷 B · 코어도 한 스푼",

        description: "코어 포함 전신. 마지막 5분은 천천히 걷기로 심박만 내려요.",

        estimatedMinutesMin: 30,

        estimatedMinutesMax: 45,

      },

      {

        title: "상체 밀기 · 유산소 마무리",

        description: "근력 먼저 박고, 끝에 걷기/사이클 10~15분만 얹어요.",

        estimatedMinutesMin: 40,

        estimatedMinutesMax: 55,

      },

      {

        title: "하체 안정 패턴",

        description: "런지·힙힌지·백 익스텐션. 템포 3-1-1로 자극만 살짝 올려봐요.",

        estimatedMinutesMin: 35,

        estimatedMinutesMax: 50,

      },

      {

        title: "액티브 리커버리",

        description: "가벼운 유동성 + 보행. 다음 세션까지 몸만 편하게 열어두기.",

        estimatedMinutesMin: 20,

        estimatedMinutesMax: 35,

      },

    ];

    return withReason(cycle[dow] ?? cycle[0], defaultReasonForGoal("cut"));

  }



  const cycle: RoutinePlanCore[] = [

    {

      title: "전신 균형 루틴",

      description: "상·하체 고르게. 중량은 익숙한 구간에서만 놀아도 충분해요.",

      estimatedMinutesMin: 35,

      estimatedMinutesMax: 50,

    },

    {

      title: "가동성 + 근력",

      description: "동적 스트레칭 후 복합 3~4개만 깔끔하게.",

      estimatedMinutesMin: 35,

      estimatedMinutesMax: 48,

    },

    {

      title: "하체 가벼운 볼륨",

      description: "스쿼트 패턴이랑 힙 교차. 무릎 각도만 체크하면 끝.",

      estimatedMinutesMin: 35,

      estimatedMinutesMax: 50,

    },

    {

      title: "상체 균형",

      description: "밀기·당기기 1:1 비율로 맞춰 보기. 어깨가 제일 편해요.",

      estimatedMinutesMin: 35,

      estimatedMinutesMax: 48,

    },

    {

      title: "전신 균형 루틴 · 어제 느낌 점검",

      description: "어제 좀 뻐근했던 부위만 짧게 훑는 느낌으로.",

      estimatedMinutesMin: 35,

      estimatedMinutesMax: 50,

    },

    {

      title: "코어 · 안정성",

      description: "플랭크·팔로우·숄더 패킹. 호흡이랑 복압만 맞춰도 체감 큼.",

      estimatedMinutesMin: 30,

      estimatedMinutesMax: 45,

    },

    {

      title: "가벼운 산책 겸 스트레칭",

      description: "앉아만 있던 날엔 특히 추천. 그냥 걷는 것도 운동이에요.",

      estimatedMinutesMin: 20,

      estimatedMinutesMax: 35,

    },

  ];

  return withReason(cycle[dow] ?? cycle[0], defaultReasonForGoal("maintain"));

}



export function formatEstimatedLabel(min: number, max: number): string {

  if (min === max) return `약 ${min}분`;

  return `약 ${min}–${max}분`;

}

