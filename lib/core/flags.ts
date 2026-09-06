/* ============================================================
   离线风险标记 —— 确定性内核的一部分
   规则：纯函数，禁止 import LLM / fetch / 任何网络调用（铁律 #1）。

   为什么只给标记、不给分数：
   HRI 的四个因子评分是 LLM 给的，断网时拿不到。如果用关键词凑一个数字出来，
   同一条消息在线和离线会显示两个不同的分数，「同样输入永远同样分数」这个
   立身之本当场就没了。所以这里只回答「这条消息里出现了哪些危险信号」，
   一个数字都不编。

   关键词覆盖英文 / 马来文 / 中文 —— 用户转发的消息本来就是混着写的。
   ============================================================ */

export type FlagKey =
  | "stopMedication"
  | "replaceTreatment"
  | "urgency"
  | "vulnerable"
  | "miracleClaim"
  | "hearsay";

/** 每条规则命中任意一个 pattern 即算命中 */
const RULES: { key: FlagKey; patterns: RegExp[] }[] = [
  {
    key: "stopMedication",
    patterns: [
      /\bstop(?:\s+\w+){0,2}\s+(?:taking|using|the\s+)?(?:medicat|medicine|pills?|drugs?|insulin)/i,
      /\bquit\s+(?:taking\s+)?(?:medicat|medicine|pills?)/i,
      /\bberhenti\s+(?:makan\s+|ambil\s+)?ubat/i,
      /停(?:用|服|吃)?药|停用.{0,4}药|别再吃药|不要再吃药/,
    ],
  },
  {
    key: "replaceTreatment",
    patterns: [
      /\binstead\s+of\b/i,
      /\breplaces?\b|\breplacing\b|\bsubstitute\s+for\b/i,
      /\bganti(?:kan)?\b|\bpengganti\b/i,
      /代替|替代|取代|不用去医院|不必看医生/,
    ],
  },
  {
    key: "urgency",
    patterns: [
      /\bimmediately\b|\bright\s+away\b|\bstop\s+now\b|\bstart\s+now\b|\bas\s+soon\s+as\s+possible\b/i,
      /\bsegera\b|\bcepat\b|\bsekarang\s+juga\b/i,
      /马上|立刻|立即|赶紧|趁早/,
    ],
  },
  {
    key: "vulnerable",
    patterns: [
      /\belderly\b|\bold\s+folks?\b|\bpregnan\w*|\bdiabet\w*|\bhypertens\w*|\bkidney\s+(?:disease|patients?)\b/i,
      /\bwarga\s+emas\b|\borang\s+tua\b|\bhamil\b|\bkencing\s+manis\b|\bdarah\s+tinggi\b/i,
      /长者|老人家|老年人|孕妇|糖尿病|高血压|肾病|慢性病/,
    ],
  },
  {
    key: "miracleClaim",
    patterns: [
      /\b100\s*%|\bno\s+side[-\s]?effects?\b|\bmiracle\b|\bguaranteed\b|\bcures?\s+(?:everything|all)\b|\ball\s+natural\b|\b100%\s*herbal\b/i,
      /\btiada\s+kesan\s+sampingan\b|\bsemula\s+jadi\b|\bdijamin\b|\bmujarab\b/i,
      /纯天然|无副作用|没有副作用|包治|神奇|特效|保证有效|百分百/,
    ],
  },
  {
    key: "hearsay",
    patterns: [
      /\bthey\s+say\b|\bi\s+heard\b|\bpeople\s+say\b|\bsomeone\s+said\b|\bmy\s+(?:aunty|friend|neighbour|neighbor)\s+(?:say|said|tell|told)/i,
      /\bkatanya\b|\borang\s+kata\b|\bkata\s+orang\b/i,
      /听说|据说|群里说|朋友说|邻居说|网上说/,
    ],
  },
];

/**
 * 找出消息里出现的危险信号。
 * 同样的输入永远得到同样的结果 —— 和名单查询一样是确定性的。
 */
export function findFlags(message: string): FlagKey[] {
  const text = message.trim();
  if (!text) return [];
  return RULES.filter((rule) => rule.patterns.some((p) => p.test(text))).map(
    (rule) => rule.key
  );
}
