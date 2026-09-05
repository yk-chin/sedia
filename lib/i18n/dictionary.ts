import { en } from "./locales/en";
import { ms } from "./locales/ms";
import { zh } from "./locales/zh";
import type { Dict } from "./types";

/* ============================================================
   三语言字典的入口。文案按语言拆到 locales/ 下，
   这个文件只负责组装和导出类型（CLAUDE.md 铁律 #6：单文件 ≤ 300 行）。
   ============================================================ */

export const LANGUAGES = {
  en: { label: "English", native: "English" },
  ms: { label: "Malay", native: "Bahasa Melayu" },
  zh: { label: "Chinese", native: "简体中文" },
} as const;

export type Lang = keyof typeof LANGUAGES;
export const LANG_CODES = Object.keys(LANGUAGES) as Lang[];

export const DICT: Record<Lang, Dict> = { en, ms, zh };
export type { Dict };
