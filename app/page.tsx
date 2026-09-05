"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { ResultCard } from "@/components/ResultCard";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { AiComparison } from "@/components/AiComparison";
import { EvidenceCard } from "@/components/EvidenceCard";
import { DEMO_SEED_INPUTS } from "@/data/fixtures";
import { cn } from "@/lib/utils";
import type { Analysis } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

/** 和 lib/types.ts 的 AnalyzeRequestSchema 上限保持一致，避免用户打超了才被 400 打回来 */
const MAX_CHARS = 2000;

export default function Home() {
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
    // 只有真的超过上限才出滚动条，否则贴合内容时会因为 1px 取整误差闪出一条
    el.style.overflowY = el.scrollHeight > 320 ? "auto" : "hidden";
  }, [text]);

  const busy = status === "loading";

  async function run(input: string) {
    if (!input.trim()) return;
    setStatus("loading");
    setError("");
    setShowCompare(false); // 新的一次分析，对照屏收回去
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setData((await res.json()) as Analysis);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <AppShell title="SIHAT" descriptor="Health message risk check">
      {/* ---- 首屏 ---- */}
      <section className="sihat-rise">
        <h1 className="max-w-[26ch] text-hero-sm font-light text-ink sm:text-hero">
          Should you actually do what that message says?
        </h1>
        <p className="mt-5 max-w-[62ch] text-lede font-normal text-ink-soft">
          Paste a forwarded health message. In seconds, see how risky it would
          be to follow — with the score computed by a deterministic model, not
          guessed by an AI.
        </p>
      </section>

      {/* ---- 输入 ---- */}
      <section
        className="sihat-rise mt-10 rounded-[20px] border border-hairline bg-surface p-5 shadow-card sm:p-7"
        style={{ animationDelay: "90ms" }}
      >
        <label
          htmlFor="input"
          className="text-eyebrow font-semibold uppercase text-ink-soft"
        >
          Paste the message you received
        </label>

        <textarea
          id="input"
          ref={boxRef}
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // ⌘/Ctrl + Enter 直接提交，不用去够按钮
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void run(text);
            }
          }}
          rows={3}
          placeholder="e.g. blood pressure pills damage your kidneys, switch to bitter gourd juice…"
          className="mt-3 w-full resize-none overflow-y-hidden rounded-xl border border-hairline-strong bg-canvas px-4 py-3.5 text-body font-normal text-ink outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-ink"
        />

        <div className="mt-1.5 flex items-center justify-between gap-3 text-meta font-normal text-ink-faint">
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            Press
            <kbd className="rounded-[5px] border border-hairline-strong bg-surface px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-soft">
              {modKey}
            </kbd>
            <kbd className="rounded-[5px] border border-hairline-strong bg-surface px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-soft">
              Enter
            </kbd>
            to analyse
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
              "transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.98]",
              "disabled:pointer-events-none disabled:opacity-30"
            )}
          >
            {busy ? "Analysing…" : "Analyse message"}
          </button>

          <span className="ml-1 text-meta font-normal text-ink-faint">
            Or try:
          </span>
          {DEMO_SEED_INPUTS.map((s, i) => (
            <button
              key={i}
              disabled={busy}
              onClick={() => {
                setText(s);
                void run(s);
              }}
              className={cn(
                "rounded-full border border-hairline-strong px-4 py-2 text-meta font-normal text-ink-soft",
                "transition-all duration-200 ease-out hover:border-ink hover:text-ink active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </section>

      {/* ---- 结果 ---- */}
      <section className="mt-8">
        {status === "idle" && (
          <EmptyState
            title="No result yet"
            hint="Paste a message above, or tap one of the examples to see how the score is built."
          />
        )}
        {status === "loading" && <LoadingState />}
        {status === "error" && (
          <ErrorState message={error} onRetry={() => void run(text)} />
        )}
        {status === "done" && data && (
          <>
            {/* 官方记录命中时，它排在分数前面 —— 查到的记录是确定的，分数是估算的 */}
            {data.evidence ? (
              <div className="mb-6">
                <EvidenceCard evidence={data.evidence} />
              </div>
            ) : null}

            <ResultCard data={data} />

            {/* WOW 的入口：一次点击展开对照屏 */}
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
                  Why not just ask an AI? →
                </span>
                <span className="mt-1 block max-w-[62ch] text-meta font-normal text-ink-soft">
                  We asked a general chatbot the same message. See what came
                  back.
                </span>
              </button>
            )}

            {showCompare && <AiComparison data={data} />}
          </>
        )}
      </section>
    </AppShell>
  );
}
