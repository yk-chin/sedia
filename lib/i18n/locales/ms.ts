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
    cancelled: "Pengawal selia Malaysia telah mengharamkan atau membatalkan produk ini.",
    product: "Produk",
    substance: "Bahan dikesan",
    notifNo: "No. notifikasi",
    holder: "Pemegang notifikasi",
    verify: "Sahkan sendiri",
    datasetLink: "Set data rasmi",
    npraLink: "Halaman notis pengawal selia",
    sourceNote:
      "Dipadankan secara deterministik dengan mesej — tiada AI terlibat dalam carian ini.",
    noMatchLead: "Tiada padanan dalam senarai rasmi yang disemak",
    noMatchWarn: "Tidak dijumpai di sini tidak bermakna ia selamat",
    noMatchTail: "— senarai ini merangkumi produk bernama, bukan setiap dakwaan.",
    viewDataset: "Lihat set data",
    foundReference: "Disenaraikan oleh pengawal selia asing",
    cancelledReference: "FDA Amerika Syarikat telah menandakan produk ini.",
    notMalaysianRuling:
      "Ini tindakan FDA Amerika Syarikat. Ia bukan keputusan pengawal selia Malaysia, tetapi produk yang sama beredar di sini.",
    perItemLink: "Notis FDA untuk produk ini",
    listPage: "Senarai rasmi penuh",
    checkedLists: "Senarai yang disemak",
    records: "rekod, diambil",
  },
  substances: {
    bannedTitle: "Bahan yang disebut dalam rekod rasmi",
    bannedLead:
      "Mesej ini menyebut bahan yang pernah dikesan pihak berkuasa dicampur secara haram ke dalam produk kesihatan dan kecantikan.",
    cited: "rekod rasmi menyebutnya:",
    bannedSource:
      "Diambil terus daripada lajur bahan dalam senarai rasmi itu sendiri — setiap entri berpaut kembali kepada rekod yang menyebutnya. Tiada AI terlibat.",
    medicineTitle: "Ubat sebenar yang disebut",
    medicineLead:
      "Ini ubat yang benar-benar wujud. Menyebutnya bukan masalah — tetapi berhati-hatilah dengan mana-mana mesej yang menyuruh anda berhenti, menggantikan atau menggandakan ubat.",
    medicineSource:
      "Dikenal pasti menggunakan senarai produk diluluskan Drugs@FDA. Senarai itu hanya mengesahkan nama ubat yang sebenar; ia tidak mengesahkan kandungan mesej ini.",
  },
  compare: {
    open: "Kenapa tidak tanya AI sahaja?",
    openHint:
      "Kami tanya chatbot umum dengan mesej yang sama. Lihat jawapannya.",
    title: "Mesej sama. Kedua-duanya kata “jangan buat.”",
    lede: "Hanya satu daripadanya boleh tunjukkan sebabnya — dan beri jawapan yang sama dua kali.",
    chatbot: "Chatbot AI umum",
    captured: "dirakam",
    asking: "Bertanya kepada chatbot umum dengan mesej yang sama…",
    askedNow: "baru ditanya",
    askFailed: "Tidak dapat menghubungi chatbot buat masa ini.",
    askRetry: "Tanya semula",
    offlineNote:
      "Panggilan langsung tidak tersedia, jadi ini jawapan yang dirakam sebelum ini untuk mesej lain — bukan jawapan kepada mesej anda.",
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
    back: "Semua semakan",
    delete: "Padam semakan ini",
    recheck: "Semak semula",
    checkedOn: "Disemak",
    offlineItem:
      "Semakan ini dibuat tanpa sambungan, jadi Indeks Risiko Bahaya tidak dikira.",
    recomputed:
      "Rekod rasmi dan bahan yang ditunjukkan di sini baru sahaja dicari semula pada peranti ini, daripada mesej yang disimpan.",
    notFound: "Semakan itu tiada lagi pada peranti ini.",
    noMessage:
      "Versi lama hanya menyimpan ringkasan semakan ini, jadi ia tidak dapat dibuka sepenuhnya.",
  },
  settings: {
    title: "Tetapan",
    language: "Bahasa",
    languageHint: "Digunakan untuk antara muka dan penjelasan yang anda terima.",
    data: "Sumber data",
    dataHint:
      "Semakan produk dibuat terhadap senarai notifikasi kosmetik dibatalkan NPRA, diterbitkan di data.gov.my di bawah CC BY 4.0.",
    scope: "Apa yang disemak — dan apa yang tidak",
    scopeHint:
      "Sihat menyemak produk kesihatan dan kecantikan yang telah diambil tindakan oleh pihak berkuasa, serta cara sesuatu dakwaan kesihatan ditulis. Ia tidak meliputi dadah terkawal. Penyenaraian FDA Amerika Syarikat ialah bukti yang berguna, tetapi ia bukan keputusan pihak berkuasa Malaysia.",
    privacy: "Privasi",
    privacyHint:
      "Tiada akaun, tiada simpanan di pelayan. Pilihan bahasa dan sejarah anda kekal dalam pelayar ini.",
    about: "Mengenai",
    dataSaver: "Penjimat data",
    dataSaverHint:
      "Langkau AI sepenuhnya. Menyemak daftar rasmi pada peranti anda — serta-merta, tanpa guna data mudah alih.",
    dataSaverOn: "Hidup",
    dataSaverOff: "Mati",
    textSize: "Saiz teks",
    textSizeHint: "Teks lebih besar di seluruh aplikasi.",
    sizeNormal: "Biasa",
    sizeLarge: "Besar",
    sizeLarger: "Paling besar",
  },
  offline: {
    badge: "Luar talian",
    title: "Disemak pada peranti anda",
    leadOffline:
      "Tiada sambungan sekarang. Semakan ini berjalan sepenuhnya pada telefon anda — tiada data digunakan.",
    leadSaver:
      "Penjimat data dihidupkan. Disemak tanpa menghubungi AI — tiada data digunakan selain memuatkan halaman.",
    flagsTitle: "Tanda amaran dalam mesej ini",
    noFlags: "Tiada tanda amaran yang jelas dalam ayatnya.",
    notAScore:
      "Ini amaran kata kunci, bukan Indeks Risiko Bahaya. Sambung ke internet untuk analisis berwajaran penuh dan penjelasan bertulis.",
    retryOnline: "Cuba analisis penuh",
  },
  flagLabels: {
    stopMedication: "Menyuruh anda berhenti makan ubat preskripsi",
    replaceTreatment: "Mencadangkan ganti rawatan yang betul",
    urgency: "Mendesak anda bertindak segera",
    vulnerable: "Menyasarkan warga emas atau pesakit kronik",
    miracleClaim: "Dakwaan mutlak (100%, tiada kesan sampingan)",
    hearsay: "Disampaikan sebagai kata orang, tanpa sumber",
  },
  share: {
    button: "Kongsi keputusan ini",
    copied: "Disalin ke papan klip",
    checkedWith: "Disemak dengan Sihat",
  },
  chooser: {
    title: "Pilih bahasa anda",
    subtitle: "Anda boleh tukar kemudian dalam Tetapan.",
    continue: "Teruskan",
  },
};
