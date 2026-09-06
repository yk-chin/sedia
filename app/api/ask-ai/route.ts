import { NextResponse } from "next/server";
import { z } from "zod";
import { askText, MODEL } from "@/lib/llm/client";
import { GENERIC_AI_ANSWER } from "@/data/fixtures";

export const runtime = "nodejs";

/* ============================================================
   对照屏专用：把用户**这一条**消息，原样丢给通用聊天机器人。

   为什么必须实时问：
   界面上写着「我们把同一条消息问了通用聊天机器人」。如果显示的是一段
   预先录好的、和当前输入无关的回答，那句话就是假的。评委现场随便贴一条
   自己的消息就能拆穿。宁可多花几秒，也不能让界面说谎。

   调不通时回落到预置回答，并且**明确标注它是预置的**（live: false），
   前端会照实显示，不会冒充成实时结果。
   ============================================================ */

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
  lang: z.enum(["en", "ms", "zh"]).default("en"),
});

/** 普通人会追问的那句话，用用户自己的语言问，对照才公平 */
const FOLLOW_UP: Record<string, string> = {
  en: "Is this true? Should I do it?",
  ms: "Adakah ini benar? Patutkah saya ikut?",
  zh: "这是真的吗？我该照做吗？",
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "输入不合法" }, { status: 400 });
  }

  const { text, lang } = parsed.data;
  const result = await askText({
    // 不给任何 system prompt —— 就是普通人打开聊天机器人贴进去的样子
    user: `${text}\n\n${FOLLOW_UP[lang] ?? FOLLOW_UP.en}`,
    fallback: GENERIC_AI_ANSWER.text,
    // 通用聊天机器人的自由回答常常两三千字，实测 11–15 秒，15 秒卡得太紧。
    // 这条请求是点开对照屏才发的，等久一点没关系。
    timeoutMs: 28_000,
  });

  /* 三种状态必须让前端分得清：
     live —— 真的问到了这一条的回答
     safe —— DEMO_SAFE_MODE 开着，本来就该显示预置内容
     failed —— 调用失败。这种情况**不显示**那段预置回答：
               它是针对另一条消息的，摆出来只会让人以为「怎么问什么都一样」。 */
  const mode = result.live ? "live" : result.reason === "SAFE_MODE" ? "safe" : "failed";

  return NextResponse.json({
    answer: mode === "failed" ? "" : result.text,
    model: MODEL,
    mode,
    capturedOn: mode === "safe" ? GENERIC_AI_ANSWER.capturedOn : null,
  });
}
