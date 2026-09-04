import type { Metadata } from "next";
import "./globals.css";

/* 刻意不使用 next/font/google：
   next/font 会在 build 时去 fonts.googleapis.com 抓字体。
   现场 WiFi 不稳或被限速时，本地 build 会直接失败。
   用系统字体栈，零网络依赖，且在投影仪上更锐利。 */

export const metadata: Metadata = {
  title: "⟨项目名⟩",
  description: "⟨一句话定义⟩",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hans">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
