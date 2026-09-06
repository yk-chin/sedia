"use client";

import type { Analysis, Evidence } from "@/lib/types";
import { useLang } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * 官方记录 —— 全项目最重要的一块。
 *
 * 每一个字都来自监管机构的公开记录，由 lib/core/registry.ts 查表得出，
 * **完全不经过 LLM**。链接必须是真的能点开的 <a>，这就是「concrete evidence」本身。
 *
 * ⚠️ 管辖权是这块 UI 的硬约束：
 * 马来西亚 NPRA / MOH 的命中是**法律裁定**，红色、放在最上面；
 * 美国 FDA 的命中只是**佐证**，琥珀色、明写「不等于马来西亚的裁定」。
 * 两者绝不能长得一样 —— 评委问一句「这在马来西亚违法吗」就得答得上来。
 */
export function EvidenceCard({ evidence }: { evidence: Evidence }) {
  const { t } = useLang();
  const { source } = evidence;
  const primary = source.authority === "primary";

  return (
    <section
      className={cn(
        "sihat-rise overflow-hidden rounded-[20px] border",
        primary
          ? "border-risk-high/25 bg-risk-high-tint"
          : "border-risk-medium/25 bg-risk-medium-tint"
      )}
    >
      <div
        className={cn(
          "border-b px-6 py-5 sm:px-8",
          primary ? "border-risk-high/15" : "border-risk-medium/15"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "h-2 w-2 rounded-full",
              primary ? "bg-risk-high" : "bg-risk-medium"
            )}
          />
          <h2
            className={cn(
              "text-eyebrow font-semibold uppercase",
              primary ? "text-risk-high" : "text-risk-medium"
            )}
          >
            {primary ? t.evidence.found : t.evidence.foundReference}
          </h2>
          <span className="ml-auto shrink-0 rounded-full border border-hairline bg-surface/70 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            {source.jurisdiction === "MY" ? "🇲🇾 Malaysia" : "🇺🇸 US FDA"}
          </span>
        </div>

        <p className="mt-3 text-title-sm font-normal text-ink">
          {primary ? t.evidence.cancelled : t.evidence.cancelledReference}
        </p>

        {/* 外国监管机构的命中必须当场说清楚它的效力边界 */}
        {!primary ? (
          <p className="mt-2 max-w-[62ch] text-meta text-ink-soft">
            {t.evidence.notMalaysianRuling}
          </p>
        ) : null}
      </div>

      <dl
        className={cn(
          "divide-y px-6 sm:px-8",
          primary ? "divide-risk-high/10" : "divide-risk-medium/10"
        )}
      >
        <Row label={t.evidence.product}>
          <span className="font-medium">{evidence.product}</span>
        </Row>
        {evidence.substances.length > 0 ? (
          <Row label={t.evidence.substance}>
            <span className="flex flex-wrap justify-end gap-1.5">
              {evidence.substances.map((s) => (
                <span
                  key={s}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-surface",
                    primary ? "bg-risk-high" : "bg-risk-medium"
                  )}
                >
                  {s}
                </span>
              ))}
            </span>
          </Row>
        ) : null}
        {evidence.notifNo ? (
          <Row label={t.evidence.notifNo}>
            <code className="font-normal tabular-nums">{evidence.notifNo}</code>
          </Row>
        ) : null}
        {evidence.holder ? (
          <Row label={t.evidence.holder}>{evidence.holder}</Row>
        ) : null}
      </dl>

      <div className="px-6 pb-6 pt-5 sm:px-8">
        <p className="text-eyebrow font-semibold uppercase text-ink-soft">
          {t.evidence.verify}
        </p>
        <div className="mt-3 flex flex-col gap-2.5">
          {/* 逐产品官方页面只有 FDA 有；没有就不给，绝不伪造 */}
          {evidence.permalink ? (
            <EvidenceLink href={evidence.permalink}>
              {t.evidence.perItemLink}
            </EvidenceLink>
          ) : null}
          <EvidenceLink href={source.cataloguePage}>
            {t.evidence.datasetLink}
          </EvidenceLink>
          {source.evidencePage !== source.cataloguePage ? (
            <EvidenceLink href={source.evidencePage}>
              {t.evidence.npraLink}
            </EvidenceLink>
          ) : null}
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
  registries,
}: {
  registries: Analysis["registries"];
}) {
  const { t } = useLang();
  const total = registries.reduce((n, r) => n + r.count, 0);

  return (
    <div className="text-meta leading-relaxed text-ink-faint">
      <p>
        {t.evidence.noMatchLead} ({total.toLocaleString()} {t.evidence.records}{" "}
        {registries[0]?.retrievedAt ?? ""}).{" "}
        <span className="text-ink-soft">{t.evidence.noMatchWarn}</span>{" "}
        {t.evidence.noMatchTail}
      </p>
      <p className="mt-2">
        <span className="text-ink-soft">{t.evidence.checkedLists}: </span>
        {registries.map((r, i) => (
          <span key={r.id}>
            {i > 0 ? " · " : ""}
            <a
              href={r.cataloguePage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
            >
              {r.name}
            </a>{" "}
            ({r.count})
          </span>
        ))}
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
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
