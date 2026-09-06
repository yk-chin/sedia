"use client";

import { EvidenceCard } from "@/components/EvidenceCard";
import { SubstanceCard } from "@/components/SubstanceCard";
import type { LocalFindings } from "@/lib/core/local";
import type { Analysis } from "@/lib/types";

/**
 * 确定性那部分的结果：官方记录命中 + 成分识别。
 *
 * 页面、历史详情、加载中三处共用同一个组件 ——
 * 「同样输入永远同样结果」如果三个地方各渲染各的，迟早会不一样。
 *
 * 顺序是有意的：先是对产品的官方裁定（最强的证据），再是成分层。
 */
export function FindingsList({
  evidence,
  adulterants,
  medicines,
  registries,
}: {
  evidence: Analysis["evidence"];
  adulterants: LocalFindings["adulterants"];
  medicines: LocalFindings["medicines"];
  registries: Analysis["registries"];
}) {
  if (evidence.length === 0 && adulterants.length === 0 && medicines.length === 0)
    return null;

  return (
    <div className="mb-6 flex flex-col gap-4">
      {evidence.map((e) => (
        <EvidenceCard key={e.source.id + e.notifNo} evidence={e} />
      ))}
      <SubstanceCard
        adulterants={adulterants}
        medicines={medicines}
        registries={registries}
      />
    </div>
  );
}
