"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n/context";

/**
 * 分享结果。
 *
 * 真实场景：儿子有流量、帮妈妈查完，把结论转回家族群 —— 没网的人也能看到。
 * 所以分享文本里必须带上**官方链接**，让证据跟着消息一起传出去，
 * 而不是只传一句「这个不能用」。
 *
 * 优先用系统分享面板（手机上直接进 WhatsApp），不支持就回落到复制。
 */
export function ShareButton({ text }: { text: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* 用户取消分享也会 reject，不当成错误，继续走复制 */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 剪贴板被禁用就什么都不做，不弹错误吓用户 */
    }
  }

  return (
    <button
      onClick={() => void share()}
      className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-5 py-2.5 text-action font-medium text-ink-soft transition-colors duration-200 hover:border-ink hover:text-ink"
      style={{ transitionTimingFunction: "var(--ease-standard)" }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 16V4M12 4 8 8M12 4l4 4" />
        <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </svg>
      {copied ? t.share.copied : t.share.button}
    </button>
  );
}
