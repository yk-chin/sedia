import type { Dict } from "../types";

export const ms: Dict = {
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
