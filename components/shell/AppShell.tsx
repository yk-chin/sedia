"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { useLang } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * 应用外壳。
 * 桌面端导航在顶部，手机端在底部做成 tab bar —— 手机上底部才是拇指够得到的地方。
 * Web 和 App 共用同一套代码，差别只有这一处布局切换。
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const path = usePathname();

  const tabs = [
    { href: "/", label: t.nav.analyse, icon: IconCheck },
    { href: "/history", label: t.nav.history, icon: IconClock },
    { href: "/settings", label: t.nav.settings, icon: IconGear },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-50 border-b border-hairline bg-surface/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="rounded-lg">
            <Wordmark />
          </Link>
          <span aria-hidden className="h-3.5 w-px bg-hairline-strong" />
          <span className="truncate text-meta text-ink-faint">
            {t.app.descriptor}
          </span>

          {/* 桌面端导航 */}
          <nav className="ml-auto hidden items-center gap-1 sm:flex">
            {tabs.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-meta font-medium transition-colors duration-200",
                  path === href
                    ? "bg-sunken text-ink"
                    : "text-ink-soft hover:text-ink"
                )}
                style={{ transitionTimingFunction: "var(--ease-standard)" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* 底部 tab bar 会盖住内容，手机端多留 5rem */}
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
        {children}
      </main>

      {/* 手机端底部 tab bar，桌面端隐藏 */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto flex max-w-md">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors duration-200",
                  active ? "text-brand" : "text-ink-faint"
                )}
                style={{ transitionTimingFunction: "var(--ease-standard)" }}
              >
                <Icon active={active} />
                <span className="text-[0.6875rem] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* 图标：统一 22px、1.75 描边、圆头圆角，对齐 SF Symbols 的手感 */
type IconProps = { active?: boolean };
const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconCheck({ active }: IconProps) {
  return (
    <svg {...base} aria-hidden>
      <path d="M12 3.5 19.5 6.5v5c0 4.6-3.1 7.9-7.5 9.2-4.4-1.3-7.5-4.6-7.5-9.2v-5z" />
      <path d="M9 12.2l2.2 2.2L15.4 10" strokeWidth={active ? 2.2 : 1.75} />
    </svg>
  );
}

function IconClock() {
  return (
    <svg {...base} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.4V12l3 1.8" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg {...base} aria-hidden>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.2 14.6a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.56 1.03z" />
    </svg>
  );
}
