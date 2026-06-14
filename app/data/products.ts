// ─── Digital products catalog (book shelf) ───────────────────────────────────
// Islamic legacy books + worship trackers/printables. Each product carries a
// `printable` spec so its real, usable PDF-style page can be generated.

export type ProductType = "Book" | "Tracker" | "Calendar" | "Checklist" | "Log";
export type ProductCategory = "Islamic Legacy" | "Worship Trackers";
export type PatternKind = "geometric" | "arabesque" | "stars" | "calligraphy";

export interface Printable {
  kind: "grid" | "checklist" | "calendar" | "log" | "book";
  // grid: rows down the side, cols across the top, with a checkbox per cell
  rows?: string[];
  cols?: string[];
  // checklist: ordered items
  items?: string[];
  // log: column headers + how many blank rows
  columns?: string[];
  rowCount?: number;
  // book: chapter / table-of-contents list
  chapters?: string[];
  note?: string;
}

export interface DigitalProduct {
  id: number;
  slug: string;
  title: string;
  arabicTitle?: string;
  subtitle: string;
  category: ProductCategory;
  type: ProductType;
  price: string;        // "Free" or "$4"
  oldPrice?: string;
  pages: number;
  format: string;       // "PDF"
  gradient: string;     // tailwind gradient classes for the cover
  accent: string;       // hex accent
  pattern: PatternKind;
  description: string;
  features: string[];
  featured?: boolean;
  printable: Printable;
}

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export const products: DigitalProduct[] = [
  // ── Islamic Legacy ──────────────────────────────────────────────────────────
  {
    id: 1,
    slug: "lives-of-the-sahaba",
    title: "Lives of the Sahaba",
    arabicTitle: "حياة الصحابة",
    subtitle: "The Companions who carried the message",
    category: "Islamic Legacy",
    type: "Book",
    price: "Free",
    pages: 14,
    format: "PDF",
    gradient: "from-emerald-900 via-green-900 to-teal-950",
    accent: "#57d996",
    pattern: "arabesque",
    featured: true,
    description:
      "Concise, inspiring biographies of twelve Companions of the Prophet ﷺ — their faith, sacrifice, and the legacy they left for every generation after them.",
    features: [
      "12 companion biographies",
      "From Abu Bakr to Sa'd ibn Abi Waqqas",
      "Faith, sacrifice & lessons in each life",
      "Print-ready, beautifully typeset",
    ],
    printable: {
      kind: "book",
      note: "A reading companion — table of contents below.",
      chapters: [
        "Abu Bakr as-Siddiq", "Umar ibn al-Khattab", "Uthman ibn Affan",
        "Ali ibn Abi Talib", "Khadijah bint Khuwaylid", "Bilal ibn Rabah",
        "Salman al-Farsi", "Mus'ab ibn Umayr", "Khalid ibn al-Walid",
        "Aisha bint Abi Bakr", "Abu Hurairah", "Sa'd ibn Abi Waqqas",
      ],
    },
  },
  {
    id: 2,
    slug: "the-rightly-guided-caliphs",
    title: "The Rightly-Guided Caliphs",
    arabicTitle: "الخلفاء الراشدون",
    subtitle: "The four who led after the Prophet ﷺ",
    category: "Islamic Legacy",
    type: "Book",
    price: "Free",
    pages: 8,
    format: "PDF",
    gradient: "from-amber-900 via-yellow-900 to-stone-950",
    accent: "#f7ca45",
    pattern: "geometric",
    featured: true,
    description:
      "The leadership, justice, and trials of the Khulafa ar-Rashidun — Abu Bakr, Umar, Uthman, and Ali — and what their example teaches us today.",
    features: [
      "A full chapter on each of the four Caliphs",
      "The compilation of the Quran explained",
      "Lessons in leadership for today",
      "Print-ready booklet",
    ],
    printable: {
      kind: "book",
      note: "A reading companion — table of contents below.",
      chapters: [
        "Abu Bakr as-Siddiq — The Trustworthy",
        "Umar ibn al-Khattab — The Just",
        "Uthman ibn Affan — The Generous",
        "Ali ibn Abi Talib — The Knowledgeable",
        "The Compilation of the Quran",
        "Lessons in Leadership",
      ],
    },
  },
  {
    id: 3,
    slug: "stories-of-the-prophets",
    title: "Stories of the Prophets",
    arabicTitle: "قصص الأنبياء",
    subtitle: "From Adam to Muhammad ﷺ",
    category: "Islamic Legacy",
    type: "Book",
    price: "Free",
    pages: 11,
    format: "PDF",
    gradient: "from-sky-900 via-blue-900 to-indigo-950",
    accent: "#18c8d8",
    pattern: "stars",
    description:
      "The timeless stories of nine major Prophets, retold with clarity and rooted in the Quran — from Adam to Muhammad ﷺ, for readers of every age.",
    features: [
      "9 major prophet narratives",
      "From Adam to Muhammad ﷺ",
      "Morals & lessons highlighted",
      "Family-friendly language",
    ],
    printable: {
      kind: "book",
      note: "A reading companion — table of contents below.",
      chapters: [
        "Adam", "Nuh", "Ibrahim", "Yusuf", "Musa", "Dawud & Sulayman",
        "Yunus", "Isa", "Muhammad ﷺ",
      ],
    },
  },
  {
    id: 4,
    slug: "foundations-of-islam",
    title: "Foundations of Islam",
    arabicTitle: "أركان الإسلام",
    subtitle: "A beginner's guide to the deen",
    category: "Islamic Legacy",
    type: "Book",
    price: "Free",
    pages: 8,
    format: "PDF",
    gradient: "from-violet-900 via-purple-900 to-slate-950",
    accent: "#a78bfa",
    pattern: "calligraphy",
    description:
      "A clear, gentle introduction to the pillars of Islam and Iman — perfect for new Muslims, young learners, and anyone returning to the basics.",
    features: [
      "The 5 pillars explained simply",
      "The 6 articles of faith",
      "Plain-language and beginner-friendly",
      "Print-ready booklet",
    ],
    printable: {
      kind: "book",
      note: "A learning companion — table of contents below.",
      chapters: [
        "Shahada — The Testimony", "Salah — The Prayer", "Zakat — The Charity",
        "Sawm — The Fast", "Hajj — The Pilgrimage", "The Articles of Faith",
      ],
    },
  },

  // ── Worship Trackers ─────────────────────────────────────────────────────────
  {
    id: 5,
    slug: "daily-salah-tracker",
    title: "Daily Salah Tracker",
    subtitle: "Never miss a prayer",
    category: "Worship Trackers",
    type: "Tracker",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-teal-800 via-emerald-900 to-green-950",
    accent: "#34d399",
    pattern: "geometric",
    featured: true,
    description:
      "A clean one-page tracker for the five daily prayers plus sunnah and witr — tick each prayer as you complete it on time, in congregation.",
    features: ["5 daily prayers + Sunnah & Witr", "On-time / Jama'ah columns", "Daily notes line", "Print as many as you need"],
    printable: {
      kind: "grid",
      rows: [...PRAYERS, "Sunnah", "Witr"],
      cols: ["On time", "In Jama'ah", "Qada", "Notes"],
    },
  },
  {
    id: 6,
    slug: "weekly-salah-tracker",
    title: "Weekly Salah Tracker",
    subtitle: "A week at a glance",
    category: "Worship Trackers",
    type: "Tracker",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-emerald-800 via-teal-900 to-cyan-950",
    accent: "#2dd4bf",
    pattern: "geometric",
    description: "Track all five prayers across the whole week on a single sheet — a simple grid that builds consistency.",
    features: ["7 days × 5 prayers grid", "Weekly reflection box", "Goal for the week", "Minimalist, ink-friendly"],
    printable: {
      kind: "grid",
      rows: PRAYERS,
      cols: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  },
  {
    id: 7,
    slug: "monthly-salah-calendar",
    title: "Monthly Salah Calendar",
    subtitle: "Build a 30-day habit",
    category: "Worship Trackers",
    type: "Calendar",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-indigo-800 via-blue-900 to-slate-950",
    accent: "#60a5fa",
    pattern: "stars",
    description: "A full-month grid — 31 days down the side, five prayers across — to see your consistency at a glance and keep your streak alive.",
    features: ["31 days × 5 prayers", "Streak-friendly layout", "Month & year header", "One page, full month"],
    printable: {
      kind: "calendar",
      cols: PRAYERS,
    },
  },
  {
    id: 8,
    slug: "wudu-checklist",
    title: "Wudu Checklist",
    subtitle: "Perfect your ablution",
    category: "Worship Trackers",
    type: "Checklist",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-cyan-800 via-sky-900 to-blue-950",
    accent: "#22d3ee",
    pattern: "arabesque",
    description: "The complete steps of wudu in order, with the fard and sunnah acts clearly marked — ideal for new Muslims and teaching children.",
    features: ["Step-by-step order", "Fard vs Sunnah marked", "Du'a after wudu", "Wall-poster friendly"],
    printable: {
      kind: "checklist",
      items: [
        "Make the intention (niyyah)", "Say Bismillah", "Wash both hands to the wrists ×3",
        "Rinse the mouth ×3", "Rinse the nose ×3", "Wash the face ×3",
        "Wash right then left arm to the elbow ×3", "Wipe the head (masah) once",
        "Wipe the ears once", "Wash right then left foot to the ankle ×3",
        "Recite the du'a after wudu",
      ],
      note: "Items in italics are Sunnah; the rest are obligatory (fard).",
    },
  },
  {
    id: 9,
    slug: "prayer-reward-chart",
    title: "Prayer Reward Chart",
    subtitle: "For young worshippers",
    category: "Worship Trackers",
    type: "Tracker",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-orange-800 via-amber-900 to-yellow-950",
    accent: "#fb923c",
    pattern: "stars",
    description: "A colourful star-reward chart that motivates children to pray — earn a star for every prayer and celebrate the full week.",
    features: ["Star per prayer", "Weekly reward goal", "Kid-friendly design", "Encouragement notes"],
    printable: {
      kind: "grid",
      rows: PRAYERS,
      cols: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
      note: "Colour in a star ★ for every prayer completed.",
    },
  },
  {
    id: 10,
    slug: "masjid-visit-tracker",
    title: "Masjid Visit Tracker",
    subtitle: "Love for the houses of Allah",
    category: "Worship Trackers",
    type: "Tracker",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-green-800 via-emerald-900 to-teal-950",
    accent: "#4ade80",
    pattern: "geometric",
    description: "Track every visit to the masjid for congregational prayer over a month — a gentle nudge to make the masjid part of your routine.",
    features: ["30-day visit grid", "Which prayer in Jama'ah", "Monthly total", "Reflection space"],
    printable: {
      kind: "log",
      columns: ["Date", "Prayer", "Masjid", "On time?", "Notes"],
      rowCount: 20,
    },
  },
  {
    id: 11,
    slug: "quran-reading-log",
    title: "Quran Reading Log",
    subtitle: "Track your tilawah",
    category: "Worship Trackers",
    type: "Log",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-emerald-900 via-green-950 to-black",
    accent: "#57d996",
    pattern: "arabesque",
    featured: true,
    description: "Log your daily Quran reading — surah, ayahs, pages, and a line for reflection — and watch your connection with the Book grow.",
    features: ["Date • Surah • Ayahs • Pages", "Reflection line per entry", "Running page total", "Works for hifz & tilawah"],
    printable: {
      kind: "log",
      columns: ["Date", "Surah", "From–To", "Pages", "Reflection"],
      rowCount: 18,
    },
  },
  {
    id: 12,
    slug: "dua-memorization-tracker",
    title: "Du'a Memorization Tracker",
    subtitle: "Daily supplications by heart",
    category: "Worship Trackers",
    type: "Tracker",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-rose-800 via-pink-900 to-fuchsia-950",
    accent: "#fb7185",
    pattern: "calligraphy",
    description: "A tracker for the essential daily du'as — mark each as learning, memorized, or mastered, and keep them on your tongue.",
    features: ["Common daily du'as listed", "Learning → Memorized → Mastered", "Occasion column", "Add your own rows"],
    printable: {
      kind: "log",
      columns: ["Du'a", "Occasion", "Learning", "Memorized", "Mastered"],
      rowCount: 16,
    },
  },
  {
    id: 13,
    slug: "dhikr-tracker",
    title: "Dhikr Tracker",
    subtitle: "Keep your tongue moist",
    category: "Worship Trackers",
    type: "Tracker",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-purple-800 via-violet-900 to-indigo-950",
    accent: "#c084fc",
    pattern: "arabesque",
    description: "Track the morning & evening adhkar and your daily dhikr counts — SubhanAllah, Alhamdulillah, Allahu Akbar, and more.",
    features: ["Morning & evening adhkar", "Daily count targets", "7-day grid", "Tasbih goal tracker"],
    printable: {
      kind: "grid",
      rows: [
        "SubhanAllah ×33", "Alhamdulillah ×33", "Allahu Akbar ×34",
        "La ilaha illa Allah", "Astaghfirullah ×100", "Salawat on the Prophet ﷺ",
        "Morning adhkar", "Evening adhkar",
      ],
      cols: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  },
  {
    id: 14,
    slug: "jumuah-preparation-checklist",
    title: "Jumu'ah Preparation Checklist",
    subtitle: "Make the most of Friday",
    category: "Worship Trackers",
    type: "Checklist",
    price: "Free",
    pages: 1,
    format: "PDF",
    gradient: "from-teal-800 via-cyan-900 to-sky-950",
    accent: "#2dd4bf",
    pattern: "geometric",
    description: "The Sunnah acts of Friday in a simple checklist — ghusl, best clothes, Surah Al-Kahf, early arrival, and abundant salawat.",
    features: ["The Sunnahs of Jumu'ah", "Surah Al-Kahf reminder", "Salawat & du'a goals", "Weekly habit builder"],
    printable: {
      kind: "checklist",
      items: [
        "Perform ghusl (full bath)", "Wear your best & cleanest clothes", "Apply perfume (for men)",
        "Trim nails and groom", "Read Surah Al-Kahf", "Send abundant salawat on the Prophet ﷺ",
        "Go early to the masjid", "Listen attentively to the khutbah", "Make du'a in the last hour of Friday",
      ],
    },
  },
];

export function getProduct(slug: string): DigitalProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export const productCategories: ("All" | ProductCategory)[] = [
  "All", "Islamic Legacy", "Worship Trackers",
];
