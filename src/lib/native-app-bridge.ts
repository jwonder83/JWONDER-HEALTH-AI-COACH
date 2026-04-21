type NativeWebView = { postMessage: (message: string) => void };

function getNativeWebView(): NativeWebView | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { ReactNativeWebView?: NativeWebView }).ReactNativeWebView;
}

/** Expo WebView 등에서 `window.ReactNativeWebView.postMessage`로 네이티브에 이벤트 전달 */
export function postToNativeApp(payload: Record<string, unknown>): void {
  const bridge = getNativeWebView();
  if (!bridge) return;
  try {
    bridge.postMessage(JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
