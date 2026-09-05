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
2. `lib/llm/client.ts` 是全项目唯一的 LLM 出口。必须保留 **15 秒 timeout**、1 次 retry、zod 校验、fallback。
   - ⚠️ 原本写的是 8 秒，那是给已下线的 `gemini-2.5-flash` 定的。换成 `gemini-3.6-flash` 后实测单次调用要
     **2.6–12.6 秒**，8 秒比真实延迟的中位数还短，会把大约一半**成功的**回答当成超时杀掉，导致界面几乎
     永远显示「离线示例数据」。**不要改回 8 秒。**
   - retry 只对 5xx 和网络抖动生效。4xx（429 配额耗尽、400 参数错）和 timeout 一律不重试：
     实测有一次两个 attempt 全超时，白白烧掉 56 秒。这样单步最坏 15 秒封顶，整个请求最坏 30 秒。
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

- **HRI 四因子已落地**：`toFactors()` 用的是 SPEC「评分因子」表的真实四项（Irreversibility 4 /
  Actionability 3 / Evidence Gap 3 / Population Vulnerability 2，范围 0–10，不设 invert）。
  代数上与 SPEC 的 `HRI = 100 × (4·Irr+3·Act+3·EvGap+2·Vuln)/120` 完全等价
- **界面已做成成品级**：自托管 Source Sans 3、完整字阶与 token、结果屏层级、CSS 动效
  （分数 count-up、分解条生长、骨架屏）、375px 无横向溢出
- **WOW 对照屏已实现**（`components/AiComparison.tsx`）—— 但叙事换了，见下面「已知的坑」
- UI 语言：**纯英文**（不是 SPEC 原文写的 BM + English 双语，已于 2026-09-05 由用户拍板改掉，
  `docs/SPEC.md` 明确不做 #3 已同步）

**还没做（必做里剩下的）**
- 必做 #1 NPRA 黑名单 ingestion + fuzzy match：未开始，`blacklist.json` 不存在
- 必做 #2 三级降级链：`lib/llm/client.ts` 目前只有「成功 / 整体 fallback」两级，
  还没做「完整 → 部分字段 → 纯文本关键词」
- 必做 #3 的 `resolveVerdict()` 四态决策表（BENAR/PALSU/MENGELIRUKAN/BELUM DISAHKAN）
  和权重扰动翻转率：未开始。现在只有 HRI 这一条轴，没有 verdict 轴

**已知的坑**
- 🔴 **WOW 的前提被实测推翻了**：SPEC 假设通用 LLM 会答得含糊无来源。2026-09-05 实测，
  把三条 `DEMO_SEED_INPUTS` 原样丢给 `gemini-3.6-flash`（无 system prompt），
  **它三条全答对**，连良性的维生素 D 那条也正确判为合理。
  按 SPEC 自己的「对抗样例的诚实门槛」，**不许硬编不公平对比**，所以对照屏改讲护城河叙事：
  「AI 这次也对了 —— 但它给不出数字、给不出可指认的依据、每次措辞都不一样，
  你没办法知道它下次什么时候会错」。左栏是逐字捕获的真实回答，标了模型名和捕获日期。
  **谁都不许把它改成「AI 答错了」的假对比。**
- 对照屏是 SPEC WOW 的**缩减版**：原文要的 `PALSU` + NPRA 撤销注册编号依赖必做 #1/#3，
  两样都没做，所以右栏用的是真实存在的 HRI 内核输出，**不编造假的注册编号**
- **前置动作未完成**：NPRA 名单真实覆盖率还没实测。命中率 < 5/10 是生死开关——必做 #1 要降级为固定 seed list，并在 slide 上明写 coverage 限制，不能当没看见
- 两处「待补」：NPRA 撤销注册产品累计条目数（需从 `data.moh.gov.my` 拉取）、MCMC「约 14%」引述的原始报告页码。拉不到 NPRA 数字则主锚定基线降级为只用 NHMS 两条
- 72 条人工标注 + ordinal logit 回归已明确放弃（N=72 配 4 个高度共线变量，系数不稳定），改用 expert-elicited 权重 + 15 条 pilot 敏感性分析，slide 上不能声称是估计结果
- **速度**：页面渲染 57ms，但 `/api/analyze` 实测 14–22 秒 —— 两次串行 LLM 调用的天花板，
  不是代码能再压的。`TIMEOUT_MS` 已从 8 秒改到 15 秒（见铁律 #2）。
  现场如果 API 抖，直接开 `DEMO_SAFE_MODE=true`，那就是它存在的意义
- Gemini 免费层每天每模型只有 20 次请求配额，调试很容易打满，打满后一律返回 429
