"use client";

/* ============================================================
   用户偏好。和 lib/history.ts 一样：只存在浏览器里，不上传。
   ============================================================ */

const KEY = "sihat.prefs";

/** 字号三档。字阶本来就是 rem，缩放 html 的 font-size 就能整体等比放大 */
export const TEXT_SCALES = { normal: 1, large: 1.125, larger: 1.28 } as const;
export type TextScale = keyof typeof TEXT_SCALES;

export type Prefs = {
  /** 省流量：完全不调 AI，只跑本地确定性内核 */
  dataSaver: boolean;
  textScale: TextScale;
};

export const DEFAULT_PREFS: Prefs = { dataSaver: false, textScale: "normal" };

export function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      dataSaver: typeof p.dataSaver === "boolean" ? p.dataSaver : false,
      textScale:
        p.textScale && p.textScale in TEXT_SCALES ? p.textScale : "normal",
    };
  } catch {
    return DEFAULT_PREFS; // 隐私模式下 localStorage 会抛
  }
}

export function writePrefs(next: Prefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 存不下不影响本次会话 */
  }
}

/** 把字号写到根元素上。所有尺寸都是 rem，所以这一处就够了 */
export function applyTextScale(scale: TextScale): void {
  document.documentElement.style.fontSize = `${TEXT_SCALES[scale] * 100}%`;
}
