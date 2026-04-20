import type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";

/** 한 동작 행 — 횟수는 범위 문자열로 표시 */
export type RoutineExerciseItem = {
  id: string;
  name: string;
  sets: number;
  repsLabel: string;
  /** 이 동작에 배분된 예상 시간(분) */
  estimatedMinutes: number;
};

type Line = { name: string; sets: number; repsLabel: string };

function avgMinutes(plan: TodayRoutinePlan): number {
  return Math.round((plan.estimatedMinutesMin + plan.estimatedMinutesMax) / 2);
}

function allocateMinutes(lines: Line[], total: number): RoutineExerciseItem[] {
  const n = lines.length;
  if (n === 0) return [];
  const t = Math.max(1, total);
  const per = Math.max(1, Math.ceil(t / n));
  return lines.map((line, i) => ({
    id: `ex-${i}`,
    name: line.name,
    sets: line.sets,
    repsLabel: line.repsLabel,
    estimatedMinutes: per,
  }));
}

function fromLines(plan: TodayRoutinePlan, lines: Line[]): RoutineExerciseItem[] {
  return allocateMinutes(lines, avgMinutes(plan));
}

/** `TodayRoutinePlan.title` 기준으로 오늘 수행 동작 목록(규칙 기반) */
export function buildExerciseListFromPlan(plan: TodayRoutinePlan): RoutineExerciseItem[] {
  const title = plan.title.trim();

  const map: { test: (t: string) => boolean; lines: Line[] }[] = [
    {
      test: (t) => t.includes("오늘의 운동"),
      lines: [
        { name: "동적 워밍업", sets: 1, repsLabel: "5–8분" },
        { name: "바디웨이트 스쿼트", sets: 3, repsLabel: "12–15" },
        { name: "푸시업 또는 니 푸시업", sets: 3, repsLabel: "8–12" },
        { name: "힙 힌지 + 맨몸 로우", sets: 3, repsLabel: "10–12" },
        { name: "플랭크", sets: 3, repsLabel: "30–45초" },
      ],
    },
    {
      test: (t) => t.includes("하체 루틴"),
      lines: [
        { name: "레그 프레스 또는 스쿼트", sets: 4, repsLabel: "6–10" },
        { name: "루마니안 데드리프트", sets: 3, repsLabel: "8–10" },
        { name: "워킹 런지", sets: 3, repsLabel: "각 10–12" },
        { name: "레그 컬", sets: 3, repsLabel: "12–15" },
        { name: "종아리 레이즈", sets: 4, repsLabel: "12–15" },
        { name: "코어 마무리(데드버그)", sets: 3, repsLabel: "10" },
      ],
    },
    {
      test: (t) => t.includes("상체 밀기"),
      lines: [
        { name: "벤치 프레스 또는 덤벨 프레스", sets: 4, repsLabel: "6–10" },
        { name: "인클라인 프레스", sets: 3, repsLabel: "8–10" },
        { name: "오버헤드 프레스", sets: 3, repsLabel: "8–10" },
        { name: "레터럴 레이즈", sets: 3, repsLabel: "12–15" },
        { name: "트라이셉스 푸시다운", sets: 3, repsLabel: "12–15" },
      ],
    },
    {
      test: (t) => t.includes("상체 당기기"),
      lines: [
        { name: "랫 풀다운", sets: 4, repsLabel: "8–12" },
        { name: "시티드 로우", sets: 3, repsLabel: "10–12" },
        { name: "페이스 풀", sets: 3, repsLabel: "15–20" },
        { name: "덤벨 컬", sets: 3, repsLabel: "10–12" },
        { name: "해머 컬", sets: 2, repsLabel: "10–12" },
      ],
    },
    {
      test: (t) => t.includes("전신 루틴") && !t.includes("가벼운"),
      lines: [
        { name: "고블릿 스쿼트", sets: 3, repsLabel: "10–12" },
        { name: "루마니안 데드리프트", sets: 3, repsLabel: "8–10" },
        { name: "덤벨 로우", sets: 3, repsLabel: "10–12" },
        { name: "푸시업", sets: 3, repsLabel: "8–12" },
        { name: "파머스 워크", sets: 3, repsLabel: "20–30m" },
      ],
    },
    {
      test: (t) => t.includes("가벼운 전신") || t.includes("회복"),
      lines: [
        { name: "가벼운 유산소(걷기/사이클)", sets: 1, repsLabel: "10–15분" },
        { name: "동적 스트레칭", sets: 1, repsLabel: "8–10분" },
        { name: "맨몸 스쿼트", sets: 2, repsLabel: "12–15" },
        { name: "밴드 풀어파트", sets: 2, repsLabel: "15–20" },
      ],
    },
    {
      test: (t) => t.includes("전신 서킷"),
      lines: [
        { name: "스쿼트", sets: 4, repsLabel: "12" },
        { name: "푸시업", sets: 4, repsLabel: "8–12" },
        { name: "케틀벨 스윙", sets: 4, repsLabel: "12–15" },
        { name: "플랭크", sets: 4, repsLabel: "30–40초" },
        { name: "마운틴 클라이머", sets: 3, repsLabel: "20–30" },
      ],
    },
    {
      test: (t) => t.includes("슈퍼셋"),
      lines: [
        { name: "덤벨 프레스 + 로우(슈퍼셋)", sets: 4, repsLabel: "각 10–12" },
        { name: "인클라인 + 시티드 로우", sets: 3, repsLabel: "각 10–12" },
        { name: "페이스 풀", sets: 3, repsLabel: "15–20" },
        { name: "해머 컬", sets: 2, repsLabel: "12" },
      ],
    },
    {
      test: (t) => t.includes("HIIT"),
      lines: [
        { name: "점프 스쿼트(가능 시)", sets: 4, repsLabel: "10–12" },
        { name: "런지 스텝", sets: 3, repsLabel: "각 10" },
        { name: "케틀벨 스윙", sets: 4, repsLabel: "12–15" },
        { name: "버피(옵션)", sets: 3, repsLabel: "6–8" },
        { name: "쿨다운 걷기", sets: 1, repsLabel: "5–8분" },
      ],
    },
    {
      test: (t) => t.includes("유산소 마무리"),
      lines: [
        { name: "벤치 또는 머신 프레스", sets: 4, repsLabel: "8–10" },
        { name: "인클라인 덤벨", sets: 3, repsLabel: "10–12" },
        { name: "삼두 보조", sets: 3, repsLabel: "12–15" },
        { name: "걷기/사이클", sets: 1, repsLabel: "10–15분" },
      ],
    },
    {
      test: (t) => t.includes("하체 안정"),
      lines: [
        { name: "스플릿 스쿼트", sets: 3, repsLabel: "각 10–12" },
        { name: "힙 쓰러스트", sets: 3, repsLabel: "10–12" },
        { name: "백 익스텐션", sets: 3, repsLabel: "12–15" },
        { name: "레그 컬", sets: 3, repsLabel: "12–15" },
      ],
    },
    {
      test: (t) => t.includes("액티브 리커버리"),
      lines: [
        { name: "가벼운 걷기", sets: 1, repsLabel: "15–20분" },
        { name: "고정식 자전거(저항 낮게)", sets: 1, repsLabel: "10분" },
        { name: "전신 스트레칭", sets: 1, repsLabel: "8–10분" },
      ],
    },
    {
      test: (t) => t.includes("전신 균형"),
      lines: [
        { name: "고블릿 스쿼트", sets: 3, repsLabel: "10–12" },
        { name: "덤벨 로우", sets: 3, repsLabel: "10–12" },
        { name: "덤벨 프레스", sets: 3, repsLabel: "10–12" },
        { name: "루마니안 데드리프트", sets: 2, repsLabel: "10" },
        { name: "플랭크", sets: 3, repsLabel: "40–60초" },
      ],
    },
    {
      test: (t) => t.includes("가동성"),
      lines: [
        { name: "동적 스트레칭", sets: 1, repsLabel: "8–10분" },
        { name: "고블릿 스쿼트", sets: 3, repsLabel: "10" },
        { name: "푸시업", sets: 3, repsLabel: "10–12" },
        { name: "케이블 로우", sets: 3, repsLabel: "12" },
      ],
    },
    {
      test: (t) => t.includes("하체 가벼운"),
      lines: [
        { name: "고블릿 스쿼트", sets: 3, repsLabel: "12–15" },
        { name: "레그 프레스", sets: 3, repsLabel: "12–15" },
        { name: "레그 컬", sets: 3, repsLabel: "12–15" },
        { name: "종아리", sets: 3, repsLabel: "15–20" },
      ],
    },
    {
      test: (t) => t.includes("상체 균형"),
      lines: [
        { name: "랫 풀다운", sets: 3, repsLabel: "10–12" },
        { name: "덤벨 프레스", sets: 3, repsLabel: "10–12" },
        { name: "원암 로우", sets: 3, repsLabel: "10" },
        { name: "페이스 풀", sets: 3, repsLabel: "15" },
      ],
    },
    {
      test: (t) => t.includes("코어") || t.includes("안정성"),
      lines: [
        { name: "데드 버그", sets: 3, repsLabel: "10" },
        { name: "사이드 플랭크", sets: 3, repsLabel: "각 30–45초" },
        { name: "팔로우", sets: 3, repsLabel: "10–12" },
        { name: "버드독", sets: 3, repsLabel: "각 8–10" },
      ],
    },
    {
      test: (t) => t.includes("산책") || t.includes("스트레칭"),
      lines: [
        { name: "가벼운 산책", sets: 1, repsLabel: "15–25분" },
        { name: "전신 스트레칭", sets: 1, repsLabel: "10–12분" },
      ],
    },
  ];

  for (const entry of map) {
    if (entry.test(title)) return fromLines(plan, entry.lines);
  }

  return fromLines(plan, [
    { name: "워밍업", sets: 1, repsLabel: "5–8분" },
    { name: "복합 하체", sets: 3, repsLabel: "8–10" },
    { name: "복합 상체", sets: 3, repsLabel: "8–10" },
    { name: "보조 운동 1", sets: 3, repsLabel: "12" },
    { name: "보조 운동 2", sets: 3, repsLabel: "12" },
    { name: "쿨다운", sets: 1, repsLabel: "5분" },
  ]);
}

export function sumExerciseMinutes(items: RoutineExerciseItem[]): number {
  return items.reduce((a, x) => a + x.estimatedMinutes, 0);
}
