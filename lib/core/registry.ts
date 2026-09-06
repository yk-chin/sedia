import npra from "@/data/registries/npra-cosmetics.json";
import moh from "@/data/registries/moh-banned.json";
import { entryHits, isUnidentifiable, tokens } from "@/lib/core/match";

/* ============================================================
   官方名单查表 —— 确定性内核的一部分
   规则：纯函数，禁止 import LLM / fetch / 任何网络调用（铁律 #1）。
   名单在 build 前就落盘了（scripts/fetch-*.mjs），这里只是字符串匹配。

   ⚠️ 管辖权是硬约束：
   马来西亚 NPRA / MOH = primary，对本地有法律效力；
   美国 FDA = reference，只是佐证。界面必须区分，绝不能混为一谈。
   ============================================================ */

export type Jurisdiction = "MY" | "US";
export type Authority = "primary" | "reference";

export type RegistrySource = {
  id: string;
  name: string;
  publisher: string;
  jurisdiction: Jurisdiction;
  authority: Authority;
  cataloguePage: string;
  evidencePage: string;
  hasPerItemLink: boolean;
  licence: string;
  retrievedAt: string;
  count: number;
};

export type RegistryEntry = {
  product: string;
  substances: string[];
  /** NPRA 的通知编号 / FDA 的公告日期，用来让人回官方页面核对 */
  reference?: string;
  holder?: string;
  /** 只有 FDA 有逐产品官方页面；其余为 null，界面据此决定要不要给链接 */
  permalink?: string | null;
};

export type Registry = { source: RegistrySource; entries: RegistryEntry[] };

/** FDA 的 Subject 形如 "Undeclared sibutramine, benzyl sibutramine and sildenafil" */
function substancesFromSubject(subject: string): string[] {
  return subject
    .replace(/^undeclared\s+/i, "")
    .split(/\s*,\s*|\s+and\s+/i)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 2 && !/^N\/?A$/i.test(s));
}

/* ---- 马来西亚两份名单静态打包：小、且是权威裁定，值得进首屏 ---- */
export const MY_REGISTRIES: Registry[] = [
  {
    source: npra.source as RegistrySource,
    entries: npra.entries.map((e) => ({
      product: e.product,
      substances: e.substances,
      reference: e.notifNo,
      holder: e.holder,
      permalink: null,
    })),
  },
  {
    source: moh.source as RegistrySource,
    entries: moh.entries.map((e) => ({
      product: e.product,
      substances: e.substances,
      reference: e.year || undefined,
      permalink: null,
    })),
  },
];

/**
 * FDA 名单 2,197 条、42 KB gzip —— 塞进首屏会把低带宽优势吃掉，
 * 所以按需加载，之后由 service worker 缓存，第二次起离线也能用。
 */
export async function loadFdaRegistry(): Promise<Registry> {
  const mod = await import("@/data/registries/fda-healthfraud.json");
  const data = (mod.default ?? mod) as {
    source: RegistrySource;
    entries: {
      product: string;
      subject: string;
      date: string;
      permalink: string | null;
    }[];
  };
  return {
    source: data.source,
    entries: data.entries.map((e) => ({
      product: e.product,
      substances: substancesFromSubject(e.subject),
      reference: e.date,
      permalink: e.permalink,
    })),
  };
}

export type RegistryHit = {
  source: RegistrySource;
  entry: RegistryEntry;
  matchedOn: "product_name" | "message";
};

/* 预先分词，避免每次请求重算 */
type Indexed = { entry: RegistryEntry; toks: string[] };
const indexCache = new WeakMap<Registry, Indexed[]>();

function indexOf(reg: Registry): Indexed[] {
  const cached = indexCache.get(reg);
  if (cached) return cached;
  const built = reg.entries
    .map((entry) => ({ entry, toks: tokens(entry.product) }))
    // 单个词的条目太容易误报（"Magic"、"Gold"），直接排除；
    // 名字全是通用词的条目（"Blood Pressure"）在自由文本里根本无法可靠识别，同样排除
    .filter((x) => x.toks.length >= 2 && !isUnidentifiable(x.toks));
  indexCache.set(reg, built);
  return built;
}

/**
 * 在消息里找官方记录。
 * 同一份名单里多条命中时取词数最多的那条 —— 最具体的那条才是对的。
 */
export function findHits(
  message: string,
  registries: Registry[],
  productName?: string
): RegistryHit[] {
  const candidates: { text: string; on: RegistryHit["matchedOn"] }[] = [];
  if (productName?.trim())
    candidates.push({ text: productName, on: "product_name" });
  candidates.push({ text: message, on: "message" });

  const hits: RegistryHit[] = [];
  for (const reg of registries) {
    let best: { entry: RegistryEntry; on: RegistryHit["matchedOn"]; n: number } | null =
      null;
    for (const { text, on } of candidates) {
      const bag = new Set(tokens(text));
      if (bag.size === 0) continue;
      for (const { entry, toks } of indexOf(reg)) {
        if (!entryHits(toks, bag)) continue;
        if (!best || toks.length > best.n) best = { entry, on, n: toks.length };
      }
      if (best) break; // 抽取出来的产品名更精确，命中了就不必再扫全文
    }
    if (best) hits.push({ source: reg.source, entry: best.entry, matchedOn: best.on });
  }

  // 本地权威裁定排在美国佐证前面
  return hits.sort((a, b) =>
    a.source.authority === b.source.authority
      ? 0
      : a.source.authority === "primary"
        ? -1
        : 1
  );
}

/** 界面用的证据对象。服务端和浏览器共用，保证两边逐字节一致 */
export function toEvidence(hit: RegistryHit) {
  return {
    product: hit.entry.product,
    notifNo: hit.entry.reference ?? "",
    substances: hit.entry.substances,
    holder: hit.entry.holder ?? "",
    matchedOn: hit.matchedOn,
    permalink: hit.entry.permalink ?? null,
    source: {
      id: hit.source.id,
      name: hit.source.name,
      publisher: hit.source.publisher,
      jurisdiction: hit.source.jurisdiction,
      authority: hit.source.authority,
      cataloguePage: hit.source.cataloguePage,
      evidencePage: hit.source.evidencePage,
      licence: hit.source.licence,
      retrievedAt: hit.source.retrievedAt,
      count: hit.source.count,
    },
  };
}

/* 成分识别搬去了 lib/core/substances.ts。
   这里原本有一个手打 16 个词的 SUBSTANCE_WATCH，而且从来没有任何地方调用它 ——
   所以用户输入 sibutramine 永远什么都查不到。现在的字典是从这三份名单自己的
   substances / subject 栏推导出来的，每一条都能点回具体记录。 */
