import type { Analysis } from "@/lib/types";
import { DegradedBanner } from "@/components/DegradedBanner";

const BAND_STYLE: Record<Analysis["band"], string> = {
  low: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-emerald-100 text-emerald-800",
};
const BAND_LABEL: Record<Analysis["band"], string> = {
  low: "偏低",
  medium: "中等",
  high: "良好",
};

export function ResultCard({ data }: { data: Analysis }) {
  const max = Math.max(...data.contributions.map((c) => c.points), 1);
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {data.degraded ? <DegradedBanner /> : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">评估结果</p>
          <h2 className="mt-1 text-xl font-semibold">{data.headline}</h2>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-3xl font-semibold tabular-nums">
            {data.score}
          </div>
          <span
            className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${BAND_STYLE[data.band]}`}
          >
            {BAND_LABEL[data.band]}
          </span>
        </div>
      </div>

      {/* WOW 素材：因子贡献分解条 —— 这一块由确定性内核计算，评委看得见 */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          分数构成（由确定性模型计算，不经过 AI）
        </p>
        {data.contributions.map((c) => (
          <div key={c.key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-slate-600">
              {c.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-800 transition-all duration-300"
                style={{ width: `${(c.points / max) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-sm tabular-nums text-slate-700">
              {c.points}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-slate-700">
        {data.explanation}
      </p>

      {data.actions.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            建议行动
          </p>
          <ul className="mt-2 space-y-1">
            {data.actions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
