"use client";

import type { Analysis } from "@/lib/types";

/* ============================================================
   查验历史。只存在浏览器 localStorage 里：
   没有账号、没有后端、什么都不上传。
   健康类内容本来就该这样处理 —— 别人的用药问题不该出现在我的服务器上。
   ============================================================ */

const KEY = "sihat.history";
const LIMIT = 50;

export type HistoryItem = {
  id: string;
  at: string;
  /** 只留开头一段，历史列表用不着全文 */
  excerpt: string;
  score: number;
  band: Analysis["band"];
  /** 是否命中了官方撤销记录 */
  flagged: boolean;
  product?: string;
};

export function readHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
  } catch {
    return []; // 存坏了或隐私模式，当作没有历史
  }
}

export function addHistory(message: string, data: Analysis): HistoryItem[] {
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    excerpt: message.trim().slice(0, 140),
    score: data.score,
    band: data.band,
    flagged: data.evidence.length > 0,
    // 多份名单都命中时，取排在最前面的那条（马来西亚的权威裁定优先）
    product: data.evidence[0]?.product,
  };
  const next = [item, ...readHistory()].slice(0, LIMIT);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 配额满或被禁用：历史存不下不影响主流程 */
  }
  return next;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 同上 */
  }
}
