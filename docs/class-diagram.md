# Class Diagram — Projecta

File ini berisi diagram kelas (sederhana dan terfokus) dari arsitektur Projecta.
Diagram dibuat dalam format Mermaid supaya mudah dibuka di GitHub/VSCode yang mendukung Mermaid.

> Catatan: diagram ini disederhanakan untuk kemudahan pemahaman (frontend, hooks, lib, API, dan model DB utama).

## 1) High-level frontend / backend overview

```mermaid
classDiagram
    direction LR

    class NextApp {
      +RootLayout()
      +pages
    }

    class RootLayout
    class DashboardLayout
    class AppShell
    class Header
    class Sidebar
    class Pages

    class PythonCompiler {
      +cells: CodeCell[]
      +runCell(id)
      +runPythonCode(code)
      +runAllCells()
    }

    class Editor
    class CodeCell {
      +id: string
      +code: string
      +output: string
      +isError: boolean
      +executionCount: number
    }

    class Hooks
    class useAuth
    class useApi
    class useToast
    class useFileUpload
    class useDebounce
    class useMobile

    class Libs
    class AuthContext
    class ApiCache
    class ActivityLogger
    class PrismaClient

    class API {
      +/api/*
    }

    class WandboxAPI
    class PistonAPI
    class OneCompilerAPI

    %% relations
    NextApp --> RootLayout
    RootLayout --> AppShell
    AppShell --> Header
    AppShell --> Sidebar
    Pages --> AppShell : uses

    Pages --> useAuth : uses
    Pages --> useApi : uses
    Pages --> useToast : uses

    PythonCompiler --> Editor : embeds
    PythonCompiler --> CodeCell : manages
    PythonCompiler --> WandboxAPI : "fetch / compile"
    PythonCompiler --> PistonAPI : "fetch / execute (fallback)"
    PythonCompiler --> OneCompilerAPI : "fetch / execute (final fallback)"
    PythonCompiler --> useAutoTranslate : uses

    useApi --> API : calls
    API --> PrismaClient : queries
    PrismaClient --> AuthContext : used by (server-side auth)

    Hooks <|-- useAuth
    Hooks <|-- useApi
    Hooks <|-- useToast

    Libs <|-- ApiCache
    Libs <|-- ActivityLogger

``` 

## 2) Prisma data model (lengkap)

```mermaid
classDiagram
    direction LR

    %% Enums
    class Role {
      <<enum>>
      ADMIN
      GURU
      SISWA
    }

    class TipeAsesmen {
      <<enum>>
      KUIS
      TUGAS
    }

    class TipePengerjaan {
      <<enum>>
      INDIVIDU
      KELOMPOK
    }

    class TipeJawaban {
      <<enum>>
      PILIHAN_GANDA
      ISIAN
    }

    %% Models
    class User {
      +id: String
      +username: String?
      +email: String
      +nama: String
      +password: String?
      +role: Role
      +foto: String?
      +createdAt: DateTime
    }

    class Course {
      +id: String
      +judul: String
      +gambar: String
      +kategori: String
      +guruId: String
    }

    class Materi {
      +id: String
      +judul: String
      +deskripsi: String?
      +tgl_unggah: DateTime
      +lampiran: String?
      +fileData: Bytes?
      +fileName: String?
      +fileType: String?
      +fileSize: Int?
      +courseId: String
    }

    class Asesmen {
      +id: String
      +nama: String
      +deskripsi: String?
      +tipe: TipeAsesmen
      +tipePengerjaan: TipePengerjaan?
      +jml_soal: Int?
      +durasi: Int?
      +tgl_mulai: DateTime?
      +tgl_selesai: DateTime?
      +lampiran: String?
      +fileData: Bytes?
      +fileName: String?
      +fileType: String?
      +fileSize: Int?
      +guruId: String
      +courseId: String
    }

    class Soal {
      +id: String
      +pertanyaan: String
      +bobot: Int
      +tipeJawaban: TipeJawaban
      +asesmenId: String
    }

    class Opsi {
      +id: String
      +teks: String
      +isBenar: Boolean
      +soalId: String
    }

    class JawabanSiswa {
      +id: String
      +jawaban: String?
      +isBenar: Boolean?
      +skorDidapat: Float?
      +tanggalJawab: DateTime
      +siswaId: String
      +soalId: String
      +nilaiId: String?
    }

    class Nilai {
      +id: String
      +skor: Float
      +tanggal: DateTime
      +siswaId: String
      +asesmenId: String
    }

    class Proyek {
      +id: String
      +judul: String
      +deskripsi: String
      +tgl_mulai: DateTime
      +tgl_selesai: DateTime
      +lampiran: String?
      +fileData: Bytes?
      +fileName: String?
      +fileType: String?
      +fileSize: Int?
      +guruId: String
    }

    class Kelompok {
      +id: String
      +nama: String
      +proyekId: String
    }

    class AnggotaKelompok {
      +id: String
      +kelompokId: String
      +siswaId: String
    }

    class PengumpulanProyek {
      +id: String
      +catatan: String?
      +sourceCode: String?
      +output: String?
      +tgl_unggah: DateTime
      +nilai: Float?
      +namaKelompok: String?
      +ketua: String?
      +anggota: String?
      +fileUrl: String?
      +kelompokId: String?
      +siswaId: String?
      +asesmenId: String?
    }

    class ProfileShowcase {
      +id: String
      +judul: String
      +deskripsi: String?
      +nilai: Float
      +tanggalDinilai: DateTime
      +isPublic: Boolean
      +siswaId: String
      +pengumpulanProyekId: String
      +createdAt: DateTime
      +updatedAt: DateTime
    }

    class Enrollment {
      +id: String
      +enrolledAt: DateTime
      +progress: Int
      +courseId: String
      +siswaId: String
    }

    %% relations
    User "1" -- "0..*" Course : "guru"
    User "1" -- "0..*" Proyek : "guru"
    User "1" -- "0..*" Nilai : "siswa"
    User "1" -- "0..*" JawabanSiswa : "siswa"
    User "1" -- "0..*" AnggotaKelompok : "siswa"
    User "1" -- "0..*" ProfileShowcase : "siswa"
    User "1" -- "0..*" Enrollment : "siswa"
    User "1" -- "0..*" PengumpulanProyek : "siswa"

    Course "1" -- "0..*" Materi : "materi"
    Course "1" -- "0..*" Asesmen : "asesmen"
    Course "1" -- "0..*" Enrollment : "enrollments"

    Asesmen "1" -- "0..*" Soal : "soal"
    Soal "1" -- "0..*" Opsi : "opsi"
    Soal "1" -- "0..*" JawabanSiswa : "jawabanSiswa"

    Nilai "1" -- "0..*" JawabanSiswa : "includes"

    Proyek "1" -- "0..*" Kelompok : "kelompok"
    Kelompok "1" -- "0..*" AnggotaKelompok : "anggota"
    Kelompok "1" -- "0..*" PengumpulanProyek : "pengumpulan"

    PengumpulanProyek "0..1" -- "0..1" User : "siswa"
    PengumpulanProyek "0..1" -- "0..1" Asesmen : "asesmen"
    PengumpulanProyek "1" -- "0..1" ProfileShowcase : "showcase"

    Enrollment "*" -- "1" Course : "enrolled"
    Enrollment "*" -- "1" User : "siswa"

```

## 3) Catatan singkat / keterbacaan
- Diagram ini menyederhanakan banyak detail implementasi (props, util functions, file-level helpers).  
- Periksa `components/`, `hooks/`, `lib/`, `app/api/` dan `prisma/schema.prisma` untuk detail yang lengkap.

---

Jika ingin, saya bisa juga:
- menambahkan diagram sequence (mis. alur `PythonCompiler.runCell()` → API eksternal → response)
- eksport diagram ke PNG dan menaruhnya di `docs/` untuk mudah dibuka di luar GH

File ini dibuat otomatis. Jika mau tambahan, sebutkan tipe diagram yang diinginkan.
