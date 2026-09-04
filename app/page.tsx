"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { ResultCard } from "@/components/ResultCard";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { DEMO_SEED_INPUTS } from "@/data/fixtures";
import type { Analysis } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<Analysis | null>(null);
  const [error, setError] = useState("");

  async function run(input: string) {
    if (!input.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error(`服务返回 ${res.status}`);
      setData((await res.json()) as Analysis);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
      setStatus("error");
    }
  }

  return (
    <AppShell
      title="⟨项目名⟩"
      tagline="⟨一句话定义：谁 + 能做什么 + 得到什么⟩"
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label
            htmlFor="input"
            className="block text-sm font-medium text-slate-700"
          >
            描述你的情况
          </label>
          <textarea
            id="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="用一两句话说明就好"
            className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => run(text)}
              disabled={status === "loading" || !text.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {status === "loading" ? "分析中…" : "开始分析"}
            </button>
            <span className="text-xs text-slate-400">或试试：</span>
            {DEMO_SEED_INPUTS.slice(0, 2).map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setText(s);
                  void run(s);
                }}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-slate-900"
              >
                示例 {i + 1}
              </button>
            ))}
          </div>
        </div>

        {status === "idle" && (
          <EmptyState
            title="还没有结果"
            hint="输入一段描述，或直接点上面的示例，几秒钟就能看到分析。"
          />
        )}
        {status === "loading" && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <LoadingState rows={4} />
          </div>
        )}
        {status === "error" && (
          <ErrorState message={error} onRetry={() => void run(text)} />
        )}
        {status === "done" && data && <ResultCard data={data} />}
      </div>
    </AppShell>
  );
}
