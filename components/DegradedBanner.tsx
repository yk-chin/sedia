"use client";

import { useLang } from "@/lib/i18n/context";

/** 降级提示。克制、不喧宾夺主 —— 它是说明，不是警报。 */
export function DegradedBanner() {
  const { t } = useLang();
  return (
    <div className="flex gap-3 rounded-xl border border-hairline bg-sunken px-4 py-3">
      <span
        aria-hidden
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-medium"
      />
      <p className="text-meta text-ink-soft">{t.states.degraded}</p>
    </div>
  );
}
