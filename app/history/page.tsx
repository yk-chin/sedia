"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/context";
import { readHistory, clearHistory, type HistoryItem } from "@/lib/history";
import { EmptyState } from "@/components/states/EmptyState";
import { cn } from "@/lib/utils";

const BAND_DOT = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
} as const;

export default function HistoryPage() {
  const { t, lang } = useLang();
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  // localStorage 只能在客户端读，服务端渲染时先给 null（骨架），挂载后再填
  useEffect(() => setItems(readHistory()), []);

  const fmt = new Intl.DateTimeFormat(
    lang === "zh" ? "zh-CN" : lang === "ms" ? "ms-MY" : "en-GB",
    { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
  );

  return (
    <>
      <header className="sihat-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-hero-sm font-light text-ink">{t.history.title}</h1>
          <p className="mt-2 max-w-[52ch] text-body text-ink-soft">
            {t.history.subtitle}
          </p>
        </div>
        {items?.length ? (
          <button
            onClick={() => {
              clearHistory();
              setItems([]);
            }}
            className="rounded-full border border-hairline-strong px-4 py-2 text-meta text-ink-soft transition-colors duration-200 hover:border-risk-high hover:text-risk-high"
            style={{ transitionTimingFunction: "var(--ease-standard)" }}
          >
            {t.history.clear}
          </button>
        ) : null}
      </header>

      <div className="mt-8">
        {items === null ? null : items.length === 0 ? (
          <EmptyState title={t.history.empty} hint={t.history.emptyHint} />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {items.map((it, i) => (
              <li
                key={it.id}
                className="sihat-rise rounded-[16px] border border-hairline bg-surface p-5 shadow-card"
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="line-clamp-2 max-w-[62ch] text-body text-ink">
                    {it.excerpt}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        "h-2 w-2 rounded-full",
                        BAND_DOT[it.band]
                      )}
                    />
                    <span className="text-action font-medium tabular-nums text-ink">
                      {it.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-meta text-ink-faint">
                  <time dateTime={it.at}>{fmt.format(new Date(it.at))}</time>
                  {it.flagged ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-high-tint px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-risk-high">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-risk-high"
                      />
                      {t.history.flagged}
                      {it.product ? ` · ${it.product}` : ""}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
