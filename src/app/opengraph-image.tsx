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
          background: "linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 45%, #f5f5f3 100%)",
          padding: 64,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 600, color: "#ffffff", letterSpacing: 8, lineHeight: 1.05, textTransform: "uppercase" }}>JWONDER</div>
        <div style={{ marginTop: 20, fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>헬스 기록 · 웹 코칭</div>
        <div style={{ marginTop: 16, fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>기록을 남기고, 한 주를 정리해 보세요.</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
