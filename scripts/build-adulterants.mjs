/**
 * 「官方点名过的违禁成分」字典。
 *
 * 不抓新数据源 —— 这些名字本来就躺在已有三份名单的 substances / subject 栏里，
 * 只是从来没被拿出来单独匹配过。这里把它们抽出来、去重、记住出处。
 *
 * 关键在清洗：FDA 的 subject 栏混的是**违规类别**而不只是成分名
 * （"UNAPPROVED NEW DRUGS"、"MISBRANDED"、"MAY CONTAIN STEROIDS"），
 * 还有 CSV 引号裂开的残行（'"SUPERDROL'、'" "MADOL'）。
 * 放进去一条，用户就会看到「你的消息里含有 NEW DRUG」这种胡话。
 *
 * 用法：node scripts/build-adulterants.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "data", "registries");
const read = (f) => JSON.parse(readFileSync(join(DIR, f), "utf8"));

/* ---------- 清洗规则 ---------- */

/** 出现这些词的就不是成分名，是监管类别或描述句 */
const NOT_A_SUBSTANCE = [
  "MISBRAND", "UNAPPROVED", "ADULTERAT", "NEW DRUG", "CGMP", "FINISHED PHARMA",
  "DIETARY SUPPLEMENT", "PROCESSING", "PACKING", "HOLDING", "LABELING",
  "PROMOTIONAL", "ANALOG", "CONTAINS", "PRODUCT", "CORONAVIRUS", "COVID",
  "INJECTABLE", "MARKETED", "MISLEADING", "HUMAN FOOD", "THEIR ", "ALSO KNOWN",
  "UNDECLARED", "UNDELCLARED", "MELEBIHI", "DIBENARKAN",
  // 不是成分名，是剂型 / 类别 / 描述
  "MANUFACTURE", "TABLET", "CAPSULE", "NOTIFICATION", "PRESENCE OF", "KG OF",
  "SYNTHETIC", "INHIBITOR", "ALKALOID", "DIURETIC", "STEROID",
];

/**
 * 真实成分，但日常出现太频繁，拿来报警必然误报。
 * 「这瓶爽肤水不含酒精」「薄荷醇清凉」都会中招 —— 报错一次的代价远大于漏掉。
 */
const TOO_GENERIC = new Set([
  "ALCOHOL", "ISOPROPYL ALCOHOL", "STEROID", "STEROIDS", "MENTHOL", "THYMOL",
  "VALERATE", "SALICYLIC ACID", "METHYL SALICYLATE",
  // 合法的食品/植物成分，FDA 是因为「未申报」才点名，不是因为它本身危险。
  // 拿它报警等于对着一罐无糖汽水喊「含违禁物质」。
  "ASPARTAME", "DAIDZEIN", "SCUTELLARIN",
  // 上游断句留下的残渣，规则挡不住，只能点名
  "RAMINE", "SILDENAFILAND TADALAFIL",
]);

/** 同一种东西的不同写法 → 统一到一个规范名。马来文拼法是白捡的本地覆盖 */
const CANONICAL = {
  MERKURI: "MERCURY",
  "PARAS MERKURI": "MERCURY",
  HIDROKUINON: "HYDROQUINONE",
  HYDROKUINON: "HYDROQUINONE",
  "ASID AZELAIK": "AZELAIC ACID",
  TRETNON: "TRETINOIN", // NPRA 原始数据里的拼写错误
  FRUSEMIDE: "FUROSEMIDE", // BAN 名 vs USAN 名，同一种利尿剂
  "BETAMETHASONE 17": "BETAMETHASONE",
  "BETAMETHASONE 17-VALERATE": "BETAMETHASONE",
  "DEXAMETHASONE PHOSPHATE": "DEXAMETHASONE",
  "DICLOFENAC SODIUM": "DICLOFENAC",
  PHENOPHTHALEIN: "PHENOLPHTHALEIN", // FDA 原始数据里的拼写错误
  TADALFIL: "TADALAFIL",
};

/** 一条原始字符串 → 0..n 个候选成分名 */
function candidates(raw) {
  return String(raw)
    // 残引号（弯引号也有）、开头的连接词
    .replace(/[""'"]/g, " ")
    .toUpperCase()
    .split(/\s*[;,/]\s*|\s+AND\/OR\s+|\s+AND\s+|\s+DAN\s+|\s*&\s*/)
    .map((s) =>
      s
        .replace(/\s*\([^)]*\)\s*/g, " ") // 括号里的缩写另算，不参与匹配
        .replace(/[^A-Z0-9\- ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        // 上一步按逗号切开后，碎片常以连接词开头或结尾
        // （"…sildenafil, and methocarbamol" → " AND METHOCARBAMOL"）
        .replace(/^(UNDECLARED|CONTAINS|MAY CONTAIN|AND|OR|DAN)\s+/, "")
        .replace(/\s+(AND|OR|DAN)$/, "")
        .trim()
    )
    .map((s) => CANONICAL[s] ?? s)
    .filter(Boolean);
}

/**
 * 能不能拿去在自由文本里匹配。
 * 保守到近乎苛刻 —— 这一层的每一次误报都是在告诉一个 60 岁的人
 * 「你手上的东西含违禁药物」。
 */
function usable(name) {
  if (name.length < 6) return false; // 太短的词在句子里到处都是
  if (TOO_GENERIC.has(name)) return false;
  if (NOT_A_SUBSTANCE.some((bad) => name.includes(bad))) return false;
  if (name.split(" ").length > 2) return false; // 三个词以上是描述句不是成分名
  // 带数字的一律不要。IUPAC 长名（"1,3-dimethylamylamine"）被逗号切开后
  // 会留下 "3-DIMETHYLAMYLAMINE"、"ANDROSTA-1"、"11-TRIENE-3" 这种碎片，
  // 它们看着像化学名，其实全是断句残渣。
  if (/[0-9]/.test(name)) return false;
  if (!/[A-Z]{6}/.test(name)) return false;
  return true;
}

/** 官方数据里的错拼（SIDENAFIL、TADAFIL、SSBUTRAMINE…）折进正确条目当别名 */
function editDistance1(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let diff = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++diff > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return diff + (a.length - i) + (b.length - j) <= 1;
}

/* ---------- 汇总 ---------- */

const npra = read("npra-cosmetics.json");
const moh = read("moh-banned.json");
const fda = read("fda-healthfraud.json");

/** name → { refs: {registryId: n}, variants: Set } */
const found = new Map();
const dropped = new Map();

function record(raw, registryId) {
  for (const name of candidates(raw)) {
    if (!usable(name)) {
      if (name) dropped.set(name, (dropped.get(name) ?? 0) + 1);
      continue;
    }
    let hit = found.get(name);
    if (!hit) found.set(name, (hit = { refs: {}, variants: new Set() }));
    hit.refs[registryId] = (hit.refs[registryId] ?? 0) + 1;
    const v = String(raw).toUpperCase().trim();
    if (v !== name && v.length < 40) hit.variants.add(v);
  }
}

for (const e of npra.entries) for (const s of e.substances ?? []) record(s, npra.source.id);
for (const e of moh.entries) for (const s of e.substances ?? []) record(s, moh.source.id);
for (const e of fda.entries) record(String(e.subject ?? "").replace(/^undeclared\s+/i, ""), fda.source.id);

const MY = new Set([npra.source.id, moh.source.id]);

const raw = [...found]
  .map(([name, { refs, variants }]) => ({
    name,
    // 别名只收能独立成词的写法（马来文拼法、原始数据的错拼）。
    // "SIBUTRAMINE AND FLUOXETINE" 这种组合串不是别名，是两个成分。
    aliases: new Set(
      [...variants].filter((v) => !/\s/.test(v) && v !== name && v.length >= 6)
    ),
    refs,
    total: Object.values(refs).reduce((a, b) => a + b, 0),
  }))
  .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

/* 官方数据里同一种药有多种错拼（SILDENAFIL / SIDENAFIL / SILDENAFI）。
   按被引用次数从多到少走一遍，差一个字母的折进已收录的那条当别名 ——
   否则用户输入 sildenafil 会同时命中三张卡片，看起来像三个不同的东西。 */
const merged = [];
for (const item of raw) {
  const host = merged.find(
    (m) => m.name.length >= 8 && editDistance1(m.name, item.name)
  );
  if (host) {
    host.aliases.add(item.name);
    for (const [id, n] of Object.entries(item.refs))
      host.refs[id] = (host.refs[id] ?? 0) + n;
    host.total += item.total;
    continue;
  }
  merged.push(item);
}

const entries = merged
  .map(({ name, aliases, refs, total }) => ({
    name,
    aliases: [...aliases].sort(),
    citedBy: [
      ...new Set(Object.keys(refs).map((id) => (MY.has(id) ? "MY" : "US"))),
    ].sort(),
    refs,
    total,
  }))
  // 马来西亚引用过的排前面（本地权威），其次按被引用次数
  .sort(
    (a, b) =>
      Number(b.citedBy.includes("MY")) - Number(a.citedBy.includes("MY")) ||
      b.total - a.total ||
      a.name.localeCompare(b.name)
  );

const out = {
  source: {
    id: "adulterants",
    name: "Substances named in official enforcement records",
    derivedFrom: [npra.source.id, moh.source.id, fda.source.id],
    note: "Derived from the substance columns of the three registries. Not a separate authority — every entry points back at the records that named it.",
    builtAt: new Date().toISOString().slice(0, 10),
    count: entries.length,
  },
  entries,
};

if (entries.length < 60) {
  console.error(`只清出 ${entries.length} 条，清洗规则可能过严 —— 保留旧 JSON 不动`);
  process.exit(1);
}

writeFileSync(join(DIR, "adulterants.json"), JSON.stringify(out, null, 2) + "\n");

const my = entries.filter((e) => e.citedBy.includes("MY"));
console.log(`✓ ${entries.length} 条 → data/registries/adulterants.json`);
console.log(`  其中马来西亚官方引用过：${my.length} 条`);
console.log(
  "  top8：",
  entries
    .slice()
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((e) => `${e.name}(${e.total})`)
    .join(" ")
);
console.log(
  `  丢弃 ${dropped.size} 种字符串（监管类别/太通用/碎片），前 12 个：`
);
console.log(
  "   ",
  [...dropped]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([s, n]) => `${s}(${n})`)
    .join(" | ")
);
