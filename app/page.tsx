"use client";

import { useEffect, useRef, useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { AiComparison } from "@/components/AiComparison";
import { EvidenceCard } from "@/components/EvidenceCard";
import { DEMO_SEED_INPUTS } from "@/data/fixtures";
import { useLang } from "@/lib/i18n/context";
import { addHistory } from "@/lib/history";
import { cn } from "@/lib/utils";
import type { Analysis } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

/** 和 lib/types.ts 的 AnalyzeRequestSchema 上限保持一致，避免用户打超了才被 400 打回来 */
const MAX_CHARS = 2000;

export default function Home() {
  const { t, lang } = useLang();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  // 默认 Ctrl（Windows / Linux），挂载后才判断是不是 Mac —— 避免 SSR 水合不一致
  const [modKey, setModKey] = useState("Ctrl");
  const [showCompare, setShowCompare] = useState(false);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setModKey("⌘");
  }, []);

  // 输入框跟着内容长高，长消息不会被截断（上限 320px，之后内部滚动）
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
    el.style.overflowY = el.scrollHeight > 320 ? "auto" : "hidden";
  }, [text]);

  const busy = status === "loading";

  async function run(input: string) {
    if (!input.trim()) return;
    setStatus("loading");
    setError("");
    setShowCompare(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, lang }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const parsed = (await res.json()) as Analysis;
      setData(parsed);
      setStatus("done");
      addHistory(input, parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <>
      <section className="sihat-rise">
        <h1 className="max-w-[26ch] text-hero-sm font-light text-ink sm:text-hero">
          {t.hero.title}
        </h1>
        <p className="mt-5 max-w-[62ch] text-lede text-ink-soft">
          {t.hero.lede}
        </p>
      </section>

      <section
        className="sihat-rise mt-10 rounded-[20px] border border-hairline bg-surface p-5 shadow-card sm:p-7"
        style={{ animationDelay: "90ms" }}
      >
        <label
          htmlFor="input"
          className="text-eyebrow font-semibold uppercase text-ink-soft"
        >
          {t.input.label}
        </label>

        <textarea
          id="input"
          ref={boxRef}
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void run(text);
            }
          }}
          rows={3}
          placeholder={t.input.placeholder}
          className="mt-3 w-full resize-none overflow-y-hidden rounded-xl border border-hairline-strong bg-canvas px-4 py-3.5 text-body text-ink outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-ink"
        />

        <div className="mt-1.5 flex items-center justify-between gap-3 text-meta text-ink-faint">
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            {t.input.hintPress}
            <kbd className="rounded-[5px] border border-hairline-strong bg-surface px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-soft">
              {modKey}
            </kbd>
            <kbd className="rounded-[5px] border border-hairline-strong bg-surface px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-soft">
              Enter
            </kbd>
            {t.input.hintAnalyse}
          </span>
          <span className="ml-auto tabular-nums">
            {text.length} / {MAX_CHARS}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => void run(text)}
            disabled={busy || !text.trim()}
            className={cn(
              "rounded-full bg-ink px-6 py-3 text-action font-medium text-surface",
              "transition-all duration-200 hover:opacity-90 active:scale-[0.98]",
              "disabled:pointer-events-none disabled:opacity-30"
            )}
            style={{ transitionTimingFunction: "var(--ease-standard)" }}
          >
            {busy ? t.input.analysing : t.input.analyse}
          </button>

          <span className="ml-1 text-meta text-ink-faint">{t.input.orTry}</span>
          {DEMO_SEED_INPUTS.map((s, i) => (
            <button
              key={i}
              disabled={busy}
              onClick={() => {
                setText(s);
                void run(s);
              }}
              className={cn(
                "rounded-full border border-hairline-strong px-4 py-2 text-meta text-ink-soft",
                "transition-all duration-200 hover:border-ink hover:text-ink active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
              style={{ transitionTimingFunction: "var(--ease-standard)" }}
            >
              {t.input.example} {i + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        {status === "idle" && (
          <EmptyState title={t.states.emptyTitle} hint={t.states.emptyHint} />
        )}
        {status === "loading" && <LoadingState />}
        {status === "error" && (
          <ErrorState message={error} onRetry={() => void run(text)} />
        )}
        {status === "done" && data && (
          <>
            {/* 官方记录命中时排在分数前面 —— 查到的记录是确定的，分数是估算的 */}
            {data.evidence ? (
              <div className="mb-6">
                <EvidenceCard evidence={data.evidence} />
              </div>
            ) : null}

            <ResultCard data={data} />

            {!showCompare && (
              <button
                onClick={() => setShowCompare(true)}
                className={cn(
                  "mt-6 w-full rounded-[20px] border border-brand/25 bg-brand-tint px-6 py-5 text-left",
                  "transition-[transform,border-color] duration-300 hover:border-brand/50 active:scale-[0.995]"
                )}
                style={{ transitionTimingFunction: "var(--ease-emphasized)" }}
              >
                <span className="text-action font-medium text-brand">
                  {t.compare.open} →
                </span>
                <span className="mt-1 block max-w-[62ch] text-meta text-ink-soft">
                  {t.compare.openHint}
                </span>
              </button>
            )}

            {showCompare && <AiComparison data={data} />}
          </>
        )}
      </section>
    </>
  );
}
