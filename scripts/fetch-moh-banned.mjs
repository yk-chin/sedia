/**
 * 马来西亚卫生部（KKM）药剂执法组「禁售产品名单」。
 * 这是三份名单里**唯一对马来西亚有法律效力**的一份，也是最新的。
 *
 * 来源：https://pharmacy.moh.gov.my/ms/apps/banned-product
 * 服务端直出 HTML，没有 API、没有导出、**没有逐行永久链接**
 * —— 所以证据链接只能指向名单页，不许伪造逐产品链接。
 *
 * 用法：node scripts/fetch-moh-banned.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchHtml, parseRows, splitCell, oneLine } from "./lib/html-table.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = {
  id: "moh-banned",
  name: "Senarai Produk Yang Diharamkan",
  publisher: "Pharmacy Enforcement Division, Ministry of Health Malaysia (KKM)",
  jurisdiction: "MY",
  /** primary = 对马来西亚有法律效力的裁定 */
  authority: "primary",
  cataloguePage: "https://pharmacy.moh.gov.my/ms/apps/banned-product",
  evidencePage: "https://pharmacy.moh.gov.my/ms/apps/banned-product",
  /** 该站没有逐产品链接，界面上不能假装有 */
  hasPerItemLink: false,
  licence: "© Ministry of Health Malaysia",
  coverage:
    "Products banned in Malaysia after being found to contain scheduled poisons.",
};

const EXPECTED_HEADER = ["bil", "nama produk", "racun dikesan"];

const html = await fetchHtml(SOURCE.cataloguePage);
const rows = parseRows(html);
if (rows.length < 20) {
  console.error(`只解析到 ${rows.length} 行，上游可能改版了 —— 保留旧 JSON 不动`);
  process.exit(1);
}

// 表头校验：上游一改列就大声失败
const header = rows[0].cells.map((c) => oneLine(c).toLowerCase());
const ok = EXPECTED_HEADER.every((want) =>
  header.some((h) => h.includes(want))
);
if (!ok) {
  console.error("表头对不上，实际表头：", header);
  process.exit(1);
}

const entries = rows
  .slice(1)
  .map(({ cells }) => ({
    product: oneLine(cells[1] ?? ""),
    substances: splitCell(cells[2] ?? "")
      // 马来文用 DAN 连接多个成分（TRETINOIN DAN BETAMETHASONE）
      .flatMap((s) => s.split(/\s+DAN\s+|\s+&\s+/i))
      .map((s) => s.trim().toUpperCase())
      // 「-」是「未记录成分」的占位符，不是成分名
      .filter((s) => s && !/^[-–—]+$/.test(s)),
    status: oneLine(cells[3] ?? ""),
    year: oneLine(cells[4] ?? ""),
  }))
  // 没记录成分的产品**仍然是被禁的**，不能因为成分列是「-」就丢掉
  .filter((e) => e.product);

if (entries.length < 20) {
  console.error(`只提取到 ${entries.length} 条有效记录，中止`);
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
  join(ROOT, "data", "registries", "moh-banned.json"),
  JSON.stringify(out, null, 2) + "\n"
);

const subs = new Map();
for (const e of entries)
  for (const s of e.substances) subs.set(s, (subs.get(s) ?? 0) + 1);

console.log(`✓ ${entries.length} 条 → data/registries/moh-banned.json`);
console.log(
  "  检出成分 top6：",
  [...subs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([s, n]) => `${s}(${n})`)
    .join(" ")
);
