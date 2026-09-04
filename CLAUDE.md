# 项目宪法

> 所有 agent（Claude Code / Codex / Cursor）开工前必须读完这份文件。
> 题目公布后，先把所有 ⟨⟩ 占位符填实，再开始写代码。

## 我们在做什么
⟨一句话产品定义：谁 + 能做什么 + 得到什么⟩

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
⟨每到一个关卡就更新这一段：已完成什么、正在做什么、已知的坑⟩
