import { ImageResponse } from "next/og";

export const alt = "JWONDER 헬스 코칭";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(125deg, #2c1810 0%, #3d2419 42%, #c73d32 72%, #e94b3c 100%)",
          padding: 64,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, color: "#ffffff", letterSpacing: -3, lineHeight: 1.05 }}>JWONDER</div>
        <div style={{ marginTop: 16, fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>헬스 기록 · 웹 코칭</div>
        <div style={{ marginTop: 20, fontSize: 20, color: "rgba(255,255,255,0.78)" }}>기록을 남기고, 한 주를 정리해 보세요.</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
