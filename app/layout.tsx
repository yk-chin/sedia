import type { Metadata } from "next";
import "./globals.css";

/* 字体：自托管 Source Sans 3（public/fonts/），不使用 next/font/google。
   next/font 会在 build 时去 fonts.googleapis.com 抓字体，
   现场 WiFi 不稳或被限速时，本地 build 会直接失败。
   自托管 = build 和运行时都零网络依赖，且在投影仪上更锐利。 */

export const metadata: Metadata = {
  title: "SIHAT",
  description:
    "Paste a forwarded message, and in seconds know if it's true and if following it is risky.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* 预加载正文字体子集，避免首屏字体闪一下才换过来 */}
        <link
          rel="preload"
          href="/fonts/SourceSans3-Variable-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
