import { z } from "zod";

/* ============================================================
   共享契约 (Shared Contract)
   两个 agent 并行开发时，这个文件就是它们之间的合同。
   改这里之前必须先跟队友说一声。
   ============================================================ */

/** 单个评分因子 —— 确定性内核的输入 */
export const FactorSchema = z.object({
  key: z.string(),
  label: z.string(),
  /** 权重，最终会被归一化，不必手动加总为 1 */
  weight: z.number().nonnegative(),
  /** 原始值（未归一化） */
  raw: z.number(),
  min: z.number(),
  max: z.number(),
  /** true 表示"越小越好"（例如等待时间、污染浓度） */
  invert: z.boolean().optional(),
  note: z.string().optional(),
});
export type Factor = z.infer<typeof FactorSchema>;

/** LLM 解析自然语言输入后的结构化结果 */
export const ParsedInputSchema = z.object({
  summary: z.string().min(1),
  fields: z.record(z.string(), z.union([z.string(), z.number()])),
});
export type ParsedInput = z.infer<typeof ParsedInputSchema>;

/** 最终返回给前端的分析结果 */
export const AnalysisSchema = z.object({
  headline: z.string().min(1),
  score: z.number().min(0).max(100),
  band: z.enum(["low", "medium", "high"]),
  contributions: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      /** 该因子对总分的贡献（分） */
      points: z.number(),
      /** 归一化后的 0-1 值 */
      normalized: z.number(),
    })
  ),
  /** LLM 生成的自然语言解释 —— 唯一允许由 LLM 决定的文本 */
  explanation: z.string(),
  actions: z.array(z.string()),
  /** 是否走了降级路径 */
  degraded: z.boolean(),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1).max(2000),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
