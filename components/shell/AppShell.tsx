export function AppShell({
  title,
  tagline,
  children,
}: {
  title: string;
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-5 sm:px-6">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500">{tagline}</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">{children}</main>
      <footer className="mx-auto max-w-3xl px-4 pb-10 pt-4 text-xs text-slate-400 sm:px-6">
        Hackathon Sedia! 2026
      </footer>
    </div>
  );
}
