"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DICT, LANG_CODES, type Dict, type Lang } from "./dictionary";

const STORAGE_KEY = "sihat.lang";

type Ctx = {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
  /** 用户还没选过语言 —— 首次进来要弹选择器 */
  needsChoice: boolean;
  ready: boolean;
};

const LangContext = createContext<Ctx | null>(null);

function readStored(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return LANG_CODES.includes(v as Lang) ? (v as Lang) : null;
  } catch {
    return null; // 隐私模式下 localStorage 会直接抛
  }
}

/** 没选过就按浏览器语言猜一个默认值，猜不中回落英文 */
function guess(): Lang {
  if (typeof navigator === "undefined") return "en";
  const tags = navigator.languages ?? [navigator.language];
  for (const tag of tags) {
    const base = tag.toLowerCase().split("-")[0];
    if (base === "zh") return "zh";
    if (base === "ms" || base === "id") return "ms";
    if (base === "en") return "en";
  }
  return "en";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  /* 服务端和首帧一律用 en，挂载后才切到真实偏好 —— 否则会水合不一致 */
  const [lang, setLangState] = useState<Lang>("en");
  const [needsChoice, setNeedsChoice] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) setLangState(stored);
    else {
      setLangState(guess());
      setNeedsChoice(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setNeedsChoice(false);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* 存不了就算了，本次会话仍然生效 */
    }
  }, []);

  return (
    <LangContext.Provider
      value={{ lang, t: DICT[lang], setLang, needsChoice, ready }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang 必须在 <LangProvider> 里使用");
  return ctx;
}
