"use client";

import { useLang } from "@/lib/i18n/context";

/**
 * 骨架屏：形状刻意和 ResultCard 一致（分数块 + 四条分解条 + 正文行）。
 * 结果回来时布局不跳动 —— 这是「贵」和「廉价」的分水岭。
 */
export function LoadingState() {
  const { t } = useLang();
  return (
    <div
      role="status"
      aria-label={t.states.loading}
      className="sihat-rise overflow-hidden rounded-[20px] border border-hairline bg-surface shadow-card"
    >
      <div className="p-6 sm:p-9">
        <div className="sihat-shimmer h-2.5 w-28 rounded-full" />
        <div className="mt-5 flex items-end gap-5">
          <div className="sihat-shimmer h-16 w-40 rounded-2xl sm:h-20 sm:w-52" />
          <div className="sihat-shimmer mb-2 h-8 w-28 rounded-full" />
        </div>
        <div className="sihat-shimmer mt-6 h-5 w-3/4 rounded-lg" />

        <div className="mt-10 border-t border-hairline pt-7">
          <div className="sihat-shimmer h-2.5 w-24 rounded-full" />
          <div className="mt-6 space-y-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <div
                    className="sihat-shimmer h-3.5 rounded-full"
                    style={{ width: `${120 - i * 10}px` }}
                  />
                  <div className="sihat-shimmer h-3.5 w-9 rounded-full" />
                </div>
                <div className="sihat-shimmer mt-2.5 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-9 border-t border-hairline pt-7">
          <div className="sihat-shimmer h-2.5 w-32 rounded-full" />
          <div className="mt-5 space-y-2.5">
            <div className="sihat-shimmer h-4 w-full rounded-lg" />
            <div className="sihat-shimmer h-4 w-11/12 rounded-lg" />
            <div className="sihat-shimmer h-4 w-2/3 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
