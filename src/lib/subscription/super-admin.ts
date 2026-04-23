/**
 * 구독·Paywall 우회(유료 기능 전체 무료) + 일반 결제·유도 UI 차단용.
 * 기본 포함: 운영 슈퍼관리자. 추가는 SUPER_SUBSCRIPTION_ADMIN_EMAILS(쉼표 구분)로 확장.
 */
const EMBEDDED_SUPER_SUBSCRIPTION_EMAILS = ["jvic83@naver.com"];

function superSubscriptionEmailSet(): Set<string> {
  const extra = (process.env.SUPER_SUBSCRIPTION_ADMIN_EMAILS ?? "")
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...EMBEDDED_SUPER_SUBSCRIPTION_EMAILS.map((e) => e.toLowerCase()), ...extra]);
}

export function isSubscriptionSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return superSubscriptionEmailSet().has(email.trim().toLowerCase());
}
