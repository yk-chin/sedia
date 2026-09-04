import { z } from "zod";

/* ============================================================
   LLM 唯一出口 (The Only LLM Exit)
   规则：全项目只有这个文件可以调用 LLM。
   四道保险：SAFE MODE / timeout / retry / zod 校验失败降级。
   任何一道触发，UI 都不会崩，只会走 fallback。
   ============================================================ */

const TIMEOUT_MS = 8000;
const MAX_RETRY = 1;

/** 现场救命开关：Vercel 环境变量改成 true 后 redeploy，全部 LLM 调用走预置结果 */
export const SAFE_MODE = process.env.DEMO_SAFE_MODE === "true";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export class LlmUnavailable extends Error {
  constructor(public reason: string) {
    super(`LLM unavailable: ${reason}`);
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new LlmUnavailable("timeout")), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t!);
  }
}

async function callGeminiRaw(
  systemInstruction: string,
  userText: string
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new LlmUnavailable("GEMINI_API_KEY 未设置");

  const res = await fetch(`${ENDPOINT(MODEL)}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new LlmUnavailable(`HTTP ${res.status} ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new LlmUnavailable("空响应");
  return text;
}

/**
 * 结构化调用：拿到 JSON，用 zod 校验，任何一步失败都返回 fallback。
 * 调用方永远拿到合法数据，永远不会看到异常。
 */
export async function askStructured<T>(args: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  fallback: T;
}): Promise<{ data: T; degraded: boolean; reason?: string }> {
  if (SAFE_MODE) {
    return { data: args.fallback, degraded: true, reason: "SAFE_MODE" };
  }

  let lastReason = "unknown";
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const raw = await withTimeout(
        callGeminiRaw(args.system, args.user),
        TIMEOUT_MS
      );
      const cleaned = raw
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      const parsed = args.schema.safeParse(JSON.parse(cleaned));
      if (parsed.success) {
        return { data: parsed.data, degraded: false };
      }
      lastReason = `schema: ${parsed.error.issues[0]?.message ?? "invalid"}`;
    } catch (e) {
      lastReason = e instanceof Error ? e.message : String(e);
    }
  }
  console.warn("[llm] 降级到 fallback:", lastReason);
  return { data: args.fallback, degraded: true, reason: lastReason };
}
