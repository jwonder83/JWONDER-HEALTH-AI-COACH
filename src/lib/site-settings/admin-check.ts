/** 대시보드 헤더의 「사이트 설정」 링크 표시 전용 (다른 관리자와 분리) */
const SITE_SETTINGS_HEADER_EMAIL = "jvic83@naver.com";

export function isSiteSettingsHeaderVisible(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SITE_SETTINGS_HEADER_EMAIL;
}

/** ADMIN_EMAILS=이메일1,이메일2 또는 ADMIN_EMAIL 단일 — /admin·저장 API 접근 */
export function isUserAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  const list = raw
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) {
    // 목록이 없으면 프로덕션에서는 누구도 /admin 접근 불가 → 로그인 후 / 로 튕김처럼 보일 수 있음
    return process.env.NODE_ENV !== "production";
  }
  return list.includes(normalized);
}
