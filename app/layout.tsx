import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n/context";
import { AppShell } from "@/components/shell/AppShell";
import { LanguageGate } from "@/components/LanguageGate";
import { ServiceWorker } from "@/components/ServiceWorker";

/* 字体：自托管 Source Sans 3（public/fonts/），不使用 next/font/google。
   next/font 会在 build 时去 fonts.googleapis.com 抓字体，
   现场 WiFi 不稳或被限速时，本地 build 会直接失败。
   中文走系统字体栈（苹方/微软雅黑/思源），理由见 globals.css。 */

export const metadata: Metadata = {
  title: "Sihat",
  description:
    "Check a forwarded health message against Malaysia's official cancelled-product records.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Sihat", statusBarStyle: "default" },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf8",
  // 装到桌面后要顶到刘海区域，同时避免双击缩放导致的误触
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/SourceSans3-Variable-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <LangProvider>
          <ServiceWorker />
          <LanguageGate />
          <AppShell>{children}</AppShell>
        </LangProvider>
      </body>
    </html>
  );
}
