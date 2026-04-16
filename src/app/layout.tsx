import type { Metadata } from "next";
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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: site.copy.appTitle,
    description: site.copy.appDescription,
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
        {children}
      </body>
    </html>
  );
}
