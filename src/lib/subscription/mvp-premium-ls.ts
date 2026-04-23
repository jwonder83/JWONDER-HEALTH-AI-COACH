/** MVP: PortOne 결제 성공 후 `localStorage.isPremium === "true"` 로 잠금 해제 */
export const MVP_PREMIUM_LS_KEY = "isPremium";
export const MVP_PREMIUM_CHANGED_EVENT = "jws-mvp-premium-changed";

export function readMvpPremiumFromBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MVP_PREMIUM_LS_KEY) === "true";
}

export function setMvpPremiumInBrowser(active: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MVP_PREMIUM_LS_KEY, active ? "true" : "false");
  window.dispatchEvent(new CustomEvent(MVP_PREMIUM_CHANGED_EVENT));
}
