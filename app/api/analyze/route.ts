import { NextResponse } from "next/server";
import { z } from "zod";
import { AnalyzeRequestSchema, ParsedInputSchema } from "@/lib/types";
import type { Analysis, Factor } from "@/lib/types";
import { weightedScore, band } from "@/lib/core/scoring";
import { askStructured } from "@/lib/llm/client";
import {
  PARSE_SYSTEM,
  EXPLAIN_SYSTEM,
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

/** 把解析结果映射成评分因子。题目公布后改这里。 */
function toFactors(fields: Record<string, string | number>): Factor[] {
  const num = (k: string, d: number) => {
    const v = fields[k];
    return typeof v === "number" ? v : Number(v) || d;
  };
  return [
    {
      key: "f1",
      label: "指标一",
      weight: 3,
      raw: num("指标一", 50),
      min: 0,
      max: 100,
    },
    {
      key: "f2",
      label: "指标二",
      weight: 2,
      raw: num("指标二", 20),
      min: 0,
      max: 60,
      invert: true,
    },
    {
      key: "f3",
      label: "指标三",
      weight: 1,
      raw: num("指标三", 3),
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
    system: EXPLAIN_SYSTEM,
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
  };

  return NextResponse.json(result);
}
