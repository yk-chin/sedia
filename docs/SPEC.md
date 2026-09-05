# SPEC（09:50 冻结）

> 冻结后不接受新增功能。任何改动必须先从「必做」里砍掉等量工时。
> 项目代号：**SIHAT** — Sistem Isyarat Hoaks & Amaran Terapi

---

## 问题

**45–65 岁的马来西亚家庭群组成员，在收到一条建议停用处方药、改用未经验证疗法或来路不明保健品的转发消息时，没有任何快速手段判断这条消息是否属实、以及照做的后果是否不可逆，于是在几分钟内做出可能造成永久健康损害的决定。**

---

## 目标用户

**主要用户**：在家族 WhatsApp 群里转发「降压药伤肾，改喝苦瓜汁」的 52 岁华裔／马来裔主妇，本人有高血压或糖尿病，手机是 Android，中文/马来文混杂输入，不使用桌面浏览器，不会主动复制粘贴长文本但会长按转发。

**次要用户（不为其做任何 UI 妥协）**：她 22 岁的儿子，想反驳但不想吵架，会替她打开网页并把结果截图回群。

**明确排除**：公共卫生官员、fact-checker、研究人员。他们是 roadmap 的最后一页 slide，不是 v1 的用户。

---

## SDG 锚定

### 主锚定

- **Goal 3** — Ensure healthy lives and promote well-being for all at all ages
- **Target 3.d** — 原文：*"Strengthen the capacity of all countries, in particular developing countries, for early warning, risk reduction and management of national and global health risks."*
- **Indicator 3.d.1** — International Health Regulations (IHR) capacity and health emergency preparedness

**基线数据**

| 数值 | 来源 | 年份 |
|---|---|---|
| 近两周有急性健康问题者中，**20.7%** 未经医护人员建议自行服药 | NHMS 2023 Fact Sheet, Institute for Public Health (IKU), MOH Malaysia | 2023 |
| 同一群体中，**15.1%** 从互联网、电视、广播等非医疗渠道获取健康建议 | NHMS 2023 Fact Sheet, IKU MOH | 2023 |
| **35.1%** 马来西亚成年人健康素养偏低（low health literacy） | NHMS 2019 Fact Sheet, IKU MOH | 2019 |
| MCMC 追踪的已辟谣条目中，**约 14%** 属健康类 | MCMC / Sebenarnya.my（经二手来源引述，**原始报告页码待补**） | 2021 引述 |

### 次锚定

- **Target 3.8** — 原文节选：*"…access to safe, effective, quality and affordable essential medicines and vaccines for all."*
- **Indicator 3.8.1** — Coverage of essential health services

**基线数据**：NPRA / Drug Control Authority 已撤销注册、含违禁成分的产品累计条目数 = **待补（09:50 前必须从 data.moh.gov.my 拉取并填入真实数字）**

> 这个数字是 pitch 第一页的锚。如果拉不到，主锚定基线降级为只用 NHMS 两条。

---

## 核心流程（demo 路径，150 秒内演完）

1. **用户** 粘贴一条中巫混杂的转发消息 → **系统** 用 LLM 抽取为固定 schema `{claim, action, substance, product_name, dosage, target_population, claimed_authority}`，校验失败自动降级为部分字段
2. **系统** 将 `substance` / `product_name` 精确比对 NPRA 违禁成分黑名单，同时在本地 curated corpus 检索 → 走确定性决策表判定四态之一
3. **系统** 并行计算 HRI 危害指数 → 主屏输出：**大字四态判定**（BENAR / PALSU / MENGELIRUKAN / BELUM DISAHKAN）+ 官方来源编号 + 一行「你现在该做什么」，下方小字 `危害指数 78.4 · 点击展开四维分解`
4. **用户** 点击「为什么不是 AI 说了算？」 → **WOW 时刻**：左右并排双屏，左边是同一条消息直接问通用 LLM 的输出（绿色 / 含糊 / 无来源），右边是 SIHAT 输出（红色 `PALSU` + NPRA 撤销注册编号 + 违禁成分名）

---

## 必做（总计 8.0 小时）

| # | 内容 | 预估工时 | 验收标准 |
|---|---|---|---|
| 1 | **NPRA 黑名单 ingestion + fuzzy match**：从 data.moh.gov.my 拉取违禁成分/撤销注册数据，清洗为 `blacklist.json`，实现 token-set fuzzy match（阈值 0.85） | **2.0h** | 10 条真实产品名，命中率 ≥ 8/10，零误报 |
| 2 | **LLM extraction schema + 降级链**：强制 JSON schema，超时/校验失败三级降级（完整 → 部分字段 → 纯文本关键词） | **1.5h** | 20 条脏输入（中巫混杂、含 emoji、含错别字）无一崩溃 |
| 3 | **`lib/core/scoring.ts`**：决策表定四态 + 加权评分卡算 HRI + 权重 ±30% 扰动的 verdict 翻转率输出 | **2.0h** | 同一输入连续 10 次调用，HRI 逐字节相同；翻转率能打印 |
| 4 | **结果屏 + 对抗对比屏**：四态主输出、HRI 四维分解条形图、左右并排双屏 | **2.5h** | 移动端 375px 宽下不溢出；对比屏截图可直接进 slide |

> **前置动作（不计入 8 小时，09:50 前完成）**：验证 NPRA 名单实际覆盖率。若命中率 < 5/10，必做 #1 的 fuzzy match 降级为固定 seed list，并在 slide 上明写 coverage 限制。

---

## WOW（只能 1 条）

**左右并排对抗屏**：同一条真实流传的健康消息，左边通用 LLM 给出绿色含糊回答且无任何来源，右边 SIHAT 给出红色 `PALSU` + NPRA 撤销注册编号 + 违禁成分名称。

台词只有一句：**"Bukan AI yang cakap. Data KKM yang cakap."**（不是 AI 说的，是 KKM 的数据说的。）

> 选它的理由：不依赖 API 输出稳定性、不需要评委听懂任何统计学、且它同时证明了确定性内核的必要性。旧方案的「跑两次结果一样」**已废弃**——它把整个方案的信誉押在 Gemini 的抽取稳定性上。

---

## 明确不做

1. **不做注册登录** — 无账号、无 session、无用户数据存储
2. **不做原生 app** — 只有一个部署好的 web URL
3. **不做多语言** — UI 文案、LLM 输出（headline/explanation/actions）**固定纯英文硬编码**；**不做**语言切换器、不做 BM/中文/Tamil 本地化、不做输出语言自适应。（输入端接受任意语言混杂，那是 LLM 抽取的副产品，零成本，不算多语言功能；⚠️ 此条已于实现阶段从"BM + English 双语并列"改为"纯英文"，见 2026-09-05 决策）
4. **不做管理后台** — 无 dashboard、无统计页、无内容审核界面
5. **不做 WhatsApp / Telegram bot 集成** — Business API 审核周期以天计，19 小时内不可能通过
6. **不做 OCR / 截图输入 / Web Share Target** — iOS Safari 支持不可靠，OCR 是新增崩点。demo 全程走「粘贴文本」路径，并在 slide 的 Known Limitations 一页主动认领
7. **不做 72 条人工标注 + ordinal logit 回归** — ⚠️ **从必做移出**。理由：72 条 × 4 维 = 288 次判断，实测每次 60–90 秒，真实工时 4–7 小时，远超原估 3 小时；且 N=72 配 4 个高度共线的预测变量（Actionability 与 Irreversibility 天然强相关），系数极可能不稳定甚至符号翻转，凌晨手动改回权重等于让 OLS 沦为道具。**替代方案**：权重改为 expert-elicited，在 15 条 pilot claim 上做敏感性分析，slide 上诚实标注为 *"expert-elicited weights, sensitivity-tested on N=15 pilot set"*，不声称是估计结果
8. **不做 live web RAG / 实时全网检索** — 只用 pre-indexed 本地 corpus，延迟可控、结果可复现
9. **不做 SIR 扩散模拟、反驳卡分享、KKM 优先级队列 dashboard** — 全部压缩为 pitch 最后一页的 roadmap 文字，零行代码

---

## 确定性内核是什么

**位置**：`lib/core/scoring.ts`

**两层确定性系统，LLM 不参与任何判定**：

### 第一层 — `resolveVerdict()`：规则决策表（Rule-Based Decision Table）

不是模型，是一张穷举的查表。优先级从上到下，命中即返回：

| 条件 | 输出 verdict | 置信度 |
|---|---|---|
| `substance` 或 `product_name` 命中 NPRA 撤销注册黑名单 | `PALSU` (False) | 1.00（hard override） |
| corpus 强匹配且官方来源支持该 claim | `BENAR` (True) | 匹配分 |
| corpus 强匹配但 claim 剥离了剂量/人群/条件限定 | `MENGELIRUKAN` (Misleading) | 匹配分 |
| corpus 无匹配 | `BELUM DISAHKAN` (Unverified) | 0 |

### 第二层 — `computeHRI()`：加权线性评分卡（Weighted Additive Scorecard）

与 verdict **正交**。verdict 回答「这话对不对」，HRI 回答「照做会不会出事」。二者相乘才是真正的分诊信号：`BELUM DISAHKAN × HRI 82` = 🔴 红色警报（查不到出处，但它要你停药）。

```
HRI = 100 × (4·Irr + 3·Act + 3·EvGap + 2·Vuln) / 120
```

**为什么这里不该用 LLM**：黑名单命中是精确检索问题，误报一个合法产品是法律风险；HRI 必须可分解、可审计、可复现，评委问「为什么是 78.4 不是 62」时要能指着单项权重回答。LLM 给不出稳定的边际贡献。

---

## 评分因子

> 「越小越好」列的语义：该因子原始取值越低，**对用户越安全**。

| # | 因子名 | 权重 | 取值范围 | 越小越好 |
|---|---|:---:|---|:---:|
| 1 | **Irreversibility 不可逆性**<br><sub>是否涉及停用处方药、替代正规治疗、延误就医</sub> | **4** | 0–10 | ✅ 是 |
| 2 | **Actionability 行动性**<br><sub>消息是否要求用户立即执行一个具体动作（服用/停用/剂量）</sub> | **3** | 0–10 | ✅ 是 |
| 3 | **Evidence Gap 证据缺口**<br><sub>corpus 匹配强度的补数：匹配越弱，缺口越大</sub> | **3** | 0–10 | ✅ 是 |
| 4 | **Population Vulnerability 人群脆弱性**<br><sub>指向孕妇 / 长者 / 慢性病患者 / 儿童的程度</sub> | **2** | 0–10 | ✅ 是 |
| 5 | **Blacklist Hit 黑名单命中**<br><sub>非加权项，命中即 hard override</sub> | **override** | 0 或 1 | ✅ 是 |

**归一化**：加权和最大值 = (4+3+3+2) × 10 = 120，映射到 0–100。

**四态与 HRI 的组合展示规则**（写在 UI 层，不在 scoring.ts）：

- `PALSU` 或 `MENGELIRUKAN` + HRI ≥ 60 → 红屏 + 「立即停止」
- `BELUM DISAHKAN` + HRI ≥ 60 → 橙屏 + 「查无出处，但风险高，先别做」← **这是本方案对题目 Unverified 状态的核心回答**
- `BELUM DISAHKAN` + HRI < 30 → 灰屏 + 「无法核实，风险低，可忽略」
- `BENAR` → 绿屏 + 来源

---

## 附：09:50 后的时间盒

| 时段 | 内容 |
|---|---|
| 09:50–17:50 | 必做 1–4（8.0h，严格按顺序，不并行） |
| 17:50–18:20 | **硬检查点**：10 条测试 claim 全部返回合法 JSON 且 HRI 连续 10 次调用一致。不通过则砍必做 #4 的对比屏，改用录屏 |
| 18:20–23:20 | 阈值调优 + 对抗样例挑选 + 敏感性分析（15 条 pilot） |
| 次日 00:00–05:00 | Slides 7 页 + Known Limitations 页 |
| 05:00–07:00 | 排练 ×3，卡死 6:30 |

**对抗样例的诚实门槛**：若试遍所有候选后发现通用 LLM 其实都答对了，**不许硬编不公平对比**。改讲护城河叙事——「这份名单是官方的、封闭的、可精确匹配的，AI 猜得对是运气，我们查得到是保证」。
