"use client";

import type { Analysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/SectionLabel";
import { useLang } from "@/lib/i18n/context";
import type { Dict } from "@/lib/i18n/dictionary";

/* 分解条按风险等级着色 —— 颜色带语义，不是装饰 */
const BAR_COLOR: Record<Analysis["band"], string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

/** 因子名按 key 在前端本地化，服务端返回的 label 只作兜底 */
function labelFor(t: Dict, key: string, fallback: string): string {
  return (t.factors as Record<string, string>)[key] ?? fallback;
}

/**
 * HRI 四维分解。这一屏是整个项目的核心差异点：
 * 这些数字由确定性内核算出，LLM 碰不到，所以敢把徽章挂上去。
 */
export function HriBreakdown({
  contributions,
  band,
}: {
  contributions: Analysis["contributions"];
  band: Analysis["band"];
}) {
  const { t } = useLang();
  const max = Math.max(...contributions.map((c) => c.points), 1);

  return (
    <section>
      <SectionLabel
        trailing={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-tint px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-brand">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t.result.notByAi}
          </span>
        }
      >
        {t.result.breakdown}
      </SectionLabel>

      <ul className="space-y-5">
        {contributions.map((c, i) => (
          <li key={c.key}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-action text-ink">
                {labelFor(t, c.key, c.label)}
              </span>
              <span className="text-action font-medium tabular-nums text-ink-soft">
                {c.points.toFixed(1)}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-sunken">
              <div
                className={cn("sihat-bar h-full rounded-full", BAR_COLOR[band])}
                style={
                  {
                    "--bar-width": `${(c.points / max) * 100}%`,
                    animationDelay: `${260 + i * 90}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-meta text-ink-faint">
        {t.result.deterministicNote}
      </p>
    </section>
  );
}
