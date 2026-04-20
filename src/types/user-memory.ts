/**
 * AI 코칭 개인화용 사용자 메모리 스냅샷.
 * 운동 기록·온보딩에서 자동 갱신되며, 향후 DB 동기화 시에도 동일 스키마를 권장합니다.
 */
export type UserMemoryProfile = {
  schemaVersion: number;
  updatedAt: string;
  goal: string;
  experience_level: string;
  preferred_exercises: string[];
  weak_points: string[];
  injury_history: string[];
  /** 0–100, 최근 7일 캘린더 기준 출석(운동일) 비중 */
  consistency_score: number;
  /** 0–100, 최근 볼륨·빈도·브리핑 피로 점수에 정렬된 누적 부담 지표 */
  fatigue_level: number;
};
