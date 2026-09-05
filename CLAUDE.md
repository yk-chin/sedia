# 项目宪法

> 所有 agent（Claude Code / Codex / Cursor）开工前必须读完这份文件。
> 题目公布后，先把所有 ⟨⟩ 占位符填实，再开始写代码。

## 我们在做什么
**SIHAT**（Sistem Isyarat Hoaks & Amaran Terapi）——给马来西亚 45–65 岁家庭群组用户（尤其是转发健康消息的家庭主妇）用的：粘贴一条中巫混杂的转发消息（例如「降压药伤肾，改喝苦瓜汁」），系统用 LLM 抽取结构化字段，比对 NPRA 违禁成分黑名单与本地 curated corpus，用确定性决策表判定四态真伪（BENAR / PALSU / MENGELIRUKAN / BELUM DISAHKAN），并行算出照做后果的危害指数 HRI，几秒内给出「这条消息是不是真的」以及「照做会不会造成不可逆伤害」两个答案，而不是让用户自己赌。

## 比赛约束（最高优先级，与其他要求冲突时以此为准）
- 赛事：Hackathon Sedia! 2026，GDGoC @ Multimedia University
- 提交截止：9 月 6 日 13:30。Pitch 7 分钟 + Q&A 3 分钟
- 总可用工时约 19 小时
- 评分：Technical 30 / Innovation 25 / Problem+SDG 25 / Presentation 20
- **最高准则：演示可靠性 > 功能数量**
- 任何会增加崩溃概率或部署失败模式的改动，默认拒绝

## 架构铁律（不可协商）
1. `lib/core/` 只放纯函数和确定性逻辑。**禁止**在此 import LLM、fetch 或任何网络调用。
2. `lib/llm/client.ts` 是全项目唯一的 LLM 出口。必须保留 8 秒 timeout、1 次 retry、zod 校验、fallback。
3. 所有 LLM 输出必须过 zod schema。校验失败走 `data/fixtures.ts` 的降级值，**绝不把异常抛给 UI**。
4. 数字、排序、决策一律由 `lib/core/` 计算。LLM 只做三件事：解析非结构化输入、生成解释文案、决定调用哪个函数。
5. 必须保留 `DEMO_SAFE_MODE=true` 开关：打开后全部 LLM 调用走预置结果，界面表现完全正常。
6. 单文件不超过 300 行。
7. 禁止新增依赖，除非先问我。
8. 不使用 `next/font/google`（build 时会去抓 Google 字体，现场网络不稳会直接让 build 失败）。

## 每个任务的完成定义（DoD）
- [ ] `npm run build` 通过
- [ ] 用浏览器 MCP 打开**线上 URL**（不是 localhost）实际点击验证，给我截图
- [ ] loading / 空状态 / 错误态 三态都处理了
- [ ] 375px 宽度下不横向滚动、不重叠
- [ ] Console 无 error
- [ ] 没有硬编码密钥

## 绝对不要做
- 不重构不在本次任务范围内的代码
- 不"顺手"升级依赖版本
- 不写测试文件，除非我明确要求
- 不修改 `docs/SPEC.md`
- 不删除 `DEMO_SAFE_MODE` 相关代码

## 组合技：调用 Codex 做跨模型评审
当我说 `cross-review` 时，你执行：
1. `git diff > /tmp/review.diff`
2. 运行：
   ```
   codex exec "你是严苛的 staff engineer，在做 hackathon 部署前的最后评审。
   只报告会导致【现场演示崩溃】或【现场演示尴尬】的问题。
   忽略代码风格、命名、测试覆盖率、性能优化。
   每个问题给出：文件:行号 + 一句话原因 + 最小修复方案（不要重构）。
   $(cat /tmp/review.diff)"
   ```
3. 把 Codex 的输出原样贴给我，按严重度排序
4. 在我明确指定要修哪几条之前，不要动任何代码

## 当前状态

**已完成**
- 项目脚手架搭好：Next.js 16 + TypeScript + Tailwind + zod，代码已推送到 GitHub（`yk-chin/sedia`，Public）并部署到 Vercel（`https://sedia-eight.vercel.app`）
- Gemini API 已打通：`gemini-2.5-flash` 已下线导致 404，已切换到 `GEMINI_MODEL=gemini-3.6-flash`，本地和线上均验证过真实调用成功（`degraded:false`）
- `lib/llm/client.ts` 的降级链（timeout / zod 校验失败 / `DEMO_SAFE_MODE`）已验证生效，异常不会抛给 UI
- SPEC 已于 09:50 冻结，`docs/SPEC.md` 已写入正式内容

**正在做（必做 1–4 尚未按新 SPEC 实现，当前代码还是通用占位脚手架）**
- 必做 #1 NPRA 黑名单 ingestion + fuzzy match：未开始，`blacklist.json` 不存在
- 必做 #2 LLM extraction schema + 三级降级链：当前 `lib/llm/client.ts` 只有「成功 / 整体 fallback 到 fixtures」两级，还没做「完整 → 部分字段 → 纯文本关键词」三级降级
- 必做 #3 `lib/core/scoring.ts`：当前是占位的通用加权评分（指标一/二/三），还没换成 SPEC 定义的四因子（Irreversibility / Actionability / Evidence Gap / Population Vulnerability）+ `resolveVerdict()` 四态决策表 + 权重扰动翻转率输出
- 必做 #4 结果屏 + 对抗对比屏：当前 UI（`page.tsx` / `ResultCard` 等）是占位的通用评分卡展示，还没做四态大字判定、HRI 四维分解条形图、左右对抗对比屏

**已知的坑**
- **前置动作未完成**：NPRA 名单真实覆盖率还没实测。命中率 < 5/10 是生死开关——必做 #1 要降级为固定 seed list，并在 slide 上明写 coverage 限制，不能当没看见
- 两处「待补」：NPRA 撤销注册产品累计条目数（需从 `data.moh.gov.my` 拉取）、MCMC「约 14%」引述的原始报告页码。拉不到 NPRA 数字则主锚定基线降级为只用 NHMS 两条
- 72 条人工标注 + ordinal logit 回归已明确放弃（N=72 配 4 个高度共线变量，系数不稳定），改用 expert-elicited 权重 + 15 条 pilot 敏感性分析，slide 上不能声称是估计结果
- WOW 已从「同一输入连续两次结果一致」换成「左右对抗对比屏」——前者把可信度完全押在 Gemini 抽取稳定性上，评委现场换个新句式就能让它当场降级
- Gemini API 偶发 HTTP 503（high demand）和超时属正常现象，降级链能兜住；如果 demo 现场频繁触发，可以考虑调大 `TIMEOUT_MS`（本次未做，超出当前任务范围）
