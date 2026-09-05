/**
 * 章节标题。上方一条发丝分割线 + 大留白 + 全大写眉标。
 * 层级靠「分割线 + 留白 + 字重字距」三件事拉开，
 * 保证它永远不会被误读成正文。
 */
export function SectionLabel({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-t border-hairline pt-7">
      <h3 className="text-eyebrow font-semibold uppercase text-ink-soft">
        {children}
      </h3>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
