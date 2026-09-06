import { findHits, toEvidence, loadFdaRegistry, MY_REGISTRIES } from "@/lib/core/registry";
import { findFlags, type FlagKey } from "@/lib/core/flags";
import {
  findAdulterants,
  findMedicines,
  loadDrugNames,
  type AdulterantHit,
  type MedicineHit,
} from "@/lib/core/substances";
import type { Analysis } from "@/lib/types";

/* ============================================================
   本地这一趟 —— 查官方名单 + 认成分 + 标关键词。
   全部是确定性的：同样的输入永远得到同样的结果，一个数字都不编。

   断网时这就是全部结果；在线时它先跑，让证据卡不用陪着 LLM 一起等十几秒。
   页面和历史详情页共用同一个函数 —— 历史里不存这些推导结果，
   打开时现场重算，存得更少，也顺带证明了确定性。
   ============================================================ */

export type LocalFindings = {
  evidence: Analysis["evidence"];
  registries: Analysis["registries"];
  flags: FlagKey[];
  /** 官方点名过的违禁成分 —— 这是警告 */
  adulterants: AdulterantHit[];
  /** 认出来的真实药物 —— 这只是识别，不是警告 */
  medicines: MedicineHit[];
};

export function isEmpty(f: LocalFindings): boolean {
  return (
    f.evidence.length === 0 &&
    f.flags.length === 0 &&
    f.adulterants.length === 0 &&
    f.medicines.length === 0
  );
}

/**
 * 两本按需加载的字典（FDA 造假名单 42KB、药名字典 11KB）都不进首屏包。
 * 拉不到就跳过 —— 马来西亚两份名单和违禁成分字典是静态打包的，
 * 所以就算完全离线、service worker 还没缓存过，核心能力照样在。
 */
async function optional<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch {
    return null;
  }
}

export async function analyseLocally(
  message: string,
  productName?: string
): Promise<LocalFindings> {
  const registries = [...MY_REGISTRIES];
  const fda = await optional(loadFdaRegistry);
  if (fda) registries.push(fda);

  const adulterants = findAdulterants(message);
  const drugs = await optional(loadDrugNames);

  return {
    evidence: findHits(message, registries, productName).map(toEvidence),
    registries: registries.map((r) => ({
      id: r.source.id,
      name: r.source.name,
      jurisdiction: r.source.jurisdiction,
      count: r.source.count,
      retrievedAt: r.source.retrievedAt,
      cataloguePage: r.source.cataloguePage,
    })),
    flags: findFlags(message),
    adulterants,
    // 已经作为违禁成分报出来的，不再重复列成「已识别药物」
    medicines: findMedicines(message, drugs, adulterants),
  };
}

/**
 * 首屏画完后把两个按需 chunk 预热进 service worker 缓存。
 * 不预热的话，用户是在**断网之后**才第一次点查验 —— 那时候已经拉不到了。
 */
export function warmLocalData(): void {
  void optional(loadFdaRegistry);
  void optional(loadDrugNames);
}
