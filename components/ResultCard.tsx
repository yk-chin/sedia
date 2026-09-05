"use client";

import type { Analysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DegradedBanner } from "@/components/DegradedBanner";
import { SectionLabel } from "@/components/SectionLabel";
import { HriBreakdown } from "@/components/HriBreakdown";
import { useCountUp } from "@/lib/useCountUp";

/* score 是 HRI 危害指数：越高越危险。
   所以 high 是红、low 是绿 —— 和「分数越高越好」的直觉相反，颜色必须说清楚。 */
const BAND_PILL: Record<Analysis["band"], string> = {
  low: "bg-risk-low-tint text-risk-low",
  medium: "bg-risk-medium-tint text-risk-medium",
  high: "bg-risk-high-tint text-risk-high",
};
const BAND_DOT: Record<Analysis["band"], string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};
const BAND_LABEL: Record<Analysis["band"], string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
};

export function ResultCard({ data }: { data: Analysis }) {
  const score = useCountUp(data.score);

  return (
    <article className="sihat-rise overflow-hidden rounded-[20px] border border-hairline bg-surface shadow-card">
      <div className="p-6 sm:p-9">
        {data.degraded ? (
          <div className="mb-7">
            <DegradedBanner />
          </div>
        ) : null}

        {/* ---- 主视觉：分数 ---- */}
        <p className="text-eyebrow font-semibold uppercase text-ink-soft">
          Harm Risk Index
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-3">
          <span className="text-display-sm font-[250] tabular-nums text-ink sm:text-display">
            {score.toFixed(1)}
          </span>
          <span
            className={cn(
              "mb-2 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-action font-semibold",
              BAND_PILL[data.band]
            )}
          >
            <span
              aria-hidden
              className={cn("h-2 w-2 rounded-full", BAND_DOT[data.band])}
            />
            {BAND_LABEL[data.band]}
          </span>
        </div>

        <h2 className="mt-5 max-w-[24ch] text-title-sm font-normal text-ink sm:text-title">
          {data.headline}
        </h2>

        {/* ---- 分解 ---- */}
        <div className="mt-9">
          <HriBreakdown contributions={data.contributions} band={data.band} />
        </div>

        {/* ---- 解释 ---- */}
        <div className="mt-9">
          <SectionLabel>What this means</SectionLabel>
          <p className="max-w-[65ch] text-body font-light text-ink">
            {data.explanation}
          </p>
        </div>

        {/* ---- 建议行动 ---- */}
        {data.actions.length > 0 ? (
          <div className="mt-9">
            <SectionLabel>Recommended actions</SectionLabel>
            <ol className="space-y-4">
              {data.actions.map((a, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-px w-5 shrink-0 text-action font-semibold tabular-nums text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="max-w-[62ch] text-action font-normal text-ink">
                    {a}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </article>
  );
}
