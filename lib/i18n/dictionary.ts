/* ============================================================
   三语言字典。English / Bahasa Melayu / 简体中文
   结构以 en 为准，另外两个语言必须实现同样的键 —— 靠 TypeScript 卡死，
   漏一个键就编译不过，不会出现「某个语言下界面露出英文」这种事。
   ============================================================ */

export const LANGUAGES = {
  en: { label: "English", native: "English" },
  ms: { label: "Malay", native: "Bahasa Melayu" },
  zh: { label: "Chinese", native: "简体中文" },
} as const;

export type Lang = keyof typeof LANGUAGES;
export const LANG_CODES = Object.keys(LANGUAGES) as Lang[];

const en = {
  nav: { analyse: "Check", history: "History", settings: "Settings" },
  app: {
    descriptor: "Health message risk check",
    tagline: "Check a forwarded health message against official records.",
  },
  hero: {
    title: "Should you actually do what that message says?",
    lede: "Paste a forwarded health message. In seconds, see how risky it would be to follow — with the score computed by a deterministic model, not guessed by an AI.",
  },
  input: {
    label: "Paste the message you received",
    placeholder:
      "e.g. blood pressure pills damage your kidneys, switch to bitter gourd juice…",
    hintPress: "Press",
    hintAnalyse: "to check",
    analyse: "Check message",
    analysing: "Checking…",
    orTry: "Or try:",
    example: "Example",
  },
  states: {
    emptyTitle: "No result yet",
    emptyHint:
      "Paste a message above, or tap one of the examples to see how the score is built.",
    loading: "Checking",
    errorTitle: "Something went wrong",
    retry: "Try again",
    degraded:
      "Using offline sample data — the AI service is temporarily unavailable. The deterministic scoring logic is unaffected.",
  },
  result: {
    hri: "Harm Risk Index",
    bandLow: "Low Risk",
    bandMedium: "Medium Risk",
    bandHigh: "High Risk",
    breakdown: "Breakdown",
    notByAi: "Not by AI",
    deterministicNote:
      "Computed by a deterministic scoring model — the same input always returns the same score.",
    whatThisMeans: "What this means",
    recommendedActions: "Recommended actions",
  },
  factors: {
    irreversibility: "Irreversibility",
    actionability: "Actionability",
    evidence_gap: "Evidence Gap",
    population_vulnerability: "Population Vulnerability",
  },
  evidence: {
    found: "Official record found",
    cancelled: "This product’s notification was cancelled by NPRA.",
    product: "Product",
    substance: "Substance detected",
    notifNo: "Notification no.",
    holder: "Notification holder",
    verify: "Verify this yourself",
    datasetLink: "Official dataset on data.gov.my",
    npraLink: "NPRA cancellation notices & press releases",
    sourceNote:
      "Matched deterministically against the message — no AI involved in this lookup.",
    noMatchLead: "No match in NPRA’s cancelled cosmetic notifications",
    noMatchWarn: "Not finding a product here does not mean it is safe",
    noMatchTail: "— the registry currently covers cosmetics only.",
    viewDataset: "View the dataset",
    records: "records, retrieved",
  },
  compare: {
    open: "Why not just ask an AI?",
    openHint:
      "We asked a general chatbot the same message. See what came back.",
    title: "Same message. Both say “don’t do it.”",
    lede: "Only one of them can show you why — and give you the same answer twice.",
    chatbot: "A general AI chatbot",
    captured: "captured",
    live: "this analysis, live",
    riskScore: "Risk score",
    auditable: "Auditable factors",
    twice: "Same answer twice?",
    length: "Length",
    none: "none",
    notGuaranteed: "not guaranteed",
    identical: "always identical",
    fourWeighted: "4, each weighted",
    largestDriver: "Largest driver",
    chatbotNote:
      "Verbatim, asked with no system prompt. It is correct — that is the point.",
    sihatNote: "The AI never touches the number.",
    punchline: "“Bukan AI yang cakap. Data KKM yang cakap.”",
    punchlineGloss: "— it is not the AI talking, it is the data talking.",
    characters: "characters",
  },
  history: {
    title: "History",
    subtitle: "Saved on this device only. Nothing is uploaded.",
    empty: "Nothing checked yet.",
    emptyHint: "Messages you check will appear here.",
    clear: "Clear history",
    flagged: "Official record",
    open: "Open",
  },
  settings: {
    title: "Settings",
    language: "Language",
    languageHint: "Applies to the interface and the explanation you receive.",
    data: "Data source",
    dataHint:
      "Product checks run against NPRA’s cancelled cosmetic notifications, published on data.gov.my under CC BY 4.0.",
    privacy: "Privacy",
    privacyHint:
      "No account, no server-side storage. Your language choice and history stay in this browser.",
    about: "About",
  },
  chooser: {
    title: "Choose your language",
    subtitle: "You can change this later in Settings.",
    continue: "Continue",
  },
} as const;

/** 把字面量类型放宽成 string，但保留键的结构 ——
    这样别的语言可以写自己的文案，漏掉任何一个键仍然编译不过 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
type Dict = Widen<typeof en>;

const ms: Dict = {
  nav: { analyse: "Semak", history: "Sejarah", settings: "Tetapan" },
  app: {
    descriptor: "Semakan risiko mesej kesihatan",
    tagline: "Semak mesej kesihatan yang diforward dengan rekod rasmi.",
  },
  hero: {
    title: "Patutkah anda benar-benar ikut mesej itu?",
    lede: "Tampal mesej kesihatan yang anda terima. Dalam beberapa saat, lihat betapa berisikonya jika diikut — skor dikira oleh model deterministik, bukan diteka oleh AI.",
  },
  input: {
    label: "Tampal mesej yang anda terima",
    placeholder:
      "cth. ubat darah tinggi rosakkan buah pinggang, tukar minum jus peria…",
    hintPress: "Tekan",
    hintAnalyse: "untuk semak",
    analyse: "Semak mesej",
    analysing: "Menyemak…",
    orTry: "Atau cuba:",
    example: "Contoh",
  },
  states: {
    emptyTitle: "Belum ada keputusan",
    emptyHint:
      "Tampal mesej di atas, atau tekan salah satu contoh untuk melihat cara skor dibina.",
    loading: "Menyemak",
    errorTitle: "Ada masalah",
    retry: "Cuba lagi",
    degraded:
      "Menggunakan data contoh luar talian — perkhidmatan AI tidak tersedia buat masa ini. Logik pemarkahan deterministik tidak terjejas.",
  },
  result: {
    hri: "Indeks Risiko Bahaya",
    bandLow: "Risiko Rendah",
    bandMedium: "Risiko Sederhana",
    bandHigh: "Risiko Tinggi",
    breakdown: "Pecahan",
    notByAi: "Bukan AI",
    deterministicNote:
      "Dikira oleh model pemarkahan deterministik — input yang sama sentiasa memberi skor yang sama.",
    whatThisMeans: "Apa maksudnya",
    recommendedActions: "Tindakan disyorkan",
  },
  factors: {
    irreversibility: "Ketakbalikan",
    actionability: "Kebolehtindakan",
    evidence_gap: "Jurang Bukti",
    population_vulnerability: "Kerentanan Populasi",
  },
  evidence: {
    found: "Rekod rasmi dijumpai",
    cancelled: "Notifikasi produk ini telah dibatalkan oleh NPRA.",
    product: "Produk",
    substance: "Bahan dikesan",
    notifNo: "No. notifikasi",
    holder: "Pemegang notifikasi",
    verify: "Sahkan sendiri",
    datasetLink: "Set data rasmi di data.gov.my",
    npraLink: "Notis pembatalan & kenyataan media NPRA",
    sourceNote:
      "Dipadankan secara deterministik dengan mesej — tiada AI terlibat dalam carian ini.",
    noMatchLead: "Tiada padanan dalam senarai notifikasi kosmetik dibatalkan NPRA",
    noMatchWarn: "Tidak dijumpai di sini tidak bermakna ia selamat",
    noMatchTail: "— daftar ini merangkumi kosmetik sahaja buat masa ini.",
    viewDataset: "Lihat set data",
    records: "rekod, diambil",
  },
  compare: {
    open: "Kenapa tidak tanya AI sahaja?",
    openHint:
      "Kami tanya chatbot umum dengan mesej yang sama. Lihat jawapannya.",
    title: "Mesej sama. Kedua-duanya kata “jangan buat.”",
    lede: "Hanya satu daripadanya boleh tunjukkan sebabnya — dan beri jawapan yang sama dua kali.",
    chatbot: "Chatbot AI umum",
    captured: "dirakam",
    live: "analisis ini, langsung",
    riskScore: "Skor risiko",
    auditable: "Faktor boleh audit",
    twice: "Jawapan sama dua kali?",
    length: "Panjang",
    none: "tiada",
    notGuaranteed: "tidak dijamin",
    identical: "sentiasa sama",
    fourWeighted: "4, setiap satu berwajaran",
    largestDriver: "Penyumbang terbesar",
    chatbotNote:
      "Kata demi kata, ditanya tanpa system prompt. Ia betul — itulah maksudnya.",
    sihatNote: "AI tidak pernah menyentuh nombor itu.",
    punchline: "“Bukan AI yang cakap. Data KKM yang cakap.”",
    punchlineGloss: "— bukan AI yang bercakap, data yang bercakap.",
    characters: "aksara",
  },
  history: {
    title: "Sejarah",
    subtitle: "Disimpan pada peranti ini sahaja. Tiada apa dimuat naik.",
    empty: "Belum ada semakan.",
    emptyHint: "Mesej yang anda semak akan muncul di sini.",
    clear: "Kosongkan sejarah",
    flagged: "Rekod rasmi",
    open: "Buka",
  },
  settings: {
    title: "Tetapan",
    language: "Bahasa",
    languageHint: "Digunakan untuk antara muka dan penjelasan yang anda terima.",
    data: "Sumber data",
    dataHint:
      "Semakan produk dibuat terhadap senarai notifikasi kosmetik dibatalkan NPRA, diterbitkan di data.gov.my di bawah CC BY 4.0.",
    privacy: "Privasi",
    privacyHint:
      "Tiada akaun, tiada simpanan di pelayan. Pilihan bahasa dan sejarah anda kekal dalam pelayar ini.",
    about: "Mengenai",
  },
  chooser: {
    title: "Pilih bahasa anda",
    subtitle: "Anda boleh tukar kemudian dalam Tetapan.",
    continue: "Teruskan",
  },
};

const zh: Dict = {
  nav: { analyse: "查验", history: "历史", settings: "设置" },
  app: {
    descriptor: "健康消息风险查验",
    tagline: "把转发的健康消息拿去比对官方记录。",
  },
  hero: {
    title: "那条消息叫你做的事，真的该做吗？",
    lede: "把收到的转发消息贴进来。几秒钟之内看清照做的风险有多高——分数由确定性模型算出，不是 AI 猜的。",
  },
  input: {
    label: "贴上你收到的消息",
    placeholder: "例如：降压药伤肾，改喝苦瓜汁…",
    hintPress: "按",
    hintAnalyse: "开始查验",
    analyse: "查验消息",
    analysing: "查验中…",
    orTry: "或试试：",
    example: "示例",
  },
  states: {
    emptyTitle: "还没有结果",
    emptyHint: "在上面贴一条消息，或点一个示例，看看分数是怎么算出来的。",
    loading: "查验中",
    errorTitle: "出了点问题",
    retry: "重试",
    degraded:
      "正在使用离线示例数据——AI 服务暂时不可用。确定性评分逻辑不受影响。",
  },
  result: {
    hri: "危害风险指数",
    bandLow: "低风险",
    bandMedium: "中风险",
    bandHigh: "高风险",
    breakdown: "分数构成",
    notByAi: "不经过 AI",
    deterministicNote:
      "由确定性评分模型算出——同样的输入永远得到同样的分数。",
    whatThisMeans: "这意味着什么",
    recommendedActions: "建议行动",
  },
  factors: {
    irreversibility: "不可逆性",
    actionability: "行动性",
    evidence_gap: "证据缺口",
    population_vulnerability: "人群脆弱性",
  },
  evidence: {
    found: "查到官方记录",
    cancelled: "该产品的通知已被 NPRA 撤销。",
    product: "产品",
    substance: "检出成分",
    notifNo: "通知编号",
    holder: "通知持有人",
    verify: "你可以自己核实",
    datasetLink: "data.gov.my 上的官方数据集",
    npraLink: "NPRA 撤销公告与新闻稿",
    sourceNote: "与消息做确定性比对得出——这一步查询完全不经过 AI。",
    noMatchLead: "在 NPRA 已撤销化妆品通知名单中没有找到匹配",
    noMatchWarn: "没查到不等于安全",
    noMatchTail: "——这份名单目前只覆盖化妆品。",
    viewDataset: "查看数据集",
    records: "条记录，抓取于",
  },
  compare: {
    open: "为什么不直接问 AI？",
    openHint: "我们把同一条消息拿去问了通用聊天机器人。看看它答了什么。",
    title: "同一条消息。两边都说「别做」。",
    lede: "但只有一边能告诉你为什么——并且第二次问还给你同样的答案。",
    chatbot: "通用 AI 聊天机器人",
    captured: "捕获于",
    live: "本次分析，实时",
    riskScore: "风险分数",
    auditable: "可审计因子",
    twice: "问两次答案一样吗？",
    length: "长度",
    none: "没有",
    notGuaranteed: "不保证",
    identical: "永远一致",
    fourWeighted: "4 个，各自加权",
    largestDriver: "最大贡献因子",
    chatbotNote: "逐字原文，没有给任何 system prompt。它答对了——这正是重点。",
    sihatNote: "AI 从头到尾没碰过这个数字。",
    punchline: "「Bukan AI yang cakap. Data KKM yang cakap.」",
    punchlineGloss: "——不是 AI 在说，是数据在说。",
    characters: "个字符",
  },
  history: {
    title: "历史",
    subtitle: "只存在这台设备上，不会上传。",
    empty: "还没有查验记录。",
    emptyHint: "你查验过的消息会出现在这里。",
    clear: "清空历史",
    flagged: "官方记录",
    open: "打开",
  },
  settings: {
    title: "设置",
    language: "语言",
    languageHint: "同时作用于界面和你收到的解释文字。",
    data: "数据来源",
    dataHint:
      "产品查验比对的是 NPRA 已撤销化妆品通知名单，发布于 data.gov.my，授权协议 CC BY 4.0。",
    privacy: "隐私",
    privacyHint:
      "无账号，服务器不存任何东西。语言偏好和历史记录都留在这个浏览器里。",
    about: "关于",
  },
  chooser: {
    title: "选择你的语言",
    subtitle: "之后可以在「设置」里随时更改。",
    continue: "继续",
  },
};

export const DICT: Record<Lang, Dict> = { en, ms, zh };
export type { Dict };
