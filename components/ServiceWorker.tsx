"use client";

import { useEffect } from "react";

/**
 * 注册 service worker，让应用可以装到手机桌面并离线打开。
 * 只在生产环境注册：开发时 SW 会把改动缓存住，调试会很痛苦。
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* 注册失败不影响应用本身，静默即可 */
    });
  }, []);

  return null;
}
