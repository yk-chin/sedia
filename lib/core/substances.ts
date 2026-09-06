import adulterants from "@/data/registries/adulterants.json";
import { editDistance, normalise, tokens } from "@/lib/core/match";

/* ============================================================
   成分识别 —— 确定性内核的一部分
   规则：纯函数，禁止 import LLM / fetch / 任何网络调用（铁律 #1）。

   两本字典，含义**完全不同**，界面绝不能混：

   1. 违禁成分 (adulterants.json)
      从三份执法名单自己的 substances / subject 栏推导出来的。
      命中 = 官方点名过这个成分。每一条都带 refs，能点回具体名单。

   2. 药物识别 (fda-drugnames.json)
      Drugs@FDA **已批准**药品目录，跟禁售名单正好相反。
      命中 = 「这是一种真实药物」，**不是**任何形式的警告。
      它的价值在于跟 flags 合起来用：消息叫人停掉 warfarin 时，
      能说清楚 warfarin 是真药，而不是只给一个干巴巴的「叫人停药」。
   ============================================================ */

export type Citation = { registry: string; count: number };

export type AdulterantHit = {
  /** 规范名，例如 MERCURY */
  name: string;
  /** 消息里实际出现的写法，例如 MERKURI —— 界面要显示用户看得懂的那个 */
  matched: string;
  citedBy: ("MY" | "US")[];
  citations: Citation[];
  /** 一共有多少条官方记录点过它的名 */
  total: number;
};

export type MedicineHit = {
  /** 成分名，例如 PARACETAMOL */
  name: string;
  /** 用户写的是商品名时留下原词，例如 PANADOL */
  via?: string;
};

type Adulterant = {
  name: string;
  aliases: string[];
  citedBy: string[];
  refs: Record<string, number>;
  total: number;
};

const ENTRIES = adulterants.entries as Adulterant[];

/** 这份字典本身的出处，设置页要显示 */
export const ADULTERANT_SOURCE = adulterants.source;

/**
 * 中文 / 马来文写法。
 * 马来文的 MERKURI、HIDROKUINON 已经从 MOH 名单里自动带出来了；
 * 中文没有任何官方名单提供，只能手工补 —— 但转发消息里中文占比很高，不补等于白做。
 */
const LOCAL_ALIASES: Record<string, string[]> = {
  MERCURY: ["汞", "水银", "水銀"],
  HYDROQUINONE: ["氢醌", "氫醌"],
  SIBUTRAMINE: ["西布曲明"],
  SILDENAFIL: ["西地那非", "伟哥", "偉哥"],
  TADALAFIL: ["他达拉非"],
  DEXAMETHASONE: ["地塞米松"],
  BETAMETHASONE: ["倍他米松"],
  TRETINOIN: ["维A酸", "維A酸", "维甲酸"],
  PHENOLPHTHALEIN: ["酚酞"],
  PARACETAMOL: ["扑热息痛", "对乙酰氨基酚"],
  EPHEDRINE: ["麻黄碱", "麻黃鹼"],
};

/** 一个词能不能容忍拼写误差。药名长，8 字以上放 1 个编辑距离是安全的 */
function matchesToken(needle: string, bag: string[]): string | null {
  for (const t of bag) if (t === needle) return t;
  if (needle.length < 8) return null;
  for (const t of bag) if (editDistance(needle, t, 1) <= 1) return t;
  return null;
}

/** 多词成分名（AZELAIC ACID）要求每个词都在，长的那个词允许误差 */
function matchesPhrase(name: string, bag: string[]): string | null {
  const parts = name.split(" ");
  if (parts.length === 1) return matchesToken(name, bag);
  return parts.every((p) => matchesToken(p, bag)) ? name : null;
}

/**
 * 消息里直接点名了官方记录点过的成分。
 * 不依赖产品名命中 —— 这正是「输入 sibutramine 什么都查不到」的那条路。
 */
export function findAdulterants(message: string): AdulterantHit[] {
  const bag = tokens(message);
  if (bag.length === 0) return [];
  const raw = normalise(message);
  const hits: AdulterantHit[] = [];

  for (const e of ENTRIES) {
    let matched = matchesPhrase(e.name, bag);
    if (!matched)
      for (const a of e.aliases) {
        matched = matchesPhrase(a, bag);
        if (matched) break;
      }
    // 中文没有空格，分不出词，只能整串找
    if (!matched)
      for (const a of LOCAL_ALIASES[e.name] ?? [])
        if (raw.includes(a.toUpperCase())) {
          matched = a;
          break;
        }
    if (!matched) continue;

    hits.push({
      name: e.name,
      matched,
      citedBy: e.citedBy as ("MY" | "US")[],
      citations: Object.entries(e.refs)
        .map(([registry, count]) => ({ registry, count }))
        .sort((a, b) => b.count - a.count),
      total: e.total,
    });
  }

  // 马来西亚官方引用过的排前面，其次按被引用次数
  return hits.sort(
    (a, b) =>
      Number(b.citedBy.includes("MY")) - Number(a.citedBy.includes("MY")) ||
      b.total - a.total
  );
}

/* ---------------- 药物识别（按需加载） ---------------- */

export type DrugDict = {
  names: Set<string>;
  brands: Map<string, string>;
  source: { name: string; publisher: string; retrievedAt: string; count: number };
};

let cached: DrugDict | null = null;

/** 2,001 个成分名、11 KB gzip —— 不进首屏包，第一次查验时才拉，之后 SW 缓存 */
export async function loadDrugNames(): Promise<DrugDict> {
  if (cached) return cached;
  const mod = await import("@/data/registries/fda-drugnames.json");
  const data = (mod.default ?? mod) as {
    source: DrugDict["source"];
    ingredients: string[];
    brands: { name: string; ingredient: string }[];
  };
  cached = {
    names: new Set(data.ingredients),
    brands: new Map(data.brands.map((b) => [b.name, b.ingredient])),
    source: data.source,
  };
  return cached;
}

/**
 * 消息里提到的真实药物。
 * **只做识别，不是警告** —— 提到 Panadol 不代表有任何问题。
 *
 * 这里刻意不做拼写容错：2,001 个名字里放宽编辑距离，
 * 迟早会把某个普通英文词认成药。识别错药名比认不出更糟。
 */
export function findMedicines(
  message: string,
  dict: DrugDict | null,
  exclude: AdulterantHit[] = []
): MedicineHit[] {
  if (!dict) return [];
  const skip = new Set(exclude.map((h) => h.name));
  const seen = new Map<string, MedicineHit>();

  for (const tok of new Set(tokens(message))) {
    const brand = dict.brands.get(tok);
    if (brand) {
      if (!skip.has(brand)) seen.set(brand, { name: brand, via: tok === brand ? undefined : tok });
      continue;
    }
    if (dict.names.has(tok) && !skip.has(tok)) seen.set(tok, { name: tok });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
