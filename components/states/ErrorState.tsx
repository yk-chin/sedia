"use client";

import { useLang } from "@/lib/i18n/context";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { t } = useLang();
  return (
    <div className="sihat-rise rounded-[20px] border border-hairline bg-risk-high-tint p-6 sm:p-7">
      <p className="text-eyebrow font-semibold uppercase text-risk-high">
        {t.states.errorTitle}
      </p>
      <p className="mt-3 max-w-[60ch] text-body text-ink">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-action font-medium text-surface transition-transform duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        >
          {t.states.retry}
        </button>
      ) : null}
    </div>
  );
}
