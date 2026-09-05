"use client";

import { useLang } from "@/lib/i18n/context";
import { LANGUAGES, LANG_CODES } from "@/lib/i18n/dictionary";
import { Mark } from "@/components/Wordmark";

/**
 * 首次进入时的语言选择。
 * 选过一次就写进 localStorage，之后不再出现，可以在「设置」里改。
 * 三个语言的名字都用它自己的写法（English / Bahasa Melayu / 简体中文）——
 * 让用户在自己的语言里找到自己，而不是先读懂英文才能选。
 */
export function LanguageGate() {
  const { t, setLang, needsChoice, ready } = useLang();

  if (!ready || !needsChoice) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/25 backdrop-blur-sm sm:items-center"
    >
      <div
        className="sihat-rise w-full max-w-md rounded-t-[28px] border border-hairline bg-surface p-7 shadow-lift sm:rounded-[28px]"
        style={{ animationDuration: "0.45s" }}
      >
        <Mark size={34} />
        <h2 className="mt-5 text-title-sm font-normal text-ink">
          {t.chooser.title}
        </h2>
        <p className="mt-2 text-body text-ink-soft">{t.chooser.subtitle}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          {LANG_CODES.map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className="flex items-center justify-between rounded-[14px] border border-hairline-strong px-5 py-4 text-left transition-all duration-200 hover:border-brand hover:bg-brand-tint active:scale-[0.99]"
              style={{ transitionTimingFunction: "var(--ease-standard)" }}
            >
              <span className="text-body font-medium text-ink">
                {LANGUAGES[code].native}
              </span>
              <span className="text-meta text-ink-faint">
                {LANGUAGES[code].label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
