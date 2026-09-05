/** 降级提示。克制、不喧宾夺主 —— 它是说明，不是警报。 */
export function DegradedBanner() {
  return (
    <div className="flex gap-3 rounded-xl border border-hairline bg-sunken px-4 py-3">
      <span
        aria-hidden
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-medium"
      />
      <p className="text-meta font-normal text-ink-soft">
        Using offline sample data — the AI service is temporarily unavailable.
        The deterministic scoring logic is unaffected.
      </p>
    </div>
  );
}
