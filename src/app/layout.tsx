import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#e94b3c",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const rawBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const metadataBase = rawBase ? new URL(rawBase) : new URL("http://localhost:3000");
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
    <html lang="ko" className={`${dmSans.variable} ${syne.variable}`}>
      <body className="min-h-screen font-sans antialiased selection:bg-apple/22 selection:text-apple-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:border focus:border-orange-200 focus:bg-white focus:px-4 focus:py-3 focus:text-[14px] focus:font-semibold focus:text-apple-ink focus:shadow-lg"
        >
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
