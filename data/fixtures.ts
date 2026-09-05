import type { Analysis, ParsedInput } from "@/lib/types";

/* ============================================================
   降级用的预置结果 (Fallback Fixtures)
   SAFE MODE 打开、API 挂掉、超时、校验失败时，返回这些。
   内容是 SIHAT 的真实场景（长辈转发"降压药伤肾改喝苦瓜汁"），
   保证降级画面本身就是一个有说服力的高风险案例，不是空洞占位。
   UI 语言统一为英文，这里的内容也保持英文一致。
   ============================================================ */

export const FALLBACK_PARSED: ParsedInput = {
  summary:
    "An elder forwarded a message in the family group: blood pressure pills harm the kidneys, suggests stopping them for bitter gourd juice instead",
  fields: {
    claim:
      "Long-term use of blood pressure medication harms the kidneys; bitter gourd juice can restore normal blood pressure",
    action: "Stop the blood pressure medication, drink bitter gourd juice daily",
    substance: "Bitter gourd juice",
    product_name: "",
    dosage: "",
    target_population: "People with high blood pressure",
    claimed_authority: "Shared as a neighbour's personal experience",
    risk_reasoning:
      "Suddenly stopping blood pressure medication can cause blood pressure to rebound; bitter gourd juice has no reliable evidence to replace the medication",
    irreversibility: 8,
    actionability: 7,
    evidence_gap: 9,
    population_vulnerability: 6,
  },
};

export const FALLBACK_ANALYSIS: Omit<
  Analysis,
  "score" | "band" | "contributions" | "degraded"
> = {
  headline: "High risk: may destabilise blood pressure",
  explanation:
    "This message suggests stopping a prescribed blood pressure medication for an unproven bitter gourd remedy. Stopping suddenly can cause blood pressure to rebound, and the risk is greater for people already diagnosed with hypertension.",
  actions: [
    "Talk to your doctor or pharmacist before stopping any medication",
    "Bitter gourd juice can be a dietary addition, not a replacement for prescribed medication",
    "Keep monitoring blood pressure and seek care promptly if it fluctuates",
  ],
};

/** demo 首页展示用的示例输入，评委一打开就会点这三条。UI 已定为纯英文，这三条也用英文。 */
export const DEMO_SEED_INPUTS: string[] = [
  "An aunty forwarded this in the family group: blood pressure pills damage your kidneys if taken too long, better to stop now and drink bitter gourd juice every day instead — your blood pressure will normalise on its own.",
  "A message going viral claims a product called 'Insulin Recovery Pills' is 100% natural with no side effects and can replace diabetes injections — apparently many elders are already taking it.",
  "Saw a post saying elderly people can benefit from a modest daily dose of vitamin D3 for bone health, and should take it under a doctor's guidance.",
];

/* ============================================================
   对照屏用的通用 LLM 回答 —— 真实捕获，逐字保存，没有一个字是编的。

   捕获方式：把 DEMO_SEED_INPUTS[0] 原样贴给 gemini-3.6-flash，
   不给任何 system prompt，后面接一句 "Is this true? Should I do it?"，
   就是普通人打开一个通用聊天机器人会做的事。

   ⚠️ 重要：它答对了。三条示例全部答对了。
   所以对照屏讲的不是「AI 答错了」，而是「AI 这次答对了，但你没有任何办法
   知道它下次什么时候会错」—— 它给不出数字、给不出可指认的依据、每次问
   措辞都不一样。SPEC「对抗样例的诚实门槛」明确禁止硬编不公平对比。
   ============================================================ */
export const GENERIC_AI_ANSWER = {
  model: "gemini-3.6-flash",
  capturedOn: "2026-09-05",
  /** 逐字原文（含模型自己输出的 markdown 记号，渲染时只去掉记号、不改措辞） */
  text: `**No, this is not true, and you should not stop taking your blood pressure medication.**

WhatsApp forwards like this are very common, but following this advice can be dangerous. Here is what you need to know about blood pressure, your kidneys, and natural remedies:

### 1. Uncontrolled Blood Pressure Damages Kidneys, Not the Pills
The claim that blood pressure pills destroy kidneys gets the science backward. **Uncontrolled high blood pressure is actually one of the leading causes of chronic kidney disease and kidney failure.** High pressure damages the delicate blood vessels inside your kidneys over time, reducing their ability to filter waste from your blood.

Furthermore, many of the most common classes of blood pressure medications (such as ACE inhibitors like lisinopril, or ARBs like losartan) are specifically given because they **protect** the kidneys, especially in people with diabetes or early kidney disease.

### 2. Stopping Medication Abruptly is Dangerous
Stopping blood pressure pills suddenly—sometimes called going "cold turkey"—can trigger a dangerous spike in blood pressure (known as rebound hypertension). This sudden jump in pressure significantly increases the immediate risk of a **stroke, heart attack, or hypertensive crisis**.

### 3. Bitter Gourd Juice is Not a Replacement for Medication
While bitter gourd (karela) is a healthy vegetable rich in vitamins and antioxidants, **there is no scientific evidence that drinking its juice can replace prescription blood pressure medication.**

While dietary changes are a crucial part of managing blood pressure, they work best alongside medical treatment, not as a sudden replacement for proven therapies.`,
} as const;
