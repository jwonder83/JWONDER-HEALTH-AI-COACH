import type { Metadata, Viewport } from "next";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

function resolveMetadataBase(): URL {
  // 우선순위: 명시적 SITE_URL → Vercel 프로덕션 도메인 → 현재 배포 도메인 → 로컬 개발
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      // 잘못된 형식이면 무시하고 아래 fallback 사용
    }
  }
  const vercelProd = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return new URL(`https://${vercelProd}`);

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl) return new URL(`https://${vercelUrl}`);

  return new URL("http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const metadataBase = resolveMetadataBase();
  const title = site.copy.appTitle;
  const description = site.copy.appDescription;
  return {
    metadataBase,
    title,
    description,
    applicationName: title,
    openGraph: {
      title,
      description,
      url: metadataBase,
      siteName: title,
      locale: "ko_KR",
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    appleWebApp: {
      capable: true,
      title,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans antialiased selection:bg-black/10 selection:text-apple-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:border focus:border-black focus:bg-white focus:px-4 focus:py-3 focus:text-[14px] focus:font-medium focus:text-apple-ink focus:shadow-md"
        >
          본문 바로가기
        </a>
        {children}
      </body>
    </html>
  );
}
