import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e94b3c 0%, #ff8a7a 100%)",
          borderRadius: 112,
        }}
      >
        <span style={{ fontSize: 300, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>J</span>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
