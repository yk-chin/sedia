/** 英文是基准语言：其余语言的键结构以它为准，漏键编译不过。 */
export const en = {
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
    cancelled: "A Malaysian regulator has banned or cancelled this product.",
    product: "Product",
    substance: "Substance detected",
    notifNo: "Notification no.",
    holder: "Notification holder",
    verify: "Verify this yourself",
    datasetLink: "Official dataset",
    npraLink: "Regulator’s notice page",
    sourceNote:
      "Matched deterministically against the message — no AI involved in this lookup.",
    noMatchLead: "No match in the official lists checked",
    noMatchWarn: "Not finding a product here does not mean it is safe",
    noMatchTail: "— these lists cover named products, not every claim.",
    viewDataset: "View the dataset",
    foundReference: "Listed by a foreign regulator",
    cancelledReference: "The US FDA has flagged this product.",
    notMalaysianRuling:
      "This is a US FDA action. It is not a ruling by a Malaysian regulator, but the same products circulate here.",
    perItemLink: "FDA notice for this product",
    listPage: "Full official list",
    checkedLists: "Lists checked",
    records: "records, retrieved",
  },
  substances: {
    bannedTitle: "Substances named in official records",
    bannedLead:
      "This message names a substance that regulators have found illegally added to health and beauty products.",
    cited: "official records name it:",
    bannedSource:
      "Taken from the substance column of the official lists themselves — every entry links back to the records that named it. No AI involved.",
    medicineTitle: "Real medicines mentioned",
    medicineLead:
      "These are recognised medicines. Naming one is not a problem in itself — but treat any message telling you to stop, replace or double one with real caution.",
    medicineSource:
      "Identified using the Drugs@FDA approved product listing. That listing says a name is a real medicine; it says nothing about whether this message is true.",
  },
  compare: {
    open: "Why not just ask an AI?",
    openHint:
      "We asked a general chatbot the same message. See what came back.",
    title: "Same message. Both say “don’t do it.”",
    lede: "Only one of them can show you why — and give you the same answer twice.",
    chatbot: "A general AI chatbot",
    captured: "captured",
    asking: "Asking a general chatbot the same message…",
    askedNow: "asked just now",
    askFailed: "Could not reach the chatbot just now.",
    askRetry: "Ask again",
    offlineNote:
      "Live call unavailable, so this is a previously captured answer to a different message — not a reply to yours.",
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
    back: "All checks",
    delete: "Delete this check",
    recheck: "Check this again",
    checkedOn: "Checked",
    offlineItem:
      "Checked without a connection, so no Harm Risk Index was computed for this one.",
    recomputed:
      "The official records and substances shown here were looked up again just now, on this device, from the saved message.",
    notFound: "That check is no longer saved on this device.",
    noMessage:
      "An older version saved only a summary of this check, so it cannot be reopened in full.",
  },
  settings: {
    title: "Settings",
    language: "Language",
    languageHint: "Applies to the interface and the explanation you receive.",
    data: "Data source",
    dataHint:
      "Product checks run against NPRA’s cancelled cosmetic notifications, published on data.gov.my under CC BY 4.0.",
    scope: "What this covers — and what it does not",
    scopeHint:
      "Sihat checks health and beauty products that regulators have acted on, and the wording of health claims. It does not cover controlled narcotics. A US FDA listing is evidence worth reading, but it is not a ruling by a Malaysian regulator.",
    privacy: "Privacy",
    privacyHint:
      "No account, no server-side storage. Your language choice and history stay in this browser.",
    about: "About",
    dataSaver: "Data saver",
    dataSaverHint:
      "Skip the AI entirely. Checks the official registry on your device — instant, and uses no mobile data.",
    dataSaverOn: "On",
    dataSaverOff: "Off",
    textSize: "Text size",
    textSizeHint: "Larger text throughout the app.",
    sizeNormal: "Normal",
    sizeLarge: "Large",
    sizeLarger: "Largest",
  },
  offline: {
    badge: "Offline",
    title: "Checked on your device",
    leadOffline:
      "No connection right now. These checks ran entirely on your phone — no data used.",
    leadSaver:
      "Data saver is on. Checked without contacting the AI — no data used beyond loading the page.",
    flagsTitle: "Warning signs in this message",
    noFlags: "No obvious warning signs in the wording.",
    notAScore:
      "These are keyword warnings, not the Harm Risk Index. Connect to get the full weighted analysis and a written explanation.",
    retryOnline: "Try full analysis",
  },
  flagLabels: {
    stopMedication: "Tells you to stop a prescribed medicine",
    replaceTreatment: "Suggests replacing proper treatment",
    urgency: "Pushes you to act immediately",
    vulnerable: "Aimed at elderly or people with a chronic condition",
    miracleClaim: "Makes an absolute claim (100%, no side effects)",
    hearsay: "Passed on as hearsay, with no source",
  },
  share: {
    button: "Share this result",
    copied: "Copied to clipboard",
    checkedWith: "Checked with Sihat",
  },
  chooser: {
    title: "Choose your language",
    subtitle: "You can change this later in Settings.",
    continue: "Continue",
  },
} as const;
