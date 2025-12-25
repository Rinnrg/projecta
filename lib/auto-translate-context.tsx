"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Locale = 'id' | 'en'

interface AutoTranslateContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (text: string) => string
}

const AutoTranslateContext = createContext<AutoTranslateContextType | undefined>(undefined)

// Translation cache untuk performa
const translationCache = new Map<string, { id: string; en: string }>()

// Dictionary untuk common phrases (auto-populated)
const translationDict: Record<string, { id: string; en: string }> = {
  // Navigation & Common
  'Beranda': { id: 'Beranda', en: 'Home' },
  'Kursus': { id: 'Kursus', en: 'Courses' },
  'Tugas': { id: 'Tugas', en: 'Assignments' },
  'Proyek': { id: 'Proyek', en: 'Projects' },
  'Kalender': { id: 'Kalender', en: 'Calendar' },
  'Jadwal': { id: 'Jadwal', en: 'Schedule' },
  'Galeri': { id: 'Galeri', en: 'Gallery' },
  'Profil': { id: 'Profil', en: 'Profile' },
  'Pengaturan': { id: 'Pengaturan', en: 'Settings' },
  'Compiler': { id: 'Compiler', en: 'Compiler' },
  'Manajemen Role': { id: 'Manajemen Role', en: 'Role Management' },
  
  // Actions
  'Simpan': { id: 'Simpan', en: 'Save' },
  'Batal': { id: 'Batal', en: 'Cancel' },
  'Hapus': { id: 'Hapus', en: 'Delete' },
  'Edit': { id: 'Edit', en: 'Edit' },
  'Tambah': { id: 'Tambah', en: 'Add' },
  'Lihat': { id: 'Lihat', en: 'View' },
  'Cari': { id: 'Cari', en: 'Search' },
  'Filter': { id: 'Filter', en: 'Filter' },
  'Kembali': { id: 'Kembali', en: 'Back' },
  'Selanjutnya': { id: 'Selanjutnya', en: 'Next' },
  'Sebelumnya': { id: 'Sebelumnya', en: 'Previous' },
  'Kirim': { id: 'Kirim', en: 'Submit' },
  'Tutup': { id: 'Tutup', en: 'Close' },
  'Mulai': { id: 'Mulai', en: 'Start' },
  'Selesai': { id: 'Selesai', en: 'Completed' },
  'Keluar': { id: 'Keluar', en: 'Logout' },
  
  // Status
  'Aktif': { id: 'Aktif', en: 'Active' },
  'Dikumpulkan': { id: 'Dikumpulkan', en: 'Submitted' },
  'Tertunda': { id: 'Tertunda', en: 'Pending' },
  'Terlambat': { id: 'Terlambat', en: 'Overdue' },
  'Akan Datang': { id: 'Akan Datang', en: 'Upcoming' },
  'Mendatang': { id: 'Mendatang', en: 'Upcoming' },
  
  // Time
  'Hari Ini': { id: 'Hari Ini', en: 'Today' },
  'Kemarin': { id: 'Kemarin', en: 'Yesterday' },
  'Besok': { id: 'Besok', en: 'Tomorrow' },
  'Minggu Ini': { id: 'Minggu Ini', en: 'This Week' },
  'Bulan Ini': { id: 'Bulan Ini', en: 'This Month' },
  
  // Roles
  'Admin': { id: 'Admin', en: 'Admin' },
  'Guru': { id: 'Guru', en: 'Teacher' },
  'Siswa': { id: 'Siswa', en: 'Student' },
  
  // Academic
  'Materi': { id: 'Materi', en: 'Material' },
  'Pembelajaran': { id: 'Pembelajaran', en: 'Learning' },
  'Pelajaran': { id: 'Pelajaran', en: 'Lesson' },
  'Asesmen': { id: 'Asesmen', en: 'Assessment' },
  'Nilai': { id: 'Nilai', en: 'Grade' },
  'Hasil': { id: 'Hasil', en: 'Result' },
  
  // Common Phrases
  'Selamat Datang Kembali': { id: 'Selamat Datang Kembali', en: 'Welcome Back' },
  'Selamat Pagi': { id: 'Selamat Pagi', en: 'Good Morning' },
  'Selamat Siang': { id: 'Selamat Siang', en: 'Good Afternoon' },
  'Selamat Malam': { id: 'Selamat Malam', en: 'Good Evening' },
  'Tidak ada data': { id: 'Tidak ada data', en: 'No data' },
  'Tidak ada hasil': { id: 'Tidak ada hasil', en: 'No results' },
  'Memuat': { id: 'Memuat', en: 'Loading' },
  'Memuat...': { id: 'Memuat...', en: 'Loading...' },
  'Berhasil': { id: 'Berhasil', en: 'Success' },
  'Terjadi kesalahan': { id: 'Terjadi kesalahan', en: 'An error occurred' },
  'Lihat Semua': { id: 'Lihat Semua', en: 'View All' },
  'Lihat Kalender': { id: 'Lihat Kalender', en: 'View Calendar' },
  'Lanjutkan': { id: 'Lanjutkan', en: 'Continue' },
  'Buat Kursus': { id: 'Buat Kursus', en: 'Create Course' },
  'Kelola Proyek': { id: 'Kelola Proyek', en: 'Manage Projects' },
  
  // Dashboard
  'Ringkasan Sistem': { id: 'Ringkasan Sistem', en: 'System Overview' },
  'Total Pengguna': { id: 'Total Pengguna', en: 'Total Users' },
  'Siswa Aktif': { id: 'Siswa Aktif', en: 'Active Students' },
  'Instruktur': { id: 'Instruktur', en: 'Instructors' },
  'Kursus Anda': { id: 'Kursus Anda', en: 'Your Courses' },
  'Baru Diperbarui': { id: 'Baru Diperbarui', en: 'Recently Updated' },
  'Semua Kursus': { id: 'Semua Kursus', en: 'All Courses' },
  'Proyek Mendatang': { id: 'Proyek Mendatang', en: 'Upcoming Projects' },
  'dashboard.readyToTake': { id: 'Siap Dikerjakan', en: 'Ready to Take' },
  'dashboard.recentAssessments': { id: 'Asesmen Terbaru', en: 'Recent Assessments' },
  'dashboard.recentActivity': { id: 'Aktivitas Terbaru', en: 'Recent Activity' },
  
  // Users Management
  'Manajemen Pengguna': { id: 'Manajemen Pengguna', en: 'User Management' },
  'Kelola data pengguna sistem Projecta': { id: 'Kelola data pengguna sistem Projecta', en: 'Manage Projecta system users data' },
  'Impor Pengguna': { id: 'Impor Pengguna', en: 'Import Users' },
  'Ekspor Pengguna': { id: 'Ekspor Pengguna', en: 'Export Users' },
  'Tambah Pengguna': { id: 'Tambah Pengguna', en: 'Add User' },
  'Hapus Pengguna': { id: 'Hapus Pengguna', en: 'Delete User' },
  'Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.': {
    id: 'Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.',
    en: 'Are you sure you want to delete this user? This action cannot be undone.'
  },
  'berhasil dihapus': { id: 'berhasil dihapus', en: 'successfully deleted' },
  'Impor Data Pengguna': { id: 'Impor Data Pengguna', en: 'Import User Data' },
  'Upload file CSV atau Excel untuk menambahkan banyak pengguna sekaligus': {
    id: 'Upload file CSV atau Excel untuk menambahkan banyak pengguna sekaligus',
    en: 'Upload CSV or Excel file to add multiple users at once'
  },
  'Seret dan lepas file di sini': { id: 'Seret dan lepas file di sini', en: 'Drag and drop file here' },
  'Pilih File': { id: 'Pilih File', en: 'Browse Files' },
  'Unduh Template': { id: 'Unduh Template', en: 'Download Template' },
  'atau': { id: 'atau', en: 'or' },
  'Role': { id: 'Role', en: 'Role' },
  'Cari pengguna...': { id: 'Cari pengguna...', en: 'Search users...' },
  'Filter berdasarkan role': { id: 'Filter berdasarkan role', en: 'Filter by role' },
  'Semua Role': { id: 'Semua Role', en: 'All Roles' },
  'Pengguna': { id: 'Pengguna', en: 'Users' },
  'Tanggal Bergabung': { id: 'Tanggal Bergabung', en: 'Join Date' },
  'Gagal memuat data pengguna': { id: 'Gagal memuat data pengguna', en: 'Failed to load user data' },
  'Data pengguna berhasil diperbarui': { id: 'Data pengguna berhasil diperbarui', en: 'User data updated successfully' },
  'Gagal memperbarui data pengguna': { id: 'Gagal memperbarui data pengguna', en: 'Failed to update user data' },
  'Kembali ke Daftar Pengguna': { id: 'Kembali ke Daftar Pengguna', en: 'Back to User List' },
  'Edit Pengguna': { id: 'Edit Pengguna', en: 'Edit User' },
  'Perbarui informasi pengguna': { id: 'Perbarui informasi pengguna', en: 'Update user information' },
  'Foto Profil': { id: 'Foto Profil', en: 'Profile Photo' },
  'Upload foto profil pengguna (maks 2MB)': { id: 'Upload foto profil pengguna (maks 2MB)', en: 'Upload user profile photo (max 2MB)' },
  'Upload Foto': { id: 'Upload Foto', en: 'Upload Photo' },
  'Masukkan nama lengkap': { id: 'Masukkan nama lengkap', en: 'Enter full name' },
  'Masukkan email': { id: 'Masukkan email', en: 'Enter email' },
  'Masukkan username': { id: 'Masukkan username', en: 'Enter username' },
  'Pilih role': { id: 'Pilih role', en: 'Select role' },
  'Nama Lengkap': { id: 'Nama Lengkap', en: 'Full Name' },
  'Username': { id: 'Username', en: 'Username' },
  'Email': { id: 'Email', en: 'Email' },
  
  // Courses
  'Hapus Kursus': { id: 'Hapus Kursus', en: 'Delete Course' },
  'Apakah Anda yakin ingin menghapus kursus ini?': { id: 'Apakah Anda yakin ingin menghapus kursus ini?', en: 'Are you sure you want to delete this course?' },
  
  // Showcase
  'Galeri Proyek': { id: 'Galeri Proyek', en: 'Project Gallery' },
  'Proyek terbaik dari siswa': { id: 'Proyek terbaik dari siswa', en: 'Best projects from students' },
  'Cari proyek di galeri...': { id: 'Cari proyek di galeri...', en: 'Search projects in gallery...' },
  'Semua Siswa': { id: 'Semua Siswa', en: 'All Students' },
  'Urutkan': { id: 'Urutkan', en: 'Sort' },
  'Terbaru': { id: 'Terbaru', en: 'Newest' },
  'Nilai Tertinggi': { id: 'Nilai Tertinggi', en: 'Highest Grade' },
  'Alfabetis': { id: 'Alfabetis', en: 'Alphabetical' },
  'Lihat Detail': { id: 'Lihat Detail', en: 'View Details' },
  'Tidak ada proyek ditemukan': { id: 'Tidak ada proyek ditemukan', en: 'No projects found' },
  'Coba sesuaikan pencarian Anda': { id: 'Coba sesuaikan pencarian Anda', en: 'Try adjusting your search' },
  'Proyek luar biasa akan muncul di sini': { id: 'Proyek luar biasa akan muncul di sini', en: 'Outstanding projects will appear here' },
  
  // Header
  'Ganti Tampilan': { id: 'Ganti Tampilan', en: 'Switch View' },
  
  // Schedule Page
  'schedule': { id: 'Jadwal', en: 'Schedule' },
  'scheduleDesc': { id: 'Kelola dan lihat jadwal pembelajaran Anda', en: 'Manage and view your learning schedule' },
  'calendarView': { id: 'Tampilan Kalender', en: 'Calendar View' },
  'listView': { id: 'Tampilan Daftar', en: 'List View' },
  'filter': { id: 'Filter', en: 'Filter' },
  'allEvents': { id: 'Semua Event', en: 'All Events' },
  'assessment': { id: 'Asesmen', en: 'Assessment' },
  'project': { id: 'Proyek', en: 'Project' },
  'assignment': { id: 'Tugas', en: 'Assignment' },
  'lesson': { id: 'Pelajaran', en: 'Lesson' },
  'overdueItems': { id: 'item terlambat', en: 'overdue items' },
  'today': { id: 'Hari Ini', en: 'Today' },
  'noEvents': { id: 'Tidak ada event', en: 'No events' },
  'selectDate': { id: 'Pilih Tanggal', en: 'Select Date' },
  'next7Days': { id: '7 Hari Ke Depan', en: 'Next 7 Days' },
  'noUpcoming': { id: 'Tidak ada event mendatang', en: 'No upcoming events' },
  'monthSummary': { id: 'Ringkasan Bulan', en: 'Month Summary' },
  
  // Compiler Page
  'back': { id: 'Kembali', en: 'Back' },
  'compilerTitle': { id: 'Python Compiler', en: 'Python Compiler' },
  'compilerVersion': { id: 'Python 3.11 + Pyodide', en: 'Python 3.11 + Pyodide' },
  'addCode': { id: 'Tambah Kode', en: 'Add Code' },
  'addText': { id: 'Tambah Teks', en: 'Add Text' },
  'packagesInstalled': { id: 'paket terinstall', en: 'packages installed' },
  'runAll': { id: 'Jalankan Semua', en: 'Run All' },
  'importFile': { id: 'Impor File', en: 'Import File' },
  'exportFile': { id: 'Ekspor File', en: 'Export File' },
  'printNotebook': { id: 'Cetak Notebook', en: 'Print Notebook' },
  'noCell': { id: 'Belum Ada Cell', en: 'No Cells Yet' },
  'noCellDesc': { id: 'Mulai dengan menambahkan cell kode atau teks', en: 'Start by adding a code or text cell' },
  'addNewCell': { id: 'Tambah Cell Baru', en: 'Add New Cell' },
  'writeMarkdown': { id: 'Tulis markdown di sini...', en: 'Write markdown here...' },
  'output': { id: 'Output', en: 'Output' },
  'copyOutput': { id: 'Salin', en: 'Copy' },
  'showOutput': { id: 'Tampilkan', en: 'Show' },
  'hideOutput': { id: 'Sembunyikan', en: 'Hide' },
  'outputCopied': { id: 'Output berhasil disalin!', en: 'Output copied successfully!' },
}

// Simple word-by-word translation fallback
const wordTranslations: Record<string, string> = {
  'selamat': 'welcome',
  'datang': 'come',
  'kembali': 'back',
  'pagi': 'morning',
  'siang': 'afternoon',
  'malam': 'evening',
  'semua': 'all',
  'tidak': 'no',
  'ada': 'any',
  'data': 'data',
  'hasil': 'result',
  'cari': 'search',
  'apapun': 'anything',
  'tambah': 'add',
  'baru': 'new',
  'lihat': 'view',
  'detail': 'details',
  'total': 'total',
  'aktif': 'active',
  'selesai': 'completed',
  'tertunda': 'pending',
  'terlambat': 'overdue',
  'dikumpulkan': 'submitted',
  'akan': 'upcoming',
  'hari': 'day',
  'ini': 'today',
  'kemarin': 'yesterday',
  'besok': 'tomorrow',
  'minggu': 'week',
  'bulan': 'month',
  'tahun': 'year',
  'dari': 'from',
  'ke': 'to',
  'di': 'in',
  'pada': 'at',
  'untuk': 'for',
  'dengan': 'with',
  'atau': 'or',
  'dan': 'and',
  'kursus': 'course',
  'tugas': 'assignment',
  'proyek': 'project',
  'materi': 'material',
  'pembelajaran': 'learning',
  'pelajaran': 'lesson',
  'asesmen': 'assessment',
  'nilai': 'grade',
  'siswa': 'student',
  'guru': 'teacher',
  'admin': 'admin',
  'pengguna': 'user',
  'profil': 'profile',
  'pengaturan': 'settings',
  'jadwal': 'schedule',
  'kalender': 'calendar',
  'galeri': 'gallery',
  'compiler': 'compiler',
  'manajemen': 'management',
  'role': 'role',
}

// Auto-translate function
function autoTranslate(text: string, targetLocale: Locale): string {
  if (!text) return text
  
  // Check cache first
  const cacheKey = text.toLowerCase().trim()
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey)!
    return cached[targetLocale]
  }
  
  // Check dictionary
  const dictKey = text.trim()
  if (translationDict[dictKey]) {
    const translation = translationDict[dictKey]
    translationCache.set(cacheKey, translation)
    return translation[targetLocale]
  }
  
  // If already in target locale or no translation needed
  if (targetLocale === 'id' || isEnglish(text)) {
    if (targetLocale === 'id') {
      return text // Already Indonesian or keep as-is
    }
  }
  
  // Fallback: word-by-word translation
  const words = text.split(/\s+/)
  const translatedWords = words.map(word => {
    const lowerWord = word.toLowerCase()
    return wordTranslations[lowerWord] || word
  })
  
  let result = translatedWords.join(' ')
  
  // Preserve capitalization
  if (text[0] === text[0].toUpperCase()) {
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }
  
  // Cache the result
  const translation = { id: text, en: result }
  translationCache.set(cacheKey, translation)
  
  return translation[targetLocale]
}

// Check if text is already in English
function isEnglish(text: string): boolean {
  // Simple heuristic: if it doesn't contain common Indonesian words
  const indonesianIndicators = ['yang', 'dengan', 'untuk', 'dari', 'di', 'ke', 'pada']
  const lowerText = text.toLowerCase()
  return !indonesianIndicators.some(word => lowerText.includes(word))
}

export function AutoTranslateProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  // Load saved locale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && (saved === 'id' || saved === 'en')) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [])

  const t = useCallback((text: string) => {
    return autoTranslate(text, locale)
  }, [locale])

  return (
    <AutoTranslateContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </AutoTranslateContext.Provider>
  )
}

export function useAutoTranslate() {
  const context = useContext(AutoTranslateContext)
  if (!context) {
    throw new Error('useAutoTranslate must be used within AutoTranslateProvider')
  }
  return context
}

// Alias untuk compatibility
export const useTranslate = useAutoTranslate
export const useT = () => {
  const { t } = useAutoTranslate()
  return t
}
