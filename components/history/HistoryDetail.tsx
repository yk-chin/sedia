"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FindingsList } from "@/components/FindingsList";
import { ResultCard } from "@/components/ResultCard";
import { OfflineResult } from "@/components/OfflineResult";
import { ShareButton } from "@/components/ShareButton";
import { EmptyState } from "@/components/states/EmptyState";
import { NoEvidenceNote } from "@/components/EvidenceCard";
import { analyseLocally, type LocalFindings } from "@/lib/core/local";
import { findHistory, removeHistory, type HistoryItem } from "@/lib/history";
import { useLang } from "@/lib/i18n/context";

/**
 * 一条历史记录的完整结果。
 *
 * 存的只有原文和 LLM 给的 Analysis；证据和成分**现场重新推导** ——
 * 它们本来就是纯函数算出来的，存一份反而多一处可能对不上的地方。
 * 副作用是名单更新后重算结果可能变，那是对的：界面会说明这次是刚查的。
 */
export function HistoryDetail({ id }: { id: string }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [state, setState] = useState<
    { item: HistoryItem; found: LocalFindings } | "missing" | null
  >(null);

  useEffect(() => {
    let live = true;
    const item = findHistory(id);
    if (!item) {
      setState("missing");
      return;
    }
    void analyseLocally(item.message).then((found) => {
      if (live) setState({ item, found });
    });
    return () => {
      live = false;
    };
  }, [id]);

  const back = (
    <Link
      href="/history"
      className="inline-flex items-center gap-1.5 text-meta text-ink-soft transition-colors duration-200 hover:text-ink"
    >
      <span aria-hidden>←</span> {t.history.back}
    </Link>
  );

  if (state === null) return <div className="min-h-40">{back}</div>;

  if (state === "missing")
    return (
      <>
        {back}
        <div className="mt-8">
          <EmptyState title={t.history.notFound} hint={t.history.emptyHint} />
        </div>
      </>
    );

  const { item, found } = state;
  const fmt = new Intl.DateTimeFormat(
    lang === "zh" ? "zh-CN" : lang === "ms" ? "ms-MY" : "en-GB",
    { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  const shareLines = [
    item.analysis
      ? `${t.result.hri}: ${item.analysis.score} / 100`
      : t.history.offlineItem,
    `— ${t.share.checkedWith}`,
  ];

  return (
    <>
      <header className="sihat-rise">
        {back}
        <p className="mt-4 text-eyebrow font-semibold uppercase text-ink-soft">
          {t.history.checkedOn} · {fmt.format(new Date(item.at))}
        </p>
        <blockquote className="mt-3 max-w-[62ch] border-l-2 border-hairline-strong pl-4 text-body text-ink">
          {item.message || item.excerpt}
        </blockquote>
      </header>

      {item.message ? (
        <section className="mt-8" aria-live="polite">
          {/* 先说清楚下面这些是刚重算的，再让人看结果 */}
          <p className="mb-6 max-w-[62ch] text-meta leading-relaxed text-ink-faint">
            {t.history.recomputed}
          </p>

          <FindingsList {...found} />

          {found.evidence.length === 0 ? (
            <div className="mb-6">
              <NoEvidenceNote registries={found.registries} />
            </div>
          ) : null}

          {item.analysis ? (
            <ResultCard data={item.analysis} />
          ) : (
            <OfflineResult
              flags={found.flags}
              reason="offline"
              lead={t.history.offlineItem}
            />
          )}
        </section>
      ) : (
        <p className="mt-8 max-w-[62ch] text-body text-ink-soft">
          {t.history.noMessage}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        {item.message ? (
          <>
            <ShareButton text={shareLines.join("\n")} />
            <Link
              href={`/?m=${encodeURIComponent(item.message)}`}
              className="rounded-full border border-hairline-strong px-5 py-2.5 text-action font-medium text-ink-soft transition-colors duration-200 hover:border-ink hover:text-ink"
              style={{ transitionTimingFunction: "var(--ease-standard)" }}
            >
              {t.history.recheck}
            </Link>
          </>
        ) : null}
        <button
          onClick={() => {
            removeHistory(item.id);
            router.push("/history");
          }}
          className="ml-auto rounded-full border border-hairline-strong px-5 py-2.5 text-action text-ink-soft transition-colors duration-200 hover:border-risk-high hover:text-risk-high"
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        >
          {t.history.delete}
        </button>
      </div>
    </>
  );
}
