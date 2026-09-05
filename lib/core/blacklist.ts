import blacklist from "@/data/npra-blacklist.json";

/* ============================================================
   官方黑名单查表 —— 确定性内核的一部分
   规则：本文件禁止 import LLM / fetch / 任何网络调用（铁律 #1）。
   名单在 build 前就落盘了（scripts/fetch-npra.mjs），
   所以这里只是纯粹的字符串匹配，同样输入永远同样输出。

   这是整个项目「不是 AI 在说，是数据在说」唯一站得住的地方：
   命中与否可以逐条追到 NPRA 的公开记录。
   ============================================================ */

export type BlacklistEntry = {
  notifNo: string;
  product: string;
  holder: string;
  manufacturer: string;
  substances: string[];
};

export type BlacklistSource = typeof blacklist.source;

export const BLACKLIST_SOURCE: BlacklistSource = blacklist.source;
export const BLACKLIST_SIZE = blacklist.entries.length;

/** 归一化：大小写、标点、多余空白全部抹平，只留下词 */
function normalise(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

/** 整词包含：避免 "MAGIC" 命中 "MAGICAL" 这类假阳性 */
function containsPhrase(haystack: string, needle: string): boolean {
  return ` ${haystack} `.includes(` ${needle} `);
}

/* 预先归一化，避免每次请求重算。名单只有 125 条，一次线性扫描的成本可以忽略。 */
const INDEX: { entry: BlacklistEntry; key: string }[] = (
  blacklist.entries as BlacklistEntry[]
)
  .map((entry) => ({ entry, key: normalise(entry.product) }))
  // 名字太短的条目（单个词、少于 7 个字符）当通用词用会大量误报，直接排除
  .filter(({ key }) => key.length >= 7 && key.includes(" "));

export type BlacklistHit = {
  entry: BlacklistEntry;
  /** 是命中 LLM 抽出来的产品名，还是命中原始消息全文 */
  matchedOn: "product_name" | "message";
};

/**
 * 在「LLM 抽取的产品名」和「用户原始消息」里找官方撤销记录。
 * 优先用抽取字段（更精确），抽不到才退回全文扫描。
 * 多条命中时取名字最长的那条 —— 最长即最具体。
 */
export function findBlacklistHit(
  message: string,
  productName?: string
): BlacklistHit | null {
  const candidates: { text: string; on: BlacklistHit["matchedOn"] }[] = [];
  if (productName?.trim())
    candidates.push({ text: normalise(productName), on: "product_name" });
  candidates.push({ text: normalise(message), on: "message" });

  for (const { text, on } of candidates) {
    if (!text) continue;
    let best: BlacklistEntry | null = null;
    for (const { entry, key } of INDEX) {
      if (!containsPhrase(text, key)) continue;
      if (!best || key.length > normalise(best.product).length) best = entry;
    }
    if (best) return { entry: best, matchedOn: on };
  }
  return null;
}
