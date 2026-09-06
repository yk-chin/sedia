/**
 * 极简 HTML 表格解析。两个官方数据源都是服务端直出的 <table>，
 * 没有 API、没有导出，所以只能解析 HTML。不引任何依赖。
 *
 * 抓 HTML 天生脆弱，所以调用方必须校验表头和行数 ——
 * 上游一改版就要大声失败，绝不能悄悄写入半截数据。
 */

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&ndash;": "–",
  "&mdash;": "—",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
};

export function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

/**
 * 去标签取纯文本。<br> 和块级结束标签转成换行**并保留**，
 * 否则「1. Chlorpheniramine 2. Frusemide」这种多行单元格会被黏成一坨。
 */
export function cellText(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** 把多行 / 逗号分号分隔 / 「1. x 2. y」编号的单元格拆成数组 */
export function splitCell(text) {
  return text
    .split("\n")
    .flatMap((part) => part.split(/\s*\d+\.\s+|\s*[,;]\s*/))
    .map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

/** 单行化：产品名这类字段不该带换行 */
export function oneLine(text) {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

/** 取出页面里所有 <tr>，每行返回 { cells, html } */
export function parseRows(html) {
  const rows = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = trRe.exec(html))) {
    const inner = m[1];
    const cells = [];
    const tdRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let c;
    while ((c = tdRe.exec(inner))) cells.push(cellText(c[1]));
    if (cells.length) rows.push({ cells, html: inner });
  }
  return rows;
}

/** 从一行的原始 HTML 里挑出第一个符合前缀的链接 */
export function firstLink(rowHtml, prefix) {
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(rowHtml))) {
    const href = decodeEntities(m[1]);
    if (href.startsWith(prefix)) return href;
  }
  return null;
}

export async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      // 不带 UA 时部分政府站点会返回 403
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}
