"use client";

import type { Analysis } from "@/lib/types";
import { useLang } from "@/lib/i18n/context";

/**
 * 官方撤销记录 —— 全项目最重要的一块。
 *
 * 这里的每一个字都来自 NPRA 通过 data.gov.my 公开的记录，
 * 由 lib/core/blacklist.ts 查表得出，**完全不经过 LLM**。
 * 两条链接必须是真的能点开的 <a>，因为这就是「concrete evidence」本身。
 */
export function EvidenceCard({
  evidence,
}: {
  evidence: NonNullable<Analysis["evidence"]>;
}) {
  const { t } = useLang();
  const { source } = evidence;

  return (
    <section className="sihat-rise overflow-hidden rounded-[20px] border border-risk-high/25 bg-risk-high-tint">
      <div className="border-b border-risk-high/15 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-risk-high" />
          <h2 className="text-eyebrow font-semibold uppercase text-risk-high">
            {t.evidence.found}
          </h2>
        </div>
        <p className="mt-3 text-title-sm font-normal text-ink">
          {t.evidence.cancelled}
        </p>
      </div>

      <dl className="divide-y divide-risk-high/10 px-6 sm:px-8">
        <Row label={t.evidence.product}>
          <span className="font-medium">{evidence.product}</span>
        </Row>
        <Row label={t.evidence.substance}>
          <span className="flex flex-wrap justify-end gap-1.5">
            {evidence.substances.map((s) => (
              <span
                key={s}
                className="rounded-full bg-risk-high px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-surface"
              >
                {s}
              </span>
            ))}
          </span>
        </Row>
        <Row label={t.evidence.notifNo}>
          <code className="font-normal tabular-nums">{evidence.notifNo}</code>
        </Row>
        {evidence.holder ? (
          <Row label={t.evidence.holder}>{evidence.holder}</Row>
        ) : null}
      </dl>

      {/* 可点击的证据 —— 导师明确要求的部分 */}
      <div className="px-6 pb-6 pt-5 sm:px-8">
        <p className="text-eyebrow font-semibold uppercase text-ink-soft">
          {t.evidence.verify}
        </p>
        <div className="mt-3 flex flex-col gap-2.5">
          <EvidenceLink href={source.cataloguePage}>
            {t.evidence.datasetLink}
          </EvidenceLink>
          <EvidenceLink href={source.evidencePage}>
            {t.evidence.npraLink}
          </EvidenceLink>
        </div>

        <p className="mt-5 text-meta leading-relaxed text-ink-soft">
          {source.publisher} · {source.count} {t.evidence.records}{" "}
          {source.retrievedAt} · {source.licence}. {t.evidence.sourceNote}
        </p>
      </div>
    </section>
  );
}

/** 没命中时也要说话 —— 查不到不等于安全，这句必须写出来 */
export function NoEvidenceNote({
  count,
  retrievedAt,
  cataloguePage,
}: {
  count: number;
  retrievedAt: string;
  cataloguePage: string;
}) {
  const { t } = useLang();
  return (
    <p className="text-meta leading-relaxed text-ink-faint">
      {t.evidence.noMatchLead} ({count} {t.evidence.records} {retrievedAt}).{" "}
      <span className="text-ink-soft">{t.evidence.noMatchWarn}</span>{" "}
      {t.evidence.noMatchTail}{" "}
      <a
        href={cataloguePage}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand underline decoration-brand/30 underline-offset-2 transition-colors duration-200 hover:decoration-brand"
      >
        {t.evidence.viewDataset}
      </a>
      .
    </p>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="shrink-0 text-action text-ink-soft">{label}</dt>
      <dd className="text-right text-action text-ink">{children}</dd>
    </div>
  );
}

function EvidenceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 text-action font-medium text-brand transition-opacity duration-200 hover:opacity-70"
    >
      <span className="underline decoration-brand/30 underline-offset-[3px] transition-colors duration-200 group-hover:decoration-brand">
        {children}
      </span>
      <span aria-hidden className="text-[0.8em]">
        ↗
      </span>
    </a>
  );
}
