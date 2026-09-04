export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="载入中">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 w-full animate-pulse rounded bg-slate-200"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
