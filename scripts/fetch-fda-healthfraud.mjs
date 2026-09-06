/**
 * 美国 FDA「Health Fraud Product Database」。
 *
 * ⚠️ 管辖权：FDA 是**美国**监管机构，对马来西亚**没有法律效力**。
 * 这份名单只能当次级佐证，界面上必须标明「美国 FDA 公告，不等于在马来西亚被禁售」。
 * 但它填的是真实缺口：NPRA 那份只有化妆品，这份 1,574 行是 Drugs、405 行是 Foods，
 * 记录的是保健品里**违法添加的处方药成分**（sibutramine / sildenafil / dexamethasone…），
 * 而这些产品同样在马来西亚的群组里流传。
 *
 * 来源：https://www.fda.gov/consumers/health-fraud-scams/health-fraud-product-database
 * （旧的 tainted-supplements 数据库已下线并入这里）
 * 服务端直出 HTML，一次 GET 拿全 2,197 行；没有 CSV / API。
 * 约 25% 的行带 fda.gov 逐产品永久链接 —— 只有这些行能做深链，其余不许伪造。
 *
 * 用法：node scripts/fetch-fda-healthfraud.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchHtml, parseRows, firstLink, oneLine } from "./lib/html-table.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = {
  id: "fda-healthfraud",
  name: "Health Fraud Product Database",
  publisher: "U.S. Food and Drug Administration (FDA)",
  jurisdiction: "US",
  /** reference = 佐证，不是马来西亚的法律裁定 */
  authority: "reference",
  cataloguePage:
    "https://www.fda.gov/consumers/health-fraud-scams/health-fraud-product-database",
  evidencePage:
    "https://www.fda.gov/consumers/health-fraud-scams/health-fraud-product-database",
  hasPerItemLink: true,
  licence: "U.S. Government work, public domain",
  coverage:
    "Products the U.S. FDA found to contain undeclared drug ingredients or to be marketed fraudulently. Not a Malaysian regulatory ruling.",
};

const PERMALINK_PREFIX = "https://www.fda.gov/drugs/medication-health-fraud/";

const html = await fetchHtml(SOURCE.cataloguePage);
const rows = parseRows(html);
if (rows.length < 1000) {
  console.error(`只解析到 ${rows.length} 行（预期 2000+），上游可能改版 —— 保留旧 JSON`);
  process.exit(1);
}

const header = rows[0].cells.map((c) => oneLine(c).toLowerCase());
for (const want of ["date", "product", "subject"]) {
  if (!header.some((h) => h.includes(want))) {
    console.error(`表头缺少「${want}」，实际表头：`, header);
    process.exit(1);
  }
}
const col = (name) => header.findIndex((h) => h.includes(name));
const iDate = col("date");
const iProduct = col("product");
const iSubject = col("subject");
const iArea = header.findIndex((h) => h.includes("program area"));

const entries = rows
  .slice(1)
  .map(({ cells, html: rowHtml }) => ({
    product: oneLine(cells[iProduct] ?? ""),
    // Subject 形如 "Undeclared sibutramine, sildenafil"
    subject: oneLine(cells[iSubject] ?? ""),
    date: oneLine(cells[iDate] ?? ""),
    area: iArea >= 0 ? oneLine(cells[iArea] ?? "") : "",
    // 只有约四分之一的行有官方逐产品页面，没有就是 null，界面据此决定要不要给链接
    permalink: firstLink(rowHtml, PERMALINK_PREFIX),
  }))
  .filter((e) => e.product && e.product.toLowerCase() !== "n/a");

if (entries.length < 1000) {
  console.error(`只提取到 ${entries.length} 条，中止`);
  process.exit(1);
}

const out = {
  source: {
    ...SOURCE,
    retrievedAt: new Date().toISOString().slice(0, 10),
    count: entries.length,
  },
  entries,
};

mkdirSync(join(ROOT, "data", "registries"), { recursive: true });
writeFileSync(
  join(ROOT, "data", "registries", "fda-healthfraud.json"),
  JSON.stringify(out, null, 2) + "\n"
);

const withLink = entries.filter((e) => e.permalink).length;
const areas = new Map();
for (const e of entries) areas.set(e.area, (areas.get(e.area) ?? 0) + 1);

console.log(`✓ ${entries.length} 条 → data/registries/fda-healthfraud.json`);
console.log(`  带 fda.gov 逐产品链接：${withLink} 条 (${Math.round((withLink / entries.length) * 100)}%)`);
console.log(
  "  Program Area：",
  [...areas.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([a, n]) => `${a || "(空)"}(${n})`)
    .join(" ")
);
