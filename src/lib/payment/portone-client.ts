import { setMvpPremiumInBrowser } from "@/lib/subscription/mvp-premium-ls";

function getImp() {
  if (typeof window === "undefined") return null;
  return window.IMP ?? null;
}

export function getPortOneImpCode(): string {
  return (process.env.NEXT_PUBLIC_IMP_UID ?? "").trim();
}

/**
 * PortOne 콘솔에 연동한 PG·MID와 동일한 문자열이어야 합니다.
 * - 채널이 하나면 보통 `html5_inicis`
 * - 테스트 MID(INIpayTest 등)를 콘솔에 따로 두었다면 `html5_inicis.INIpayTest` 처럼 `{pg코드}.{MID}` 형식
 */
export function getPortOnePgParam(): string {
  const v = (process.env.NEXT_PUBLIC_PORTONE_PG ?? "").trim();
  return v || "html5_inicis";
}

function defaultBuyerTel(): string {
  const v = (process.env.NEXT_PUBLIC_PAYMENT_BUYER_TEL ?? "").trim();
  return v || "010-0000-0000";
}

export type PortOnePremiumOptions = {
  impCode: string;
  buyerEmail: string;
  buyerName: string;
  /** 이니시스 등 PG별 연락처(미입력 시 환경변수·기본값) */
  buyerTel?: string;
  onMissingScript?: () => void;
  onMissingImpCode?: () => void;
  onBeforeRedirect?: () => void;
  /** 성공 리다이렉트 제외, 콜백이 끝난 뒤(실패·취소·알림 후) */
  onSettled?: () => void;
};

/**
 * 단건 ₩4,900. `pg`는 `NEXT_PUBLIC_PORTONE_PG` 또는 기본 `html5_inicis`.
 * 성공 시 프리미엄 플래그 저장 후 `/success` 로 이동합니다.
 */
export function requestPortOnePremiumOneTime(opts: PortOnePremiumOptions): void {
  const IMP = getImp();
  if (!IMP) {
    opts.onMissingScript?.();
    return;
  }
  if (!opts.impCode) {
    opts.onMissingImpCode?.();
    return;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const buyerTel = (opts.buyerTel ?? "").trim() || defaultBuyerTel();
  IMP.init(opts.impCode);
  IMP.request_pay(
    {
      pg: getPortOnePgParam(),
      pay_method: "card",
      merchant_uid: `order_${Date.now()}`,
      name: "AI 헬스 코치 프리미엄",
      amount: 4900,
      buyer_email: opts.buyerEmail || "test@test.com",
      buyer_name: opts.buyerName || "회원",
      buyer_tel: buyerTel,
      ...(origin ? { m_redirect_url: `${origin}/success` } : {}),
    },
    (rsp) => {
      if (rsp.success) {
        setMvpPremiumInBrowser(true);
        opts.onBeforeRedirect?.();
        window.location.href = "/success";
        return;
      }
      opts.onSettled?.();
      const msg = rsp.error_msg ? String(rsp.error_msg) : "알 수 없는 오류";
      if (/취소|cancel/i.test(msg)) {
        window.location.href = "/cancel";
        return;
      }
      window.alert(`결제 실패: ${msg}`);
    },
  );
}
