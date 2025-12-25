// Types for the Projecta application

export type UserRole = "ADMIN" | "GURU" | "SISWA"

export interface User {
  id: string
  username?: string
  email: string
  nama: string
  role: UserRole
  foto?: string
  createdAt: Date
}

export interface Course {
  id: string
  judul: string
  gambar: string
  kategori: string
  guruId: string
  guru?: User
  asesmen?: Asesmen[]
  materi?: Materi[]
}

export interface Materi {
  id: string
  judul: string
  deskripsi?: string
  tgl_unggah: Date
  lampiran?: string
  courseId: string
}

export interface Asesmen {
  id: string
  nama: string
  deskripsi?: string
  jml_soal: number
  durasi: number
  guruId: string
  courseId: string
  soal?: Soal[]
  nilai?: Nilai[]
}

export interface Soal {
  id: string
  pertanyaan: string
  bobot: number
  asesmenId: string
  opsi?: Opsi[]
}

export interface Opsi {
  id: string
  teks: string
  isBenar: boolean
  soalId: string
}

export interface Nilai {
  id: string
  skor: number
  tanggal: Date
  siswaId: string
  asesmenId: string
}

export interface Proyek {
  id: string
  judul: string
  deskripsi: string
  tgl_mulai: Date
  tgl_selesai: Date
  lampiran?: string
  guruId: string
  kelompok?: Kelompok[]
}

export interface Kelompok {
  id: string
  nama: string
  proyekId: string
  anggota?: AnggotaKelompok[]
  pengumpulan?: PengumpulanProyek[]
}

export interface AnggotaKelompok {
  id: string
  siswaId: string
  kelompokId: string
  siswa?: User
}

export interface PengumpulanProyek {
  id: string
  link?: string
  catatan?: string
  sourceCode?: string
  output?: string
  tgl_unggah: Date
  nilai?: number
  kelompokId: string
}

export interface ProfileShowcase {
  id: string
  judul: string
  deskripsi?: string
  nilai: number
  tanggalDinilai: Date
  isPublic: boolean
  siswaId: string
  pengumpulanProyekId: string
  createdAt: Date
  updatedAt: Date
  siswa?: User
  pengumpulanProyek?: PengumpulanProyek
}

export interface ScheduleEvent {
  id: string
  title: string
  date: Date
  type: "assignment" | "project" | "assessment"
  courseId?: string
}
