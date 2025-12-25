export type SintaksKey =
  | "sintaks_1"
  | "sintaks_2"
  | "sintaks_3"
  | "sintaks_4"
  | "sintaks_5"
  | "sintaks_6"
  | "sintaks_7"
  | "sintaks_8"

export interface SintaksInfo {
  key: SintaksKey
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  order: number
  icon: string
}

export const SINTAKS_MAP: Record<SintaksKey, SintaksInfo> = {
  sintaks_1: {
    key: "sintaks_1",
    title: "Orientasi Masalah",
    titleEn: "Problem Orientation",
    description: "Tahap awal identifikasi dan analisis masalah proyek",
    descriptionEn: "Initial stage of problem identification and analysis",
    order: 1,
    icon: "🔍",
  },
  sintaks_2: {
    key: "sintaks_2",
    title: "Menyusun Rencana Proyek",
    titleEn: "Project Planning",
    description: "Perencanaan sistematis untuk menyelesaikan proyek",
    descriptionEn: "Systematic planning to complete the project",
    order: 2,
    icon: "📋",
  },
  sintaks_3: {
    key: "sintaks_3",
    title: "Membuat Jadwal Proyek",
    titleEn: "Project Scheduling",
    description: "Penjadwalan timeline dan milestone proyek",
    descriptionEn: "Scheduling project timeline and milestones",
    order: 3,
    icon: "📅",
  },
  sintaks_4: {
    key: "sintaks_4",
    title: "Monitoring Pelaksanaan",
    titleEn: "Implementation Monitoring",
    description: "Pemantauan progress dan pelaksanaan proyek",
    descriptionEn: "Monitoring project progress and implementation",
    order: 4,
    icon: "📊",
  },
  sintaks_5: {
    key: "sintaks_5",
    title: "Pengumpulan Proyek",
    titleEn: "Project Submission",
    description: "Finalisasi dan pengumpulan deliverables proyek",
    descriptionEn: "Finalization and submission of project deliverables",
    order: 5,
    icon: "📦",
  },
  sintaks_6: {
    key: "sintaks_6",
    title: "Presentasi Proyek",
    titleEn: "Project Presentation",
    description: "Presentasi hasil dan demo proyek",
    descriptionEn: "Project results presentation and demo",
    order: 6,
    icon: "🎤",
  },
  sintaks_7: {
    key: "sintaks_7",
    title: "Penilaian dan Evaluasi",
    titleEn: "Assessment & Evaluation",
    description: "Evaluasi hasil kerja dan feedback",
    descriptionEn: "Work evaluation and feedback",
    order: 7,
    icon: "⭐",
  },
  sintaks_8: {
    key: "sintaks_8",
    title: "Refleksi",
    titleEn: "Reflection",
    description: "Refleksi pembelajaran dan improvement",
    descriptionEn: "Learning reflection and improvement",
    order: 8,
    icon: "💭",
  },
}

export const SINTAKS_KEYS = Object.keys(SINTAKS_MAP) as SintaksKey[]

function normalizeSintaksKey(key: string): SintaksKey | null {
  // If already in correct format
  if (key in SINTAKS_MAP) {
    return key as SintaksKey
  }

  // Try adding underscore: "sintaks1" -> "sintaks_1"
  const withUnderscore = key.replace(/^(sintaks)(\d+)$/i, "$1_$2")
  if (withUnderscore in SINTAKS_MAP) {
    return withUnderscore as SintaksKey
  }

  return null
}

export function getSintaksInfo(key: string): SintaksInfo | null {
  const normalizedKey = normalizeSintaksKey(key)
  if (!normalizedKey) return null
  return SINTAKS_MAP[normalizedKey] || null
}

export function getNextSintaks(currentKey: SintaksKey): SintaksKey | null {
  const currentOrder = SINTAKS_MAP[currentKey]?.order || 0
  const nextEntry = Object.entries(SINTAKS_MAP).find(([_, info]) => info.order === currentOrder + 1)
  return nextEntry ? (nextEntry[0] as SintaksKey) : null
}

export function getPreviousSintaks(currentKey: SintaksKey): SintaksKey | null {
  const currentOrder = SINTAKS_MAP[currentKey]?.order || 0
  const prevEntry = Object.entries(SINTAKS_MAP).find(([_, info]) => info.order === currentOrder - 1)
  return prevEntry ? (prevEntry[0] as SintaksKey) : null
}
