"use client";

import type { Analysis } from "@/lib/types";

/* ============================================================
   查验历史。只存在浏览器 localStorage 里：
   没有账号、没有后端、什么都不上传。
   健康类内容本来就该这样处理 —— 别人的用药问题不该出现在我的服务器上。

   存什么、不存什么：
   - 存**原文**和 LLM 给的 Analysis（重算不出来的那部分）
   - **不存**证据、成分、标记 —— 它们是纯函数从原文推导的，
     详情页现场重算即可。存得更少，而且每打开一次都在证明确定性。
   - 断网查的也要存（analysis: null），否则关掉页面就什么都没了
   ============================================================ */

const KEY = "sihat.history";
const LIMIT = 50;

export type HistoryItem = {
  id: string;
  at: string;
  /** 原文全量。详情页要拿它重算证据和成分 */
  message: string;
  /** 列表用的开头一段，避免渲染时再切一次 */
  excerpt: string;
  /** 离线查的没有 LLM 结果，这里就是 null */
  analysis: Analysis | null;
  score: number | null;
  band: Analysis["band"] | null;
  /** 是否命中了官方撤销记录 */
  flagged: boolean;
  product?: string;
};

export function readHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // 旧版本只存了 excerpt，没有 message。补一个空串，详情页据此提示重查
    return (parsed as HistoryItem[]).map((it) => ({
      ...it,
      message: it.message ?? "",
      analysis: it.analysis ?? null,
      score: it.score ?? null,
      band: it.band ?? null,
    }));
  } catch {
    return []; // 存坏了或隐私模式，当作没有历史
  }
}

export function findHistory(id: string): HistoryItem | null {
  return readHistory().find((it) => it.id === id) ?? null;
}

/** 配额满了就丢掉一半最旧的重试一次，而不是把整段历史丢掉 */
function persist(items: HistoryItem[]): HistoryItem[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return items;
  } catch {
    const trimmed = items.slice(0, Math.max(1, Math.floor(items.length / 2)));
    try {
      localStorage.setItem(KEY, JSON.stringify(trimmed));
      return trimmed;
    } catch {
      return items; // 隐私模式下彻底写不进去：不影响主流程
    }
  }
}

export function addHistory(
  message: string,
  data: Analysis | null,
  /** 离线时 Analysis 是 null，命中信息只能由调用方从本地结果传进来 */
  local?: { flagged: boolean; product?: string }
): HistoryItem[] {
  const text = message.trim();
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    message: text,
    excerpt: text.slice(0, 140),
    analysis: data,
    score: data?.score ?? null,
    band: data?.band ?? null,
    flagged: data ? data.evidence.length > 0 : (local?.flagged ?? false),
    // 多份名单都命中时，取排在最前面的那条（马来西亚的权威裁定优先）
    product: data?.evidence[0]?.product ?? local?.product,
  };
  return persist([item, ...readHistory()].slice(0, LIMIT));
}

export function removeHistory(id: string): HistoryItem[] {
  return persist(readHistory().filter((it) => it.id !== id));
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 同上 */
  }
}
