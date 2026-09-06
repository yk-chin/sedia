"use client";

import type { AdulterantHit, MedicineHit } from "@/lib/core/substances";
import type { Analysis } from "@/lib/types";
import { useLang } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * 成分层。**两块必须长得不一样**，混了就是误导：
 *
 * 上面「官方点名过的成分」是警告 —— 红（马来西亚裁定）/ 琥珀（美国佐证），
 * 每条都能点回真正点它名的那份名单。
 *
 * 下面「已识别药物」不是警告 —— 中性灰。提到 Panadol 没有任何问题，
 * 它存在只是为了让「叫你停掉 warfarin」这种消息说得更具体。
 */
export function SubstanceCard({
  adulterants,
  medicines,
  registries,
}: {
  adulterants: AdulterantHit[];
  medicines: MedicineHit[];
  registries: Analysis["registries"];
}) {
  const { t } = useLang();
  if (adulterants.length === 0 && medicines.length === 0) return null;

  const lookup = new Map(registries.map((r) => [r.id, r]));

  return (
    <div className="flex flex-col gap-4">
      {adulterants.length > 0 ? (
        <section className="sihat-rise overflow-hidden rounded-[20px] border border-hairline bg-surface shadow-card">
          <div className="border-b border-hairline px-6 py-5 sm:px-8">
            <h2 className="text-eyebrow font-semibold uppercase text-ink-soft">
              {t.substances.bannedTitle}
            </h2>
            <p className="mt-3 max-w-[62ch] text-body text-ink">
              {t.substances.bannedLead}
            </p>
          </div>

          <ul className="divide-y divide-hairline">
            {adulterants.map((hit, i) => {
              const my = hit.citedBy.includes("MY");
              return (
                <li
                  key={hit.name}
                  className="sihat-rise px-6 py-5 sm:px-8"
                  style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      aria-hidden
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        my ? "bg-risk-high" : "bg-risk-medium"
                      )}
                    />
                    <span className="text-title-sm font-medium text-ink">
                      {hit.matched}
                    </span>
                    {hit.matched.toUpperCase() !== hit.name ? (
                      <span className="text-meta text-ink-faint">
                        ({hit.name})
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em]",
                        my
                          ? "bg-risk-high-tint text-risk-high"
                          : "bg-risk-medium-tint text-risk-medium"
                      )}
                    >
                      {my ? "🇲🇾 Malaysia" : "🇺🇸 US FDA"}
                    </span>
                  </div>

                  {/* 只有美国来源时，效力边界必须当场说清楚 */}
                  {!my ? (
                    <p className="mt-2 max-w-[62ch] text-meta text-ink-soft">
                      {t.evidence.notMalaysianRuling}
                    </p>
                  ) : null}

                  <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-meta text-ink-soft">
                    <span>
                      {hit.total} {t.substances.cited}
                    </span>
                    {hit.citations.map(({ registry, count }) => {
                      const reg = lookup.get(registry);
                      if (!reg) return null;
                      return (
                        <a
                          key={registry}
                          href={reg.cataloguePage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand underline decoration-brand/30 underline-offset-2 transition-colors duration-200 hover:decoration-brand"
                        >
                          {reg.name} ({count}) ↗
                        </a>
                      );
                    })}
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="px-6 py-5 text-meta leading-relaxed text-ink-faint sm:px-8">
            {t.substances.bannedSource}
          </p>
        </section>
      ) : null}

      {medicines.length > 0 ? (
        <section className="sihat-rise rounded-[20px] border border-hairline bg-surface px-6 py-5 shadow-card sm:px-8">
          <h2 className="text-eyebrow font-semibold uppercase text-ink-soft">
            {t.substances.medicineTitle}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {medicines.map((m) => (
              <li
                key={m.name}
                className="rounded-full border border-hairline-strong px-3 py-1 text-action text-ink"
              >
                {m.via ? (
                  <>
                    {m.via}{" "}
                    <span className="text-ink-faint">
                      · {m.name.toLowerCase()}
                    </span>
                  </>
                ) : (
                  m.name.toLowerCase()
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[62ch] text-meta leading-relaxed text-ink-soft">
            {t.substances.medicineLead}
          </p>
          <p className="mt-2 max-w-[62ch] text-meta leading-relaxed text-ink-faint">
            {t.substances.medicineSource}
          </p>
        </section>
      ) : null}
    </div>
  );
}
