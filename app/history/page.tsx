"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HistoryList } from "@/components/history/HistoryList";
import { HistoryDetail } from "@/components/history/HistoryDetail";

/**
 * 列表和详情共用 /history 这一条路由，靠 ?id= 区分。
 *
 * 刻意**不用** /history/[id] 动态段：动态段要走服务端渲染，
 * 断网时根本打不开，而历史恰恰是断网时最该能看的东西。
 * ?id= 命中的是 service worker 已经预缓存的 /history 这个壳。
 */
function Route() {
  const id = useSearchParams().get("id");
  return id ? <HistoryDetail id={id} /> : <HistoryList />;
}

export default function HistoryPage() {
  return (
    <Suspense fallback={null}>
      <Route />
    </Suspense>
  );
}
