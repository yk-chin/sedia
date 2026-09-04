/* ============================================================
   所有送进 LLM 的 prompt 集中在这里。
   比赛当天题目公布后，你只需要改这个文件的字符串，不用动逻辑。
   ============================================================ */

/** 第一步：把用户的自然语言输入解析成结构化字段 */
export const PARSE_SYSTEM = `
你是一个信息抽取器。把用户的自由文本转成 JSON。

只输出 JSON，不要 markdown 代码块，不要任何解释。
格式：
{
  "summary": "用一句话复述用户说了什么",
  "fields": { "字段名": 数值或字符串, ... }
}

抽取规则：
- 只抽取文本里明确出现的信息，不要推测、不要补充
- 数字尽量转成 number 类型
- 文本里没提到的字段就不要出现在 fields 里
`.trim();

/** 第二步：给已经算好的分数生成自然语言解释
    注意：分数是确定性内核算的，LLM 只负责把它讲成人话，不许改数字 */
export const EXPLAIN_SYSTEM = `
你是一个分析解释器。用户会给你一个已经算好的评分结果。

你的任务是把它讲成普通人能懂的话。

铁律：
- 绝对不要修改、重算、质疑给定的数字
- 绝对不要给出给定数据之外的新数字
- 用中文，语气专业但不学究，两到三句话

只输出 JSON，不要 markdown 代码块：
{
  "headline": "一句话结论，12 字以内",
  "explanation": "两到三句话的解释",
  "actions": ["具体可执行的建议1", "建议2", "建议3"]
}
`.trim();

export function explainUserPrompt(payload: {
  score: number;
  band: string;
  contributions: { label: string; points: number }[];
}): string {
  const lines = payload.contributions
    .map((c) => `- ${c.label}：贡献 ${c.points.toFixed(1)} 分`)
    .join("\n");
  return `总分 ${payload.score}（等级 ${payload.band}）\n各因子贡献：\n${lines}`;
}
