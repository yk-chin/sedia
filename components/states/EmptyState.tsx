export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="sihat-rise rounded-[20px] border border-dashed border-hairline-strong bg-surface/50 px-6 py-14 text-center">
      <p className="text-lede font-normal text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-body font-normal text-ink-faint">
        {hint}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
