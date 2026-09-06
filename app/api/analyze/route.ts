import { NextResponse } from "next/server";
import { z } from "zod";
import { AnalyzeRequestSchema, ParsedInputSchema } from "@/lib/types";
import type { Analysis, Factor, ParsedInput } from "@/lib/types";
import { weightedScore, band } from "@/lib/core/scoring";
import {
  findHits,
  toEvidence,
  loadFdaRegistry,
  MY_REGISTRIES,
} from "@/lib/core/registry";
import { askStructured } from "@/lib/llm/client";
import {
  PARSE_SYSTEM,
  explainSystemFor,
  explainUserPrompt,
} from "@/lib/llm/prompts";
import { FALLBACK_PARSED, FALLBACK_ANALYSIS } from "@/data/fixtures";

export const runtime = "nodejs";

/* ============================================================
   全项目唯一的 API 路由。
   流程：LLM 解析 → 确定性内核算分 → LLM 只负责解释
   数字全程不经过 LLM。这就是你在 Q&A 里要讲的那条线。
   ============================================================ */

const ExplainSchema = z.object({
  headline: z.string(),
  explanation: z.string(),
  actions: z.array(z.string()),
});

/** 把解析结果映射成 HRI 评分因子。四个因子按 SPEC「评分因子」表定义，
    权重 4/3/3/2、范围 0-10，直接对应 HRI = 100 × (4·Irr+3·Act+3·EvGap+2·Vuln)/120。
    不设 invert：数值本身已经是"越高越危险"，加权和直接就是 HRI，不需要翻转。 */
function toFactors(fields: ParsedInput["fields"]): Factor[] {
  const num = (v: number | undefined, d: number) => (typeof v === "number" ? v : d);
  return [
    {
      key: "irreversibility",
      label: "Irreversibility",
      weight: 4,
      raw: num(fields.irreversibility, 5),
      min: 0,
      max: 10,
    },
    {
      key: "actionability",
      label: "Actionability",
      weight: 3,
      raw: num(fields.actionability, 5),
      min: 0,
      max: 10,
    },
    {
      key: "evidence_gap",
      label: "Evidence Gap",
      weight: 3,
      raw: num(fields.evidence_gap, 5),
      min: 0,
      max: 10,
    },
    {
      key: "population_vulnerability",
      label: "Population Vulnerability",
      weight: 2,
      raw: num(fields.population_vulnerability, 5),
      min: 0,
      max: 10,
    },
  ];
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const parsedReq = AnalyzeRequestSchema.safeParse(body);
  if (!parsedReq.success) {
    return NextResponse.json({ error: "输入不合法" }, { status: 400 });
  }

  /* 步骤 0：查官方撤销名单 —— 确定性查表，完全不经过 LLM。
     刻意放在 LLM 之前、且不受 DEMO_SAFE_MODE 影响：
     哪怕 Gemini 整个挂掉，这条证据链照样成立。 */
  const registries = [...MY_REGISTRIES, await loadFdaRegistry()];
  const hits = findHits(parsedReq.data.text, registries);

  // 步骤 1：LLM 解析（失败自动降级到 fixtures）
  const parse = await askStructured({
    system: PARSE_SYSTEM,
    user: parsedReq.data.text,
    schema: ParsedInputSchema,
    fallback: FALLBACK_PARSED,
  });

  // 步骤 2：确定性内核算分 —— 这一步没有 LLM 参与
  const factors = toFactors(parse.data.fields);
  const { score, contributions } = weightedScore(factors);
  const level = band(score);

  // 步骤 3：LLM 只负责把数字讲成人话
  const explain = await askStructured({
    system: explainSystemFor(parsedReq.data.lang),
    user: explainUserPrompt({ score, band: level, contributions }),
    schema: ExplainSchema,
    fallback: FALLBACK_ANALYSIS,
  });

  const result: Analysis = {
    headline: explain.data.headline,
    score,
    band: level,
    contributions: contributions.map((c) => ({
      key: c.key,
      label: c.label,
      points: Number(c.points.toFixed(1)),
      normalized: Number(c.normalized.toFixed(3)),
    })),
    explanation: explain.data.explanation,
    actions: explain.data.actions,
    degraded: parse.degraded || explain.degraded,
    registries: registries.map((r) => ({
      id: r.source.id,
      name: r.source.name,
      jurisdiction: r.source.jurisdiction,
      count: r.source.count,
      retrievedAt: r.source.retrievedAt,
      cataloguePage: r.source.cataloguePage,
    })),
    // 和浏览器端共用同一个构造函数，保证两边证据逐字节一致
    evidence: hits.map(toEvidence),
  };

  return NextResponse.json(result);
}
