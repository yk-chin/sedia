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
