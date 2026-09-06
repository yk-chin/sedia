/* ============================================================
   名单匹配的字符串工具 —— 确定性内核的一部分
   规则：纯函数，禁止 import LLM / fetch / 任何网络调用（铁律 #1）。

   之前是「整个短语精确匹配」，`Magic Whitening Cream` 里虽然 Magic 和 Cream
   都在，中间插一个词就整条漏掉。真实转发消息全是这种写法。
   这里换成 token-set 匹配 + 逐词容错，同时用严格的阈值把误报摁住。
   ============================================================ */

/** 大小写、标点、多余空白全部抹平，只留下词 */
export function normalise(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9一-鿿]+/g, " ")
    .trim();
}

export function tokens(s: string): string[] {
  const n = normalise(s);
  return n ? n.split(" ") : [];
}

/**
 * 编辑距离，但一旦超过 max 就提前退出。
 * 只用来容忍 Creme/Cream 这种一个字母的拼写差异，不做模糊搜索。
 */
export function editDistance(a: string, b: string, max = 1): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1; // 这一整行都超了，后面不可能变好
    prev = cur;
  }
  return prev[b.length];
}

/** 词级匹配：短词必须完全相同，≥4 字符的词允许 1 个编辑距离 */
function tokenMatches(needle: string, hay: string): boolean {
  if (needle === hay) return true;
  if (needle.length < 4) return false;
  return editDistance(needle, hay, 1) <= 1;
}

/**
 * 名单条目的词有多少出现在消息里（不要求连续、不要求同序）。
 * 返回 0–1 的比例。
 */
export function tokenSetScore(
  entryTokens: string[],
  messageTokens: Set<string>
): number {
  if (entryTokens.length === 0) return 0;
  const hay = [...messageTokens];
  let hits = 0;
  for (const t of entryTokens) {
    if (messageTokens.has(t) || hay.some((h) => tokenMatches(t, h))) hits++;
  }
  return hits / entryTokens.length;
}

/**
 * 通用词。名单里真的存在「Blood Pressure」「Super Slim」「Slim Max」这类
 * 完全由通用词构成的产品名（FDA 名单里有 7 条）。
 * 对它们做不要求连续的 token-set 匹配，会把
 * 「blood pressure pills damage your kidneys」误判成命中某个产品 —— 实测踩到过。
 */
const GENERIC = new Set([
  "BLOOD", "PRESSURE", "CREAM", "CREME", "GOLD", "SILVER", "POWER", "PLUS",
  "SUPER", "ULTRA", "MAX", "PRO", "FORTE", "HERBAL", "NATURAL", "BEAUTY",
  "SKIN", "WHITE", "WHITENING", "DAY", "NIGHT", "OIL", "TEA", "SLIM",
  "DIET", "CAPSULE", "TABLET", "PILL", "PILLS", "EXTRACT", "ENERGY",
  "HEALTH", "LIFE", "CARE", "SOAP", "SET", "SERIES", "NEW", "ORIGINAL",
]);

/**
 * 名字完全由通用词构成的条目**不可能**在自由文本里可靠识别。
 *
 * FDA 名单里真的有一条产品就叫「Blood Pressure」（还有 Super Slim、Slim Max…）。
 * 实测「blood pressure pills damage your kidneys」会命中它 —— 而且因为
 * "blood pressure" 在句子里本来就是连着的，退回严格短语匹配也救不了。
 *
 * 这类条目只有 7 条（占 0.3%），但每一次误报都是在告诉用户
 * 「你手上这个东西被官方禁了」。宁可漏掉这 7 条，也不能报错一次。
 */
export function isUnidentifiable(entryTokens: string[]): boolean {
  return entryTokens.length > 0 && entryTokens.every((t) => GENERIC.has(t));
}

/**
 * 判定一个名单条目是否命中消息。
 *
 * 阈值是防误报的关键：
 * - 只有 1 个词的条目一律不参与匹配（`Magic` 这种词太常见）
 * - 2 个词的条目要求**全中**，因为少一个词就等于只剩一个通用词
 * - 3 个词及以上用 SPEC 必做 #1 定的 0.85 阈值
 */
export function entryHits(
  entryTokens: string[],
  messageTokens: Set<string>
): boolean {
  const n = entryTokens.length;
  if (n < 2) return false;
  const score = tokenSetScore(entryTokens, messageTokens);
  return n === 2 ? score === 1 : score >= 0.85;
}
