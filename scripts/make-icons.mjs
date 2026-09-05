/**
 * 生成 PWA 图标。不引任何图形库（CLAUDE.md 铁律 #7），
 * 用 Node 自带的 zlib 手写 PNG 编码器，逐像素画：
 * 圆角方块（品牌蓝）+ 一道白色对勾，和 components/Wordmark.tsx 里的记号同一套几何。
 *
 * 用法：node scripts/make-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = [0x00, 0x71, 0xe3]; // #0071E3

/** 点到线段的距离，用来画有圆头的描边 */
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let tt = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  tt = Math.max(0, Math.min(1, tt));
  return Math.hypot(px - (x1 + tt * dx), py - (y1 + tt * dy));
}

/** 圆角矩形的内外判定 */
function insideRoundedRect(x, y, size, r) {
  const cx = Math.min(Math.max(x, r), size - r);
  const cy = Math.min(Math.max(y, r), size - r);
  return Math.hypot(x - cx, y - cy) <= r;
}

function renderIcon(size, { padded = false } = {}) {
  // maskable 图标要留安全边距，否则圆形裁切会削掉勾
  const inset = padded ? size * 0.1 : 0;
  const box = size - inset * 2;
  const radius = box * 0.32; // 接近 iOS 图标圆角比例
  const s = box / 32; // 记号在 32 单位坐标系里设计

  const pts = [
    [9.5, 16.8],
    [14, 21.2],
    [22.5, 11.4],
  ].map(([x, y]) => [inset + x * s, inset + y * s]);
  const stroke = (2.9 * s) / 2;

  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const fx = x + 0.5;
      const fy = y + 0.5;

      if (!insideRoundedRect(fx - inset, fy - inset, box, radius)) continue;

      const d = Math.min(
        distToSegment(fx, fy, ...pts[0], ...pts[1]),
        distToSegment(fx, fy, ...pts[1], ...pts[2])
      );
      // 边缘 1px 内做线性抗锯齿，不然小尺寸下勾会有锯齿
      const white = Math.max(0, Math.min(1, stroke + 0.5 - d));

      px[i] = Math.round(BRAND[0] + (255 - BRAND[0]) * white);
      px[i + 1] = Math.round(BRAND[1] + (255 - BRAND[1]) * white);
      px[i + 2] = Math.round(BRAND[2] + (255 - BRAND[2]) * white);
      px[i + 3] = 255;
    }
  }
  return px;
}

function png(size, pixels) {
  // 每行前面要加一个 filter type 字节（0 = None）
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(join(ROOT, "public"), { recursive: true });

const targets = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["icon-maskable-512.png", 512, { padded: true }],
  ["apple-icon.png", 180, {}],
];
for (const [name, size, opts] of targets) {
  writeFileSync(join(ROOT, "public", name), png(size, renderIcon(size, opts)));
  console.log(`✓ public/${name}  ${size}×${size}`);
}

// SVG 版本给支持矢量图标的浏览器，同一套几何
writeFileSync(
  join(ROOT, "public", "icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="10.24" fill="#0071E3"/><path d="M9.5 16.8 14 21.2 22.5 11.4" stroke="#fff" stroke-width="2.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>\n`
);
console.log("✓ public/icon.svg");
