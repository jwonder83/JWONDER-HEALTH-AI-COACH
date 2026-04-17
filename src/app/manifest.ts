import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JWONDER 헬스 코칭",
    short_name: "JWS Coach",
    description: "헬스 기록과 웹 코칭",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f4",
    theme_color: "#e94b3c",
    lang: "ko",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
