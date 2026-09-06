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

/** 一条官方记录命中。source.authority 区分「法律裁定」和「他国佐证」 */
export const EvidenceSchema = z.object({
  product: z.string(),
  notifNo: z.string(),
  substances: z.array(z.string()),
  holder: z.string(),
  matchedOn: z.enum(["product_name", "message"]),
  /** 只有 FDA 有逐产品官方页面；null 表示只能链到名单页，不许伪造 */
  permalink: z.string().nullable(),
  source: z.object({
    id: z.string(),
    name: z.string(),
    publisher: z.string(),
    jurisdiction: z.enum(["MY", "US"]),
    authority: z.enum(["primary", "reference"]),
    cataloguePage: z.string(),
    evidencePage: z.string(),
    licence: z.string(),
    retrievedAt: z.string(),
    count: z.number(),
  }),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

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
  /** 查询过的每一份官方名单 —— 无论命中与否都要带上，
      因为「查过了，没查到」也是一条需要出处的结论 */
  registries: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      jurisdiction: z.enum(["MY", "US"]),
      count: z.number(),
      retrievedAt: z.string(),
      cataloguePage: z.string(),
    })
  ),
  /** 官方记录命中，可能同时命中多份名单。空数组 = 没查到，**不等于安全**。
      这一块完全不经过 LLM，是 lib/core/registry.ts 查表查出来的，
      每一条都能追回官方公开记录 —— 这是「可点击的证据」。
      刻意与 HRI 正交：命中回答「这东西是不是被官方点名了」，HRI 回答「照做会不会出事」。
      排序：马来西亚的权威裁定在前，美国 FDA 的佐证在后。 */
  evidence: z.array(EvidenceSchema),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1).max(2000),
  /** 解释文案要用哪种语言输出。缺省英文，老客户端不带这个字段也不会挂 */
  lang: z.enum(["en", "ms", "zh"]).default("en"),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
