/**
 * 吸顶 + 半透明 + backdrop-blur 的头部（Apple 招牌手法）。
 * 长的一句话定义不放在这里 —— 它属于首屏 hero，头部只留品牌名。
 */
export function AppShell({
  title,
  descriptor,
  children,
}: {
  title: string;
  descriptor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-50 border-b border-hairline bg-surface/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-5 sm:px-8">
          <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </span>
          <span aria-hidden className="h-3.5 w-px bg-hairline-strong" />
          <span className="truncate text-meta font-normal text-ink-faint">
            {descriptor}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        {children}
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-3xl px-5 py-7 text-meta font-normal text-ink-faint sm:px-8">
          Hackathon Sedia! 2026
        </div>
      </footer>
    </div>
  );
}
