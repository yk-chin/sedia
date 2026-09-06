"use client";

import { useEffect, useRef, useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { AiComparison } from "@/components/AiComparison";
import { EvidenceCard } from "@/components/EvidenceCard";
import { OfflineResult } from "@/components/OfflineResult";
import { ShareButton } from "@/components/ShareButton";
import { DEMO_SEED_INPUTS } from "@/data/fixtures";
import { findBlacklistHit, toEvidence } from "@/lib/core/blacklist";
import { findFlags, type FlagKey } from "@/lib/core/flags";
import { useLang } from "@/lib/i18n/context";
import { addHistory } from "@/lib/history";
import { readPrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import type { Analysis } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "local" | "error";
type Local = {
  evidence: Analysis["evidence"];
  flags: FlagKey[];
  reason: "offline" | "saver";
};

const MAX_CHARS = 2000;

export default function Home() {
  const { t, lang } = useLang();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<Analysis | null>(null);
  const [local, setLocal] = useState<Local | null>(null);
  const [error, setError] = useState("");
  const [modKey, setModKey] = useState("Ctrl");
  const [showCompare, setShowCompare] = useState(false);
  const [analysed, setAnalysed] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setModKey("⌘");
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
    el.style.overflowY = el.scrollHeight > 320 ? "auto" : "hidden";
  }, [text]);

  const busy = status === "loading";

  async function run(input: string, forceOnline = false) {
    if (!input.trim()) return;
    setError("");
    setShowCompare(false);
    setAnalysed(input);

    /* 第一步永远在本地跑：查官方名单 + 关键词标记。
       纯函数、零网络、几十毫秒。断网时这就是全部结果，
       在线时它让证据卡在 AI 还在想的时候就已经显示出来。 */
    const hit = findBlacklistHit(input);
    const evidence = hit ? toEvidence(hit) : null;
    const flags = findFlags(input);

    const saver = readPrefs().dataSaver && !forceOnline;
    const offline = typeof navigator !== "undefined" && !navigator.onLine;

    if (saver || offline) {
      setLocal({ evidence, flags, reason: saver ? "saver" : "offline" });
      setStatus("local");
      return;
    }

    /* 在线路径也保留本地结果：官方记录在几十毫秒内就查完了，
       没道理让它陪着 AI 一起等十几秒。加载时先把证据卡显示出来。 */
    setLocal({ evidence, flags, reason: "offline" });
    setStatus("loading");
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
    } catch {
      // 网络在中途断了，或服务端挂了：不报错，回落到本地结果
      setLocal({ evidence, flags, reason: "offline" });
      setStatus("local");
    }
  }

  const shareText = buildShareText();
  function buildShareText(): string {
    const ev = data?.evidence ?? local?.evidence;
    const lines: string[] = [];
    if (ev) {
      lines.push(`${t.evidence.found}: ${ev.product}`);
      lines.push(`${t.evidence.substance}: ${ev.substances.join(", ")}`);
      lines.push(`${t.evidence.notifNo}: ${ev.notifNo}`);
      lines.push(ev.source.cataloguePage);
    } else if (data) {
      lines.push(`${t.result.hri}: ${data.score} / 100`);
      lines.push(data.headline);
    }
    lines.push(`— ${t.share.checkedWith}`);
    return lines.join("\n");
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

      {/* 结果区加 aria-live：读屏用户不必自己去找结果出现在哪 */}
      <section className="mt-8" aria-live="polite" aria-atomic="false">
        {status === "idle" && (
          <EmptyState title={t.states.emptyTitle} hint={t.states.emptyHint} />
        )}
        {status === "loading" && (
          <>
            {/* 官方记录不用等 AI —— 它已经查好了 */}
            {local?.evidence ? (
              <div className="mb-6">
                <EvidenceCard evidence={local.evidence} />
              </div>
            ) : null}
            <LoadingState />
          </>
        )}
        {status === "error" && (
          <ErrorState message={error} onRetry={() => void run(text)} />
        )}

        {status === "local" && local && (
          <>
            {local.evidence ? (
              <div className="mb-6">
                <EvidenceCard evidence={local.evidence} />
              </div>
            ) : null}
            <OfflineResult
              flags={local.flags}
              reason={local.reason}
              onRetry={() => void run(analysed, true)}
            />
            <div className="mt-6">
              <ShareButton text={shareText} />
            </div>
          </>
        )}

        {status === "done" && data && (
          <>
            {data.evidence ? (
              <div className="mb-6">
                <EvidenceCard evidence={data.evidence} />
              </div>
            ) : null}

            <ResultCard data={data} />

            <div className="mt-6 flex flex-wrap gap-2.5">
              <ShareButton text={shareText} />
            </div>

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

            {showCompare && <AiComparison data={data} message={analysed} />}
          </>
        )}
      </section>
    </>
  );
}
