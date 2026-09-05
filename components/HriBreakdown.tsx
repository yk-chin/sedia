import type { Analysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/SectionLabel";

/* 分解条按风险等级着色 —— 颜色带语义，不是装饰 */
const BAR_COLOR: Record<Analysis["band"], string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

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
  const max = Math.max(...contributions.map((c) => c.points), 1);

  return (
    <section>
      <SectionLabel
        trailing={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-sunken px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-ink-soft">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-risk-low"
            />
            Not by AI
          </span>
        }
      >
        Breakdown
      </SectionLabel>

      <ul className="space-y-5">
        {contributions.map((c, i) => (
          <li key={c.key}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-action font-normal text-ink">
                {c.label}
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
                    // 动画终点由 --bar-width 决定，逐条 stagger 90ms
                    "--bar-width": `${(c.points / max) * 100}%`,
                    animationDelay: `${260 + i * 90}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-meta font-normal text-ink-faint">
        Computed by a deterministic scoring model — the same input always
        returns the same score.
      </p>
    </section>
  );
}
