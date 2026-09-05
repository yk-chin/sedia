"use client";

import { useEffect, useState } from "react";

/**
 * 数字从 0 滚动到 target。纯 React + requestAnimationFrame，
 * 不引任何动画库（CLAUDE.md 铁律 #7：禁止新增依赖）。
 */
export function useCountUp(target: number, durationMs = 780): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // 系统开了「减少动态效果」就直接给终值，不做动画
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || durationMs <= 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      // easeOutQuint：冲得快、尾巴稳稳停住，不是机械的匀速
      setValue(target * (1 - Math.pow(1 - t, 5)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
