"use client";

import { useEffect, useRef, useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { AiComparison } from "@/components/AiComparison";
import { FindingsList } from "@/components/FindingsList";
import { OfflineResult } from "@/components/OfflineResult";
import { SubstanceCard } from "@/components/SubstanceCard";
import { ShareButton } from "@/components/ShareButton";
import { DEMO_SEED_INPUTS } from "@/data/fixtures";
import { analyseLocally, warmLocalData, type LocalFindings } from "@/lib/core/local";
import { useLang } from "@/lib/i18n/context";
import { addHistory } from "@/lib/history";
import { readPrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import type { Analysis } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "local" | "error";
type Local = LocalFindings & { reason: "offline" | "saver" };

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

    /* 首屏画完后，趁空闲把两个按需字典（FDA 名单、药名）拉进 SW 缓存。
       不预热的话，用户往往是**断网之后**才第一次点查验 —— 那时候已经拉不到了。
       开了省流量就不预热，那本来就是「一个字节都别多用」的意思。 */
    // 历史详情页的「重新查一次」把原文带在 ?m= 里。
    // 用 window.location 而不是 useSearchParams：后者会强制整页进 Suspense
    const m = new URLSearchParams(window.location.search).get("m");
    if (m) {
      setText(m);
      void run(m);
      window.history.replaceState(null, "", "/");
    }

    if (readPrefs().dataSaver) return;
    const idle = window.requestIdleCallback?.bind(window) ?? ((f: () => void) => setTimeout(f, 1200));
    idle(() => warmLocalData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    /* 第一步永远在本地跑：查官方名单 + 认成分 + 关键词标记。
       确定性、几十毫秒。断网时这就是全部结果，
       在线时它让证据卡在 AI 还在想的时候就已经显示出来。 */
    const found = await analyseLocally(input);

    const saver = readPrefs().dataSaver && !forceOnline;
    const offline = typeof navigator !== "undefined" && !navigator.onLine;

    /** 离线查的也要进历史 —— 否则关掉页面就什么都不剩了 */
    const saveLocal = () =>
      addHistory(input, null, {
        flagged: found.evidence.length > 0 || found.adulterants.length > 0,
        product: found.evidence[0]?.product ?? found.adulterants[0]?.name,
      });

    if (saver || offline) {
      setLocal({ ...found, reason: saver ? "saver" : "offline" });
      setStatus("local");
      saveLocal();
      return;
    }

    setLocal({ ...found, reason: "offline" });
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
      setStatus("local");
      saveLocal();
    }
  }

  const shareText = buildShareText();
  function buildShareText(): string {
    const ev = (data?.evidence ?? local?.evidence ?? [])[0];
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
            {/* 官方记录和成分不用等 AI —— 它们已经查好了 */}
            {local ? <FindingsList {...local} /> : null}
            <LoadingState />
          </>
        )}
        {status === "error" && (
          <ErrorState message={error} onRetry={() => void run(text)} />
        )}

        {status === "local" && local && (
          <>
            <FindingsList {...local} />
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
            {/* 证据用服务端返回的（两边同一套纯函数，结果一致），
                成分层只有本地算过，所以从 local 取 */}
            <FindingsList
              evidence={data.evidence}
              adulterants={local?.adulterants ?? []}
              medicines={local?.medicines ?? []}
              registries={data.registries}
            />

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
