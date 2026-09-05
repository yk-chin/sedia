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

/** LLM 解析自然语言输入后的结构化结果（SIHAT 抽取 schema，见 SPEC 核心流程第 1 步）
    全部字段 optional：LLM 漏填某个字段时，zod 校验不整体失败，交给 toFactors() 的默认值兜底 */
export const ParsedInputSchema = z.object({
  summary: z.string().min(1),
  fields: z.object({
    /** 消息的核心主张 */
    claim: z.string().optional(),
    /** 消息要求用户执行的动作，例如"停药"、"改喝苦瓜汁" */
    action: z.string().optional(),
    /** 涉及的物质/成分名 */
    substance: z.string().optional(),
    /** 涉及的产品名（如有） */
    product_name: z.string().optional(),
    /** 剂量描述（如有） */
    dosage: z.string().optional(),
    /** 目标人群，例如"高血压患者"、"孕妇" */
    target_population: z.string().optional(),
    /** 消息里声称的权威来源，例如"邻居经验"、"某医生" */
    claimed_authority: z.string().optional(),
    /** 一句话说明照做的具体医学风险，写在四个数字打分之前，防止 LLM 跳过推理直接瞎猜数字 */
    risk_reasoning: z.string().optional(),
    /** 不可逆性 0-10：是否涉及停用处方药、替代正规治疗、延误就医 */
    irreversibility: z.number().min(0).max(10).optional(),
    /** 行动性 0-10：是否要求立即执行一个具体动作 */
    actionability: z.number().min(0).max(10).optional(),
    /** 证据缺口 0-10：缺乏医学证据支持的程度 */
    evidence_gap: z.number().min(0).max(10).optional(),
    /** 人群脆弱性 0-10：指向孕妇/长者/慢性病患者/儿童的程度 */
    population_vulnerability: z.number().min(0).max(10).optional(),
  }),
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
