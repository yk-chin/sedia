"use client";

import type { FlagKey } from "@/lib/core/flags";
import { useLang } from "@/lib/i18n/context";
import type { Dict } from "@/lib/i18n/dictionary";

/**
 * 断网 / 省流量时的结果。
 *
 * 刻意**不显示任何分数**：HRI 的四个因子评分来自 LLM，本地拿不到。
 * 用关键词凑一个数字出来，会让同一条消息在线离线显示两个不同的分数，
 * 「同样输入永远同样分数」这个立身之本当场就没了。
 * 所以这里只给确定性的标记，并且明说它不是 HRI。
 */
export function OfflineResult({
  flags,
  reason,
  onRetry,
}: {
  flags: FlagKey[];
  /** offline = 真没网；saver = 用户主动开了省流量 */
  reason: "offline" | "saver";
  onRetry?: () => void;
}) {
  const { t } = useLang();
  const labels = t.flagLabels as Record<string, string>;

  return (
    <section className="sihat-rise overflow-hidden rounded-[20px] border border-hairline bg-surface shadow-card">
      <div className="border-b border-hairline px-6 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-risk-medium" />
          <h2 className="text-eyebrow font-semibold uppercase text-ink-soft">
            {t.offline.title}
          </h2>
        </div>
        <p className="mt-3 max-w-[62ch] text-body text-ink">
          {reason === "offline" ? t.offline.leadOffline : t.offline.leadSaver}
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8">
        <h3 className="text-eyebrow font-semibold uppercase text-ink-soft">
          {t.offline.flagsTitle}
        </h3>

        {flags.length === 0 ? (
          <p className="mt-4 text-body text-ink-soft">{t.offline.noFlags}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {flags.map((f, i) => (
              <li
                key={f}
                className="sihat-rise flex gap-3"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  aria-hidden
                  className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-risk-medium"
                />
                <span className="max-w-[60ch] text-action text-ink">
                  {labels[f] ?? f}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* 必须说清楚：这不是 HRI */}
        <p className="mt-6 max-w-[62ch] border-t border-hairline pt-5 text-meta leading-relaxed text-ink-faint">
          {t.offline.notAScore}
        </p>

        {onRetry ? (
          <button
            onClick={onRetry}
            className="mt-4 rounded-full border border-hairline-strong px-5 py-2.5 text-action font-medium text-ink-soft transition-colors duration-200 hover:border-ink hover:text-ink"
            style={{ transitionTimingFunction: "var(--ease-standard)" }}
          >
            {t.offline.retryOnline}
          </button>
        ) : null}
      </div>
    </section>
  );
}

/** 给 page.tsx 用的类型别名，避免它直接依赖 Dict 内部结构 */
export type FlagLabels = Dict["flagLabels"];
