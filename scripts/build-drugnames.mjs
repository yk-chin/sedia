/**
 * 「这是一种真实药物」字典，来自 FDA Drugs@FDA 已批准药品目录。
 *
 * ⚠️ 它是**已批准**名录，跟禁售名单正好相反。
 * 绝不能用它说「这个被禁了」—— 它只回答「你消息里提到的是一种真实药物」。
 * 违禁判定一律走 data/registries/adulterants.json 和三份执法名单。
 *
 * 来源：https://www.fda.gov/media/89850/download（Drugs@FDA 全量 zip，约 6 MB）
 * zip 不入库，只提交生成的 JSON —— 跟 fetch-*.mjs 一个做法。
 *
 * 用法：node scripts/build-drugnames.mjs [本地 zip 或 Products.txt 路径]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL_ = "https://www.fda.gov/media/89850/download";

/* ---------- 最小 zip 读取：不为了一个文件装依赖 ---------- */

/** 从中央目录里取出一个成员。比扫本地头可靠：本地头的长度字段可能是 0（延后写在数据描述符里） */
function unzipMember(buf, wanted) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("不是合法的 zip：找不到中央目录结束记录");

  let p = buf.readUInt32LE(eocd + 16);
  const total = buf.readUInt16LE(eocd + 10);
  for (let i = 0; i < total; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("中央目录损坏");
    const method = buf.readUInt16LE(p + 10);
    const compressed = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localAt = buf.readUInt32LE(p + 42);
    const name = buf.toString("latin1", p + 46, p + 46 + nameLen);

    if (name === wanted || name.endsWith("/" + wanted)) {
      const ln = buf.readUInt16LE(localAt + 26);
      const le = buf.readUInt16LE(localAt + 28);
      const at = localAt + 30 + ln + le;
      const raw = buf.subarray(at, at + compressed);
      return method === 0 ? raw : inflateRawSync(raw);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`zip 里没有 ${wanted}`);
}

/* ---------- 清洗规则 ---------- */

/** 盐型/水合物后缀。实测：Drugs@FDA 里只有 WARFARIN SODIUM，没有裸的 WARFARIN，
    不剥掉后缀，用户打「warfarin」就永远认不出来。 */
const SALT = new Set([
  "HYDROCHLORIDE", "HCL", "HYDROBROMIDE", "SODIUM", "DISODIUM", "MONOSODIUM",
  "POTASSIUM", "CALCIUM", "MAGNESIUM", "CITRATE", "SULFATE", "SULPHATE",
  "TARTRATE", "BITARTRATE", "MALEATE", "MESYLATE", "MESILATE", "FUMARATE",
  "SUCCINATE", "ACETATE", "PHOSPHATE", "NITRATE", "BROMIDE", "CHLORIDE",
  "IODIDE", "BESYLATE", "TOSYLATE", "OXALATE", "LACTATE", "GLUCONATE",
  "STEARATE", "PALMITATE", "PROPIONATE", "VALERATE", "DIPROPIONATE",
  "PAMOATE", "NAPSYLATE", "EMBONATE", "TROMETHAMINE", "BENZOATE",
  "MONOHYDRATE", "DIHYDRATE", "HYDRATE", "ANHYDROUS", "BASE",
]);

/**
 * 真的在成分表里，但在日常句子里出现 ≠ 在谈药。
 * 不挡掉，「我买了瓶水」「多喝点葡萄糖水」都会被标成「已识别药物」。
 */
const NOT_A_MEDICINE = new Set([
  "WATER", "ALCOHOL", "ETHANOL", "OXYGEN", "NITROGEN", "HELIUM", "AIR",
  "DEXTROSE", "GLUCOSE", "SUCROSE", "LACTOSE", "FRUCTOSE", "STARCH", "HONEY",
  "GLYCERIN", "GLYCERIN;", "MANNITOL", "SORBITOL", "UREA", "PETROLATUM",
  "MENTHOL", "CAMPHOR", "CAFFEINE", "SULFUR", "IODINE", "CHARCOAL",
  "ASCORBIC ACID", "CITRIC ACID", "ACETIC ACID", "BORIC ACID", "LACTIC ACID",
  "FOLIC ACID", "NIACIN", "THIAMINE", "RIBOFLAVIN", "PYRIDOXINE",
  "CYANOCOBALAMIN", "ERGOCALCIFEROL", "CHOLECALCIFEROL", "TOCOPHEROL",
  "CALCIUM CARBONATE", "SODIUM CHLORIDE", "POTASSIUM CHLORIDE",
  "SODIUM BICARBONATE", "MAGNESIUM SULFATE", "HYDROGEN PEROXIDE",
  "ZINC OXIDE", "TITANIUM DIOXIDE", "CARBON DIOXIDE", "MINERAL OIL",
  // 元素、氨基酸、赋形剂、剂型描述 —— 剥完盐型后单独留下来的残渣
  "ALUMINUM", "AMMONIUM", "CALCIUM", "POTASSIUM", "MAGNESIUM", "MANGANESE",
  "GALLIUM", "KRYPTON", "CHROMIC", "FERROUS", "FERRIC", "CUPRIC", "STANNOUS",
  "ARGININE", "GLYCINE", "CYSTEINE", "TYROSINE", "BETAINE", "CELLULOSE",
  "DIBASIC", "MONOBASIC", "EDETATE", "MEGLUMINE", "DIMETHYL", "GLACIAL",
  "MICROSIZE", "CHORIONIC", "PROTEASE", "LACTITOL", "LEODOPA",
]);

/**
 * 马来西亚家喻户晓的商品名 → 成分。**手工整理，不是 FDA 数据**。
 *
 * Drugs@FDA 的 8,366 个商品名是美国市场的，里面全是 ONE、DUO、FIRST 这种词，
 * 拿来匹配自由文本必然误报；而本地长辈嘴里说的是 Panadol，不是 acetaminophen。
 * 所以商品名这一层刻意做小、做本地、做可核对。
 */
const LOCAL_BRANDS = [
  ["PANADOL", "PARACETAMOL"],
  ["PARACETAMOL", "PARACETAMOL"],
  ["ACETAMINOPHEN", "PARACETAMOL"],
  ["PONSTAN", "MEFENAMIC ACID"],
  ["VOLTAREN", "DICLOFENAC"],
  ["CLARINASE", "LORATADINE"],
  ["ZYRTEC", "CETIRIZINE"],
  ["PIRITON", "CHLORPHENIRAMINE"],
  ["VENTOLIN", "SALBUTAMOL"],
  ["AUGMENTIN", "AMOXICILLIN"],
  ["ZANTAC", "RANITIDINE"],
  ["LOSEC", "OMEPRAZOLE"],
  ["GLUCOPHAGE", "METFORMIN"],
  ["DAONIL", "GLIBENCLAMIDE"],
  ["LIPITOR", "ATORVASTATIN"],
  ["ZOCOR", "SIMVASTATIN"],
  ["NORVASC", "AMLODIPINE"],
  ["PLAVIX", "CLOPIDOGREL"],
  ["WARFARIN", "WARFARIN"],
  ["COUMADIN", "WARFARIN"],
  ["LASIX", "FUROSEMIDE"],
  ["PREDNISOLONE", "PREDNISOLONE"],
  ["NEUROBION", "VITAMIN B COMPLEX"],
  ["VIAGRA", "SILDENAFIL"],
  ["CIALIS", "TADALAFIL"],
];

/* ---------- 跑 ---------- */

const arg = process.argv[2];
let bytes;
if (arg) {
  const file = readFileSync(arg);
  bytes = arg.toLowerCase().endsWith(".zip")
    ? unzipMember(file, "Products.txt")
    : file;
  console.log(`  读自本地：${arg}`);
} else {
  const res = await fetch(URL_, { redirect: "follow" });
  if (!res.ok) {
    console.error(`下载失败 HTTP ${res.status} —— 保留旧 JSON 不动`);
    process.exit(1);
  }
  bytes = unzipMember(Buffer.from(await res.arrayBuffer()), "Products.txt");
  console.log(`  下载自：${URL_}`);
}

const lines = bytes.toString("utf8").split(/\r?\n/);
const header = lines[0].split("\t").map((h) => h.trim());
const col = header.indexOf("ActiveIngredient");
if (col < 0) {
  console.error("表头对不上，实际表头：", header, "—— 保留旧 JSON 不动");
  process.exit(1);
}

/** "WARFARIN SODIUM" → "WARFARIN"；"SITAGLIPTIN, METFORMIN HYDROCHLORIDE" → 两个 */
function roots(cell) {
  return cell
    .toUpperCase()
    .split(/\s*[;,]\s*|\s+AND\s+/)
    .map((s) => s.replace(/[^A-Z\- ]+/g, " ").replace(/\s+/g, " ").trim())
    .map((s) => {
      const parts = s.split(" ");
      while (parts.length > 1 && SALT.has(parts[parts.length - 1])) parts.pop();
      return parts.join(" ");
    })
    .filter(Boolean);
}

const names = new Set();
let rows = 0;
for (const line of lines.slice(1)) {
  if (!line) continue;
  rows++;
  for (const n of roots(line.split("\t")[col] ?? "")) {
    // 单个词、≥7 字符。药名本来就长，这条把 ACID、GEL、ORAL 之类全挡在外面。
    if (/\s/.test(n) || n.length < 7) continue;
    // "ALCOHOL, ANHYDROUS" 被逗号切开后只剩一个盐型/水合物词，那不是药名
    if (SALT.has(n) || NOT_A_MEDICINE.has(n)) continue;
    names.add(n);
  }
}

if (rows < 40000 || names.size < 1000) {
  console.error(`只读到 ${rows} 行 / ${names.size} 个成分名，上游可能改了 —— 保留旧 JSON 不动`);
  process.exit(1);
}

const out = {
  source: {
    id: "fda-drugnames",
    name: "Drugs@FDA approved product listing",
    publisher: "U.S. Food and Drug Administration",
    jurisdiction: "US",
    /** 只用于识别药名，不构成任何裁定 —— 界面必须照这个字段说话 */
    authority: "identification-only",
    cataloguePage: "https://www.accessdata.fda.gov/scripts/cder/daf/",
    downloadUrl: URL_,
    licence: "Public domain (U.S. Government work)",
    note: "Approved products. Presence here means a name is a real medicine, never that it is banned.",
    retrievedAt: new Date().toISOString().slice(0, 10),
    count: names.size,
  },
  ingredients: [...names].sort(),
  /** 手工整理的本地商品名，不是 FDA 数据，界面上要标明 */
  brands: LOCAL_BRANDS.map(([name, ingredient]) => ({ name, ingredient })),
};

writeFileSync(
  join(ROOT, "data", "registries", "fda-drugnames.json"),
  JSON.stringify(out, null, 2) + "\n"
);

console.log(`✓ ${rows} 行 → ${names.size} 个成分名 + ${LOCAL_BRANDS.length} 个本地商品名`);
console.log("  → data/registries/fda-drugnames.json");
console.log(
  "  抽查：",
  ["WARFARIN", "METFORMIN", "SILDENAFIL", "AMLODIPINE", "ATORVASTATIN"]
    .map((n) => `${n}${names.has(n) ? "✓" : "✗"}`)
    .join(" ")
);
