import type { Factor } from "@/lib/types";

/* ============================================================
   确定性内核 (Deterministic Core)
   规则：本文件禁止 import 任何 LLM / fetch / 网络调用。
   纯函数。同样的输入永远得到同样的输出。
   这是你在 Q&A 里指着说"这部分不经过 LLM"的地方。
   ============================================================ */

/** 把原始值线性归一化到 [0,1]；invert=true 表示越小越好 */
export function normalize(f: Factor): number {
  const span = f.max - f.min;
  if (span === 0) return 0;
  const clamped = Math.min(Math.max(f.raw, f.min), f.max);
  const n = (clamped - f.min) / span;
  return f.invert ? 1 - n : n;
}

export type Contribution = {
  key: string;
  label: string;
  points: number;
  normalized: number;
};

/**
 * 加权评分。权重会自动归一化，所以你可以随便写 3 / 5 / 2 这种相对权重。
 * 返回 0-100 的分数和每个因子的贡献明细（用于可视化，这是 demo 的 WOW 素材）。
 */
export function weightedScore(factors: Factor[]): {
  score: number;
  contributions: Contribution[];
} {
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  if (totalWeight === 0) {
    return { score: 0, contributions: [] };
  }
  const contributions = factors.map((f) => {
    const n = normalize(f);
    const points = (f.weight / totalWeight) * n * 100;
    return { key: f.key, label: f.label, points, normalized: n };
  });
  const score = contributions.reduce((s, c) => s + c.points, 0);
  return { score: round(score, 1), contributions };
}

export function band(score: number): "low" | "medium" | "high" {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

export function round(n: number, dp = 2): number {
  const p = Math.pow(10, dp);
  return Math.round(n * p) / p;
}

/* ---------- 计量工具：多元线性回归 (OLS, 正规方程 + 高斯消元) ----------
   给需要"用数据说话"的场景。例如：用历史数据拟合一个预测式，
   在 pitch 里说"这个系数是我们从 N 条数据里估出来的，不是 LLM 猜的"。
------------------------------------------------------------------- */

export type OLSResult = {
  /** [截距, 系数1, 系数2, ...] */
  coefficients: number[];
  r2: number;
  n: number;
  k: number;
};

/** X: 每行是一条观测的自变量（不含截距列）；y: 因变量 */
export function ols(X: number[][], y: number[]): OLSResult {
  const n = X.length;
  if (n === 0 || y.length !== n) throw new Error("ols: X 和 y 长度不匹配");
  const k = X[0].length;
  // 加上截距列
  const D = X.map((row) => [1, ...row]);
  const p = k + 1;

  // 正规方程 (X'X) b = X'y
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < p; a++) {
      Xty[a] += D[i][a] * y[i];
      for (let b = 0; b < p; b++) XtX[a][b] += D[i][a] * D[i][b];
    }
  }
  const coefficients = solve(XtX, Xty);

  const yBar = y.reduce((s, v) => s + v, 0) / n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const pred = D[i].reduce((s, v, j) => s + v * coefficients[j], 0);
    ssRes += (y[i] - pred) ** 2;
    ssTot += (y[i] - yBar) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { coefficients, r2: round(r2, 4), n, k };
}

/** 高斯消元解 Ax = b（带部分主元） */
function solve(A: number[][], b: number[]): number[] {
  const p = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < p; col++) {
    let pivot = col;
    for (let r = col + 1; r < p; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) continue; // 奇异，跳过
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = 0; r < p; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= p; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) =>
    Math.abs(row[i]) < 1e-12 ? 0 : round(row[p] / row[i], 6)
  );
}

/** 预测：给定 ols 结果和一条新观测 */
export function predict(model: OLSResult, x: number[]): number {
  return round(
    model.coefficients[0] +
      x.reduce((s, v, i) => s + v * model.coefficients[i + 1], 0),
    4
  );
}
