/**
 * 字标。
 *
 * 原来是一行平铺的全大写 "SIHAT"，没有做任何字距处理，读起来是在喊。
 * 改动三件事：
 *   1. 加一个记号 —— 圆角方块里一道勾。勾的两笔长度不等，短笔略抬高，
 *      这是「已核实」最直接的通用符号，不用解释
 *   2. 大写改成 Title case。"Sihat" 在马来语里就是「健康」，
 *      对 45–65 岁的用户，一个正常拼写的词比一串大写亲切得多
 *   3. 字距收紧 -0.02em。默认字距在 600 字重下会显得松散
 *
 * 圆角半径取边长的 32%，接近 iOS 图标的比例。
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink">
        Sihat
      </span>
    </span>
  );
}

export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect width="32" height="32" rx="10.24" fill="var(--color-brand)" />
      <path
        d="M9.5 16.8 L14 21.2 L22.5 11.4"
        stroke="white"
        strokeWidth="2.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
