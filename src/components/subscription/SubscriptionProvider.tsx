"use client";

import { PaywallModal } from "@/components/subscription/PaywallModal";
import { hasPremiumAccess } from "@/lib/subscription/access";
import {
  MVP_PREMIUM_CHANGED_EVENT,
  readMvpPremiumFromBrowser,
} from "@/lib/subscription/mvp-premium-ls";
import { getPortOneImpCode, requestPortOnePremiumOneTime } from "@/lib/payment/portone-client";
import { loadSubscriptionFromBrowser } from "@/lib/subscription/storage";
import type { SubscriptionPersisted } from "@/types/subscription";
import type { PaywallReason } from "@/types/subscription";
import { SUBSCRIPTION_CHANGED_EVENT } from "@/types/subscription";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SubscriptionContextValue = {
  userId: string;
  /** 운영 슈퍼관리자 — 유료 기능 무료, 결제·Paywall 없음 */
  subscriptionSuperAdmin: boolean;
  persisted: SubscriptionPersisted;
  effectivePremium: boolean;
  openPaywall: (reason: PaywallReason) => void;
  closePaywall: () => void;
  paywallOpen: boolean;
  paywallReason: PaywallReason | null;
  /** PortOne 단건 ₩4,900 — 성공 시 `/success` */
  requestPortOnePremium: () => void;
  portOneBusy: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function useSubscription(): SubscriptionContextValue {
  const v = useContext(SubscriptionContext);
  if (!v) {
    throw new Error("useSubscription 은 SubscriptionProvider 안에서만 사용하세요.");
  }
  return v;
}

type ProviderProps = {
  userId: string;
  subscriptionSuperAdmin?: boolean;
  /** PortOne buyer_email (로그인 이메일 권장) */
  buyerEmail?: string;
  buyerDisplayName?: string;
  /** PortOne buyer_tel (이니시스 등에서 권장). 없으면 NEXT_PUBLIC_PAYMENT_BUYER_TEL·기본값 */
  buyerPhone?: string;
  children: ReactNode;
};

export function SubscriptionProvider({
  userId,
  subscriptionSuperAdmin = false,
  buyerEmail = "",
  buyerDisplayName = "",
  buyerPhone = "",
  children,
}: ProviderProps) {
  const [persisted, setPersisted] = useState<SubscriptionPersisted>(() => loadSubscriptionFromBrowser(userId));
  const [mvpLsPremium, setMvpLsPremium] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);
  const [portOneBusy, setPortOneBusy] = useState(false);

  const reloadLocal = useCallback(() => {
    setPersisted(loadSubscriptionFromBrowser(userId));
  }, [userId]);

  useEffect(() => {
    reloadLocal();
  }, [reloadLocal, userId]);

  useEffect(() => {
    function bump() {
      setMvpLsPremium(readMvpPremiumFromBrowser());
    }
    bump();
    window.addEventListener("storage", bump);
    window.addEventListener(MVP_PREMIUM_CHANGED_EVENT, bump);
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener(MVP_PREMIUM_CHANGED_EVENT, bump);
    };
  }, []);

  useEffect(() => {
    function onEvt(e: Event) {
      const d = (e as CustomEvent<{ userId?: string }>).detail;
      if (!d?.userId || d.userId === userId) reloadLocal();
    }
    window.addEventListener(SUBSCRIPTION_CHANGED_EVENT, onEvt as EventListener);
    return () => window.removeEventListener(SUBSCRIPTION_CHANGED_EVENT, onEvt as EventListener);
  }, [reloadLocal, userId]);

  const effectivePremium = useMemo(
    () => subscriptionSuperAdmin || hasPremiumAccess(persisted) || mvpLsPremium,
    [subscriptionSuperAdmin, persisted, mvpLsPremium],
  );

  const openPaywall = useCallback(
    (reason: PaywallReason) => {
      if (subscriptionSuperAdmin) return;
      setPaywallReason(reason);
      setPaywallOpen(true);
    },
    [subscriptionSuperAdmin],
  );

  const closePaywall = useCallback(() => {
    setPaywallOpen(false);
  }, []);

  const requestPortOnePremium = useCallback(() => {
    if (subscriptionSuperAdmin) {
      window.alert("슈퍼관리자 계정은 결제 없이 모든 기능을 사용할 수 있습니다.");
      return;
    }
    const code = getPortOneImpCode();
    if (!code) {
      window.alert("NEXT_PUBLIC_IMP_UID(가맹점 식별코드)를 .env에 설정해 주세요.");
      return;
    }
    setPortOneBusy(true);
    const email = buyerEmail.trim() || "test@test.com";
    const name = (buyerDisplayName.trim() || email.split("@")[0] || "회원").slice(0, 40);
    requestPortOnePremiumOneTime({
      impCode: code,
      buyerEmail: email,
      buyerName: name,
      buyerTel: buyerPhone.trim() || undefined,
      onMissingScript: () => {
        setPortOneBusy(false);
        window.alert("결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      },
      onMissingImpCode: () => {
        setPortOneBusy(false);
        window.alert("NEXT_PUBLIC_IMP_UID(가맹점 식별코드)를 .env에 설정해 주세요.");
      },
      onBeforeRedirect: () => setPortOneBusy(false),
      onSettled: () => setPortOneBusy(false),
    });
  }, [subscriptionSuperAdmin, buyerEmail, buyerDisplayName, buyerPhone]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      userId,
      subscriptionSuperAdmin,
      persisted,
      effectivePremium,
      openPaywall,
      closePaywall,
      paywallOpen,
      paywallReason,
      requestPortOnePremium,
      portOneBusy,
    }),
    [
      userId,
      subscriptionSuperAdmin,
      persisted,
      effectivePremium,
      openPaywall,
      closePaywall,
      paywallOpen,
      paywallReason,
      requestPortOnePremium,
      portOneBusy,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <PaywallModal
        open={paywallOpen && !subscriptionSuperAdmin}
        reason={paywallReason}
        onClose={closePaywall}
        busy={portOneBusy}
        onPay={() => {
          requestPortOnePremium();
        }}
      />
    </SubscriptionContext.Provider>
  );
}
