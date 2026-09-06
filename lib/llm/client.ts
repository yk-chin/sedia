import { z } from "zod";

/* ============================================================
   LLM 唯一出口 (The Only LLM Exit)
   规则：全项目只有这个文件可以调用 LLM。
   四道保险：SAFE MODE / timeout / retry / zod 校验失败降级。
   任何一道触发，UI 都不会崩，只会走 fallback。
   ============================================================ */

/* 15 秒不是拍脑袋定的：实测 gemini-3.6-flash 配当前 prompt，单次调用要 2.6–12.6 秒。
   原本的 8 秒比真实延迟的中位数还短，会把大约一半【成功的】回答当成超时杀掉再重试，
   结果就是界面几乎永远在显示「离线示例数据」。 */
const TIMEOUT_MS = 15000;
const MAX_RETRY = 1;

/** 现场救命开关：Vercel 环境变量改成 true 后 redeploy，全部 LLM 调用走预置结果 */
export const SAFE_MODE = process.env.DEMO_SAFE_MODE === "true";

export const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export class LlmUnavailable extends Error {
  /** retryable=false 表示再试一次也必然是同样的结果（配额耗尽、请求非法、无权限） */
  constructor(
    public reason: string,
    public retryable = true
  ) {
    super(`LLM unavailable: ${reason}`);
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, rej) => {
    /* 超时不重试：15 秒还没回来说明服务端正在过载，立刻重试大概率还是超时
       （实测过一次两个 attempt 全超时，白白花掉 56 秒）。
       重试留给 5xx 和网络抖动那种真的可能一次就好的情况。
       这样单步最坏 15 秒封顶，整个请求最坏 30 秒，而不是 60 秒。 */
    t = setTimeout(() => rej(new LlmUnavailable("timeout", false)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t!);
  }
}

async function callGeminiRaw(
  systemInstruction: string | null,
  userText: string
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new LlmUnavailable("GEMINI_API_KEY 未设置");

  const res = await fetch(`${ENDPOINT(MODEL)}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // systemInstruction = null 表示「像普通人那样直接问」，
      // 对照屏要的就是这种没有任何提示词加持的原始回答
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
        : {}),
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.2,
        ...(systemInstruction ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // 4xx 是客户端侧问题（429 配额耗尽、400 参数错、403 无权限），重试一万次也一样。
    // 5xx 和网络抖动才值得再试一次。
    const retryable = res.status >= 500;
    throw new LlmUnavailable(
      `HTTP ${res.status} ${body.slice(0, 200)}`,
      retryable
    );
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new LlmUnavailable("空响应");
  return text;
}

/**
 * 无提示词的原始提问：不给 system prompt，拿回一段自由文本。
 * 只给对照屏用 —— 我们要展示的就是「普通人直接问通用聊天机器人」会得到什么。
 *
 * 这里没有 zod 校验，因为压根没有结构可校验；
 * 其余三道保险（SAFE_MODE / 15 秒超时 / 重试策略 / fallback）和 askStructured 完全一致。
 */
export async function askText(args: {
  user: string;
  fallback: string;
  /* 对照屏可以给更长的预算：它是用户主动点开的、有骨架屏、不挡主流程。
     没有 system prompt 的自由回答动辄两三千字，15 秒经常不够。
     主分析流程仍然用 TIMEOUT_MS，那条路径才是演示的命脉。 */
  timeoutMs?: number;
}): Promise<{ text: string; live: boolean; reason?: string }> {
  if (SAFE_MODE) {
    return { text: args.fallback, live: false, reason: "SAFE_MODE" };
  }

  let lastReason = "unknown";
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const raw = await withTimeout(
        callGeminiRaw(null, args.user),
        args.timeoutMs ?? TIMEOUT_MS
      );
      const text = raw.trim();
      if (text) return { text, live: true };
      lastReason = "空响应";
    } catch (e) {
      lastReason = e instanceof Error ? e.message : String(e);
      if (e instanceof LlmUnavailable && !e.retryable) break;
    }
  }
  console.warn("[llm] 对照屏降级到预置回答:", lastReason);
  return { text: args.fallback, live: false, reason: lastReason };
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
      // 注定失败的错误直接降级，不再白等第二个 15 秒
      if (e instanceof LlmUnavailable && !e.retryable) break;
    }
  }
  console.warn("[llm] 降级到 fallback:", lastReason);
  return { data: args.fallback, degraded: true, reason: lastReason };
}
