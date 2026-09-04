import type { Analysis, ParsedInput } from "@/lib/types";

/* ============================================================
   降级用的预置结果 (Fallback Fixtures)
   SAFE MODE 打开、API 挂掉、超时、校验失败时，返回这些。
   评审当天这是你的保命符 —— 内容必须真实可信，不能是 "test test"。
   题目公布后第一件事：把这里换成跟你们项目匹配的内容。
   ============================================================ */

export const FALLBACK_PARSED: ParsedInput = {
  summary: "使用示例数据进行演示",
  fields: {
    指标一: 62,
    指标二: 18,
    指标三: 4,
  },
};

export const FALLBACK_ANALYSIS: Omit<
  Analysis,
  "score" | "band" | "contributions" | "degraded"
> = {
  headline: "整体处于中等水平，有明确改善空间",
  explanation:
    "评估结果显示当前状况处于中间区间。主要拉低分数的是可及性相关的因子，而基础条件表现尚可。若能针对最弱的一项进行改善，总分有较明显的提升空间。",
  actions: [
    "优先改善得分最低的那一项因子",
    "对权重最高的因子建立持续监测",
    "三个月后重新评估，比较变化幅度",
  ],
};

/** demo 首页展示用的示例输入，让评委一打开就有东西看 */
export const DEMO_SEED_INPUTS: string[] = [
  "示例输入一：请把这里换成你们题目相关的真实场景描述",
  "示例输入二：换成第二个典型场景",
  "示例输入三：换成一个边界场景，用来展示系统的鲁棒性",
];
