"use client";

import { useEffect } from "react";

/** `pwa/service-worker.js`가 `public/sw.js`로 복사된 뒤 등록됩니다 (`predev` / `prebuild`). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const onLoad = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* 등록 실패는 PWA 비필수 경로이므로 조용히 무시 */
      });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
