import type { Analysis } from "@/lib/types";
import { GENERIC_AI_ANSWER } from "@/data/fixtures";

/* 只去掉模型自己输出的 markdown 记号，一个字都不改写。
   保留原始换行，让它看起来就是模型吐出来的样子。 */
function stripMarkdown(s: string): string {
  return s.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
}

/**
 * WOW：AI 对照屏。
 *
 * 这里讲的**不是**「AI 答错了」—— 实测三条示例它全答对了，
 * SPEC 的「对抗样例的诚实门槛」也明确禁止硬编不公平对比。
 * 讲的是：它这次对了，但它给不出数字、给不出可指认的依据、
 * 每问一次措辞都不一样，所以你没有办法知道它下次什么时候会错。
 */
export function AiComparison({ data }: { data: Analysis }) {
  const answer = stripMarkdown(GENERIC_AI_ANSWER.text);
  const top = [...data.contributions].sort((a, b) => b.points - a.points)[0];

  return (
    <section className="sihat-rise mt-8 overflow-hidden rounded-[20px] border border-hairline bg-surface shadow-card">
      <div className="border-b border-hairline px-6 py-5 sm:px-9">
        <h2 className="text-title-sm font-normal text-ink sm:text-title">
          Same message. Both say &ldquo;don&rsquo;t do it.&rdquo;
        </h2>
        <p className="mt-2 max-w-[62ch] text-body font-normal text-ink-soft">
          Only one of them can show you why — and give you the same answer
          twice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* ---- 左：通用 LLM ---- */}
        <div className="border-b border-hairline p-6 md:border-b-0 md:border-r md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-eyebrow font-semibold uppercase text-ink-soft">
              A general AI chatbot
            </h3>
            <span className="shrink-0 text-[0.6875rem] font-normal text-ink-faint">
              captured {GENERIC_AI_ANSWER.capturedOn}
            </span>
          </div>

          <p className="mt-4 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-[12px] bg-sunken p-4 text-meta font-normal leading-relaxed text-ink-soft">
            {answer}
          </p>

          <dl className="mt-5 space-y-2.5">
            <Stat label="Risk score" value="none" />
            <Stat label="Auditable factors" value="none" />
            <Stat
              label="Same answer twice?"
              value="not guaranteed"
              warn
            />
            <Stat
              label="Length"
              value={`${answer.length.toLocaleString()} characters`}
            />
          </dl>

          <p className="mt-4 text-meta font-normal text-ink-faint">
            Verbatim from {GENERIC_AI_ANSWER.model}, asked with no system
            prompt. It is correct — that is the point.
          </p>
        </div>

        {/* ---- 右：SIHAT（本次真实结果） ---- */}
        <div className="bg-brand-tint/40 p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-eyebrow font-semibold uppercase text-brand">
              SIHAT
            </h3>
            <span className="shrink-0 text-[0.6875rem] font-normal text-ink-faint">
              this analysis, live
            </span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-display-sm font-[250] tabular-nums leading-none text-ink">
              {data.score.toFixed(1)}
            </span>
            <span className="mb-1.5 text-action font-medium text-ink-soft">
              / 100
            </span>
          </div>

          <dl className="mt-5 space-y-2.5">
            <Stat label="Risk score" value={data.score.toFixed(1)} />
            <Stat label="Auditable factors" value="4, each weighted" />
            <Stat label="Same answer twice?" value="always identical" good />
            <Stat
              label="Largest driver"
              value={`${top.label} (${top.points.toFixed(1)})`}
            />
          </dl>

          <p className="mt-4 text-meta font-normal text-ink-soft">
            Computed in <code className="font-normal">lib/core/scoring.ts</code>
            . The AI never touches the number.
          </p>
        </div>
      </div>

      <p className="border-t border-hairline px-6 py-5 text-body font-normal text-ink sm:px-9">
        <span className="font-normal">
          &ldquo;Bukan AI yang cakap. Data KKM yang cakap.&rdquo;
        </span>{" "}
        <span className="text-ink-faint">
          — it is not the AI talking, it is the data talking.
        </span>
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  good,
  warn,
}: {
  label: string;
  value: string;
  good?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2 last:border-b-0">
      <dt className="text-meta font-normal text-ink-faint">{label}</dt>
      <dd
        className={`text-meta font-medium tabular-nums ${
          good ? "text-risk-low" : warn ? "text-risk-medium" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
