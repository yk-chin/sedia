/**
 * 把 NPRA「因含违禁成分被撤销通知的化妆品」名单抓下来，落成 data/registries/npra-cosmetics.json。
 *
 * 为什么要落盘而不是运行时去抓：
 * 现场 WiFi 一抖，运行时抓取就是一个崩点。落盘后 build 和运行时都零网络依赖，
 * 和自托管字体是同一个理由（CLAUDE.md 铁律 #8 的精神）。
 *
 * 数据来源（CC BY 4.0，必须署名）：
 *   目录页  https://data.gov.my/data-catalogue/cosmetic_notifications_cancelled
 *   原始档  https://storage.data.gov.my/healthcare/cosmetic_notifications_cancelled.csv
 *
 * 用法：node scripts/fetch-npra.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = {
  id: "npra-cosmetics",
  name: "Cancelled Cosmetic Notifications",
  jurisdiction: "MY",
  authority: "primary",
  hasPerItemLink: false,
  publisher: "National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia",
  cataloguePage: "https://data.gov.my/data-catalogue/cosmetic_notifications_cancelled",
  downloadUrl: "https://storage.data.gov.my/healthcare/cosmetic_notifications_cancelled.csv",
  evidencePage:
    "https://www.npra.gov.my/index.php/en/consumers/safety-information/cancellation-of-notified-cosmetic-products.html",
  licence: "CC BY 4.0",
  coverage:
    "Cosmetic products whose notification was cancelled after being found to contain scheduled poisons or banned substances.",
};

/** 最小 CSV 解析：处理引号包裹的字段（名单里有含逗号的厂商名） */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const res = await fetch(SOURCE.downloadUrl);
if (!res.ok) {
  console.error(`抓取失败 HTTP ${res.status} — 保留现有 npra-cosmetics.json 不动`);
  process.exit(1);
}

const rows = parseCsv(await res.text());
const header = rows[0].map((h) => h.trim());
const idx = (name) => header.indexOf(name);
const [iNotif, iProduct, iHolder, iMaker, iSub] = [
  "notif_no",
  "product",
  "holder",
  "manufacturer",
  "substance_detected",
].map(idx);

if ([iNotif, iProduct, iSub].some((i) => i < 0)) {
  console.error("上游表头变了，实际表头：", header);
  process.exit(1);
}

const entries = rows
  .slice(1)
  .map((r) => ({
    notifNo: r[iNotif]?.trim() ?? "",
    product: r[iProduct]?.trim() ?? "",
    holder: r[iHolder]?.trim() ?? "",
    manufacturer: r[iMaker]?.trim() ?? "",
    // "MERCURY,STEROID" → ["MERCURY", "STEROID"]
    substances: (r[iSub] ?? "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
  }))
  .filter((e) => e.product && e.notifNo);

const out = {
  source: { ...SOURCE, retrievedAt: new Date().toISOString().slice(0, 10), count: entries.length },
  entries,
};

mkdirSync(join(ROOT, "data", "registries"), { recursive: true });
writeFileSync(join(ROOT, "data", "registries", "npra-cosmetics.json"), JSON.stringify(out, null, 2) + "\n");

const substances = new Map();
for (const e of entries)
  for (const s of e.substances) substances.set(s, (substances.get(s) ?? 0) + 1);

console.log(`✓ ${entries.length} 条 → data/registries/npra-cosmetics.json`);
console.log(
  "  检出成分 top5：",
  [...substances.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, n]) => `${s}(${n})`).join(" ")
);
