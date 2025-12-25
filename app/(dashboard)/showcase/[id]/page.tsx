import { mockShowcase, mockUsers } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Users, UserCheck, Award } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CodeViewer } from "./code-viewer"
import { notFound } from "next/navigation"

// Extended showcase data with full structure
const extendedShowcase = [
  {
    ...mockShowcase[0],
    pengumpulanProyek: {
      link: "https://github.com/ahmadfauzi/portfolio-website",
      catatan:
        "Website portfolio ini dibuat menggunakan Next.js dan Tailwind CSS dengan fokus pada performa dan animasi yang smooth.",
      sourceCode: `// Portfolio Website - Main Component
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Portfolio() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800"
    >
      <Header />
      <Hero />
      <Projects />
      <Skills />
      <Contact />
      <Footer />
    </motion.main>
  )
}

function Hero() {
  return (
    <section className="container mx-auto px-4 py-20">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-5xl font-bold text-white"
      >
        Hello, I'm Ahmad Fauzi
      </motion.h1>
      <p className="mt-4 text-xl text-slate-300">
        Full-stack Developer & UI/UX Enthusiast
      </p>
    </section>
  )
}`,
      output: `[Build] Compiling...
[Build] ✓ Compiled successfully in 2.3s
[Server] Starting development server...
[Server] Ready on http://localhost:3000
[Info] Page loaded successfully
[Performance] First Contentful Paint: 0.8s
[Performance] Largest Contentful Paint: 1.2s
[Performance] Total Blocking Time: 50ms`,
      kelompok: {
        nama: "Team Alpha",
        proyek: {
          judul: "Final Project - Web Development",
          deskripsi: "Proyek akhir pembuatan website portfolio menggunakan teknologi modern",
          guru: mockUsers[1],
        },
        anggota: [{ siswa: mockUsers[0] }, { siswa: mockUsers[3] }],
      },
    },
  },
  {
    ...mockShowcase[1],
    pengumpulanProyek: {
      link: "https://github.com/budisantoso/task-manager",
      catatan: "Aplikasi task management dengan fitur drag and drop menggunakan React DnD.",
      sourceCode: `// Task Management App
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
}

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    // Update state
    setTasks(items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {['todo', 'in-progress', 'done'].map(status => (
          <TaskColumn key={status} status={status} tasks={tasks} />
        ))}
      </div>
    </DragDropContext>
  )
}`,
      output: `> task-manager@1.0.0 dev
> next dev

✓ Ready in 1.8s
○ Compiling /page ...
✓ Compiled /page in 892ms
[API] Connected to database
[Auth] Session validated
[Tasks] Loaded 24 tasks from database`,
      kelompok: {
        nama: "Team Beta",
        proyek: {
          judul: "Project Based Learning - React App",
          deskripsi: "Pembuatan aplikasi berbasis React dengan state management",
          guru: mockUsers[1],
        },
        anggota: [{ siswa: mockUsers[3] }, { siswa: mockUsers[4] }],
      },
    },
  },
  {
    id: "s3",
    judul: "Weather Dashboard",
    deskripsi: "Real-time weather application with beautiful UI and location-based forecasts",
    nilai: 95,
    tanggalDinilai: new Date("2024-11-25"),
    isPublic: true,
    siswaId: "5",
    pengumpulanProyekId: "pp3",
    createdAt: new Date("2024-11-25"),
    updatedAt: new Date("2024-11-25"),
    siswa: mockUsers[4],
    pengumpulanProyek: {
      link: "https://github.com/citradewi/weather-dashboard",
      catatan: "Menggunakan OpenWeather API untuk data cuaca real-time dengan caching untuk optimasi performa.",
      sourceCode: `// Weather Dashboard - API Integration
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useWeather(city: string) {
  const { data, error, isLoading } = useSWR(
    \`/api/weather?city=\${encodeURIComponent(city)}\`,
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  )

  return {
    weather: data,
    isLoading,
    isError: error
  }
}

export function WeatherCard({ city }: { city: string }) {
  const { weather, isLoading, isError } = useWeather(city)

  if (isLoading) return <WeatherSkeleton />
  if (isError) return <WeatherError />

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
      <h2 className="text-2xl font-bold">{weather.city}</h2>
      <div className="mt-4 flex items-center gap-4">
        <WeatherIcon condition={weather.condition} />
        <span className="text-5xl font-light">{weather.temp}°C</span>
      </div>
      <p className="mt-2 text-blue-100">{weather.description}</p>
    </div>
  )
}`,
      output: `[SWR] Fetching weather data for Jakarta...
[API] GET /api/weather?city=Jakarta - 200 OK (45ms)
[Cache] Weather data cached for 5 minutes
[UI] Rendering weather card...
[Performance] Component rendered in 12ms

Current Weather:
- City: Jakarta
- Temperature: 32°C
- Condition: Partly Cloudy
- Humidity: 78%
- Wind: 12 km/h`,
      kelompok: {
        nama: "Team Gamma",
        proyek: {
          judul: "API Integration Project",
          deskripsi: "Proyek integrasi dengan external API dan data visualization",
          guru: mockUsers[1],
        },
        anggota: [{ siswa: mockUsers[4] }],
      },
    },
  },
  {
    id: "s4",
    judul: "Blog Platform",
    deskripsi: "Full-stack blog with authentication, rich text editor, and comments system",
    nilai: 78,
    tanggalDinilai: new Date("2024-11-28"),
    isPublic: true,
    siswaId: "1",
    pengumpulanProyekId: "pp4",
    createdAt: new Date("2024-11-28"),
    updatedAt: new Date("2024-11-28"),
    siswa: mockUsers[0],
    pengumpulanProyek: {
      link: null,
      catatan: "Platform blog dengan fitur autentikasi menggunakan NextAuth dan database PostgreSQL.",
      sourceCode: null,
      output: null,
      kelompok: {
        nama: "Solo Project",
        proyek: {
          judul: "Individual Assessment - Full Stack",
          deskripsi: "Proyek individu untuk menilai kemampuan full-stack development",
          guru: mockUsers[1],
        },
        anggota: [{ siswa: mockUsers[0] }],
      },
    },
  },
]

// Helper function to get grade letter and color
function getGradeInfo(nilai: number): { letter: string; color: string; bgColor: string } {
  if (nilai >= 90) return { letter: "A", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-500" }
  if (nilai >= 80) return { letter: "B", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-500" }
  if (nilai >= 70) return { letter: "C", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-500" }
  if (nilai >= 60) return { letter: "D", color: "text-orange-700 dark:text-orange-300", bgColor: "bg-orange-500" }
  return { letter: "E", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-500" }
}

// Helper function to detect programming language
function detectLanguage(code: string): string {
  if (code.includes("import React") || code.includes("useState") || code.includes("useEffect")) return "TypeScript"
  if (code.includes("def ") || (code.includes("import ") && code.includes(":"))) return "Python"
  if (code.includes("public class") || code.includes("public static void")) return "Java"
  if (code.includes("func ") && code.includes("->")) return "Swift"
  if (code.includes("fn ") && code.includes("->")) return "Rust"
  return "JavaScript"
}

export default async function ShowcaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const showcase = extendedShowcase.find((s) => s.id === id)

  if (!showcase) {
    return notFound()
  }

  const gradeInfo = getGradeInfo(showcase.nilai)
  const { pengumpulanProyek } = showcase
  const sourceCode = pengumpulanProyek?.sourceCode
  const output = pengumpulanProyek?.output
  const catatan = pengumpulanProyek?.catatan
  const link = pengumpulanProyek?.link
  const kelompok = pengumpulanProyek?.kelompok
  const guru = kelompok?.proyek?.guru

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/showcase">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Link>
      </Button>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Title & Project Info */}
                <div className="flex-1 space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{showcase.judul}</h1>
                  <p className="text-muted-foreground">{kelompok?.proyek?.judul}</p>
                </div>

                {/* Right: Grade Badge */}
                <div className="flex flex-col items-center gap-1">
                  <Badge className={`px-4 py-2 text-lg font-bold text-white ${gradeInfo.bgColor}`}>
                    {gradeInfo.letter}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{showcase.nilai}/100</span>
                </div>
              </div>
            </CardHeader>
            {showcase.deskripsi && (
              <CardContent>
                <p className="text-muted-foreground">{showcase.deskripsi}</p>
              </CardContent>
            )}
          </Card>

          {/* Notes/Catatan */}
          {catatan && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <p className="text-sm">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Catatan: </span>
                <span className="text-blue-800 dark:text-blue-200">{catatan}</span>
              </p>
            </div>
          )}

          {/* Source Code Viewer - Client Component */}
          <CodeViewer sourceCode={sourceCode} link={link} />

          {/* Output Console */}
          {output && (
            <div className="overflow-hidden rounded-lg border bg-slate-950">
              {/* Console Header */}
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="font-mono text-sm text-slate-400">Output</span>
              </div>

              {/* Console Content */}
              <div className="max-h-64 overflow-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-green-400">
                  <code>{output}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Student Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pembuat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={showcase.siswa?.foto || "/placeholder.svg"} />
                  <AvatarFallback>
                    {showcase.siswa?.nama
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{showcase.siswa?.nama}</p>
                  {showcase.siswa?.username && (
                    <p className="text-sm text-muted-foreground">@{showcase.siswa.username}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Card */}
          {kelompok && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Tim Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Group Name */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Kelompok</p>
                  <p className="font-semibold">{kelompok.nama}</p>
                </div>

                <Separator />

                {/* Members List */}
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Anggota Tim</p>
                  <div className="space-y-2">
                    {kelompok.anggota?.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">{member.siswa?.nama}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grading Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Penilaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teacher Info */}
              {guru && (
                <>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCheck className="h-4 w-4" />
                      <span>Dinilai oleh:</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={guru.foto || "/placeholder.svg"} />
                        <AvatarFallback>
                          {guru.nama
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{guru.nama}</p>
                        <p className="text-xs text-muted-foreground">Guru Pembimbing</p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Date */}
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Tanggal Penilaian:</span>
                </div>
                <p className="font-medium">
                  {format(new Date(showcase.tanggalDinilai), "EEEE, dd MMMM yyyy", { locale: localeId })}
                </p>
              </div>

              <Separator />

              {/* Grade Display */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Nilai Akhir:</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${gradeInfo.bgColor}`}
                  >
                    {gradeInfo.letter}
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${gradeInfo.color}`}>{showcase.nilai}</p>
                    <p className="text-xs text-muted-foreground">dari 100 poin</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
