"use client";

import { useEffect, useState } from "react";
import type { Analysis } from "@/lib/types";
import { useLang } from "@/lib/i18n/context";
import type { Dict } from "@/lib/i18n/dictionary";

/* 只去掉模型自己输出的 markdown 记号，一个字都不改写。
   保留原始换行，让它看起来就是模型吐出来的样子。 */
function stripMarkdown(s: string): string {
  return s.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
}

function labelFor(t: Dict, key: string, fallback: string): string {
  return (t.factors as Record<string, string>)[key] ?? fallback;
}

/**
 * WOW：AI 对照屏。
 *
 * 这里讲的**不是**「AI 答错了」—— 实测三条示例它全答对了，
 * SPEC 的「对抗样例的诚实门槛」也明确禁止硬编不公平对比。
 * 讲的是：它这次对了，但它给不出数字、给不出可指认的依据、
 * 每问一次措辞都不一样，所以你没有办法知道它下次什么时候会错。
 */
type Asked = {
  answer: string;
  model: string;
  /** live = 真的问到了这一条；safe = SAFE_MODE 预置；failed = 没问到 */
  mode: "live" | "safe" | "failed";
  capturedOn: string | null;
};

export function AiComparison({
  data,
  message,
}: {
  data: Analysis;
  message: string;
}) {
  const { t, lang } = useLang();
  const [asked, setAsked] = useState<Asked | null>(null);
  const top = [...data.contributions].sort((a, b) => b.points - a.points)[0];

  /* 实时去问 —— 界面写着「问了同一条消息」，那就必须真的问这一条。
     组件是点开对照屏才挂载的，所以这个请求不会拖慢主流程。 */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setAsked(null);
    fetch("/api/ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, lang }),
    })
      .then((r) => r.json())
      .then((d: Asked) => {
        if (!cancelled) setAsked(d);
      })
      .catch(() => {
        if (!cancelled)
          setAsked({ answer: "", model: "", mode: "failed", capturedOn: null });
      });
    return () => {
      cancelled = true;
    };
  }, [message, lang, attempt]);

  const answer = asked ? stripMarkdown(asked.answer) : "";

  return (
    <section className="sihat-rise mt-8 overflow-hidden rounded-[20px] border border-hairline bg-surface shadow-card">
      <div className="border-b border-hairline px-6 py-5 sm:px-9">
        <h2 className="text-title-sm font-normal text-ink sm:text-title">
          {t.compare.title}
        </h2>
        <p className="mt-2 max-w-[62ch] text-body text-ink-soft">
          {t.compare.lede}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* ---- 左：通用 LLM ---- */}
        <div className="border-b border-hairline p-6 md:border-b-0 md:border-r md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-eyebrow font-semibold uppercase text-ink-soft">
              {t.compare.chatbot}
            </h3>
            <span className="shrink-0 text-[0.6875rem] text-ink-faint">
              {asked === null
                ? "…"
                : asked.mode === "live"
                  ? t.compare.askedNow
                  : asked.mode === "safe"
                    ? `${t.compare.captured} ${asked.capturedOn ?? ""}`
                    : ""}
            </span>
          </div>

          {asked === null ? (
            <div
              role="status"
              aria-label={t.compare.asking}
              className="mt-4 space-y-2.5 rounded-[12px] bg-sunken p-4"
            >
              {[100, 92, 97, 78].map((w, i) => (
                <div
                  key={i}
                  className="sihat-shimmer h-3 rounded-full"
                  style={{ width: `${w}%` }}
                />
              ))}
              <p className="pt-1 text-meta text-ink-faint">{t.compare.asking}</p>
            </div>
          ) : asked.mode === "failed" ? (
            /* 调用失败时**不**摆出那段针对别的消息的预置回答 ——
               那正是「怎么问什么都一样」的来源 */
            <div className="mt-4 rounded-[12px] border border-dashed border-hairline-strong bg-sunken/60 p-5 text-center">
              <p className="text-meta text-ink-soft">{t.compare.askFailed}</p>
              <button
                onClick={() => setAttempt((n) => n + 1)}
                className="mt-3 rounded-full border border-hairline-strong px-4 py-1.5 text-meta text-ink-soft transition-colors duration-200 hover:border-ink hover:text-ink"
                style={{ transitionTimingFunction: "var(--ease-standard)" }}
              >
                {t.compare.askRetry}
              </button>
            </div>
          ) : (
            <p className="mt-4 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-[12px] bg-sunken p-4 text-meta leading-relaxed text-ink-soft">
              {answer}
            </p>
          )}

          <dl className="mt-5 space-y-2.5">
            <Stat label={t.compare.riskScore} value={t.compare.none} />
            <Stat label={t.compare.auditable} value={t.compare.none} />
            <Stat label={t.compare.twice} value={t.compare.notGuaranteed} warn />
            <Stat
              label={t.compare.length}
              value={
                asked === null
                  ? "…"
                  : asked.mode === "failed"
                    ? "—"
                    : `${answer.length.toLocaleString()} ${t.compare.characters}`
              }
            />
          </dl>

          {asked !== null && asked.mode !== "failed" ? (
            <p className="mt-4 text-meta text-ink-faint">
              {asked.mode === "live" ? (
                <>
                  {asked.model} · {t.compare.chatbotNote}
                </>
              ) : (
                t.compare.offlineNote
              )}
            </p>
          ) : null}
        </div>

        {/* ---- 右：SIHAT（本次真实结果） ---- */}
        <div className="bg-brand-tint/40 p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-eyebrow font-semibold uppercase text-brand">
              Sihat
            </h3>
            <span className="shrink-0 text-[0.6875rem] text-ink-faint">
              {t.compare.live}
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
            <Stat label={t.compare.riskScore} value={data.score.toFixed(1)} />
            <Stat label={t.compare.auditable} value={t.compare.fourWeighted} />
            <Stat label={t.compare.twice} value={t.compare.identical} good />
            <Stat
              label={t.compare.largestDriver}
              value={`${labelFor(t, top.key, top.label)} (${top.points.toFixed(1)})`}
            />
          </dl>

          <p className="mt-4 text-meta text-ink-soft">
            <code className="font-normal">lib/core/scoring.ts</code> ·{" "}
            {t.compare.sihatNote}
          </p>
        </div>
      </div>

      <p className="border-t border-hairline px-6 py-5 text-body text-ink sm:px-9">
        <span className="font-medium">{t.compare.punchline}</span>{" "}
        <span className="text-ink-faint">{t.compare.punchlineGloss}</span>
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
      <dt className="text-meta text-ink-faint">{label}</dt>
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
