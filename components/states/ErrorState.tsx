export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="sihat-rise rounded-[20px] border border-hairline bg-risk-high-tint p-6 sm:p-7">
      <p className="text-eyebrow font-semibold uppercase text-risk-high">
        Something went wrong
      </p>
      <p className="mt-3 max-w-[60ch] text-body font-normal text-ink">
        {message}
      </p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-action font-medium text-surface transition-transform duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
