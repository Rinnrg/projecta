"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"
import { useSweetAlert } from "@/components/ui/sweet-alert"

interface Soal {
  id: string
  pertanyaan: string
  bobot: number
  opsi: {
    id: string
    teks: string
    isBenar: boolean
  }[]
}

interface Asesmen {
  id: string
  nama: string
  deskripsi: string | null
  durasi: number | null
  tgl_mulai: Date | null
  tgl_selesai: Date | null
  course: {
    judul: string
    kategori: string
  }
  soal: Soal[]
}

interface User {
  id: string
  nama: string
  email: string
  role: string
}

interface Nilai {
  id: string
  skor: number
  tanggal: Date
}

interface KerjakanKuisClientProps {
  asesmen: Asesmen
  user: User
  existingNilai: Nilai | null
  isDeadlinePassed: boolean
  notYetStarted: boolean
}

export default function KerjakanKuisClient({ 
  asesmen, 
  user, 
  existingNilai,
  isDeadlinePassed,
  notYetStarted,
}: KerjakanKuisClientProps) {
  const router = useRouter()
  const { success, error: showError, confirm, AlertComponent } = useSweetAlert()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(asesmen.durasi ? asesmen.durasi * 60 : null)
  const [quizStarted, setQuizStarted] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAutoSubmit = async () => {
    showError("Waktu Habis", "Waktu pengerjaan kuis telah habis. Jawaban Anda akan dikumpulkan otomatis.")
    setTimeout(() => {
      handleSubmit(true)
    }, 2000)
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  const handleAnswerChange = (soalId: string, opsiId: string) => {
    setAnswers(prev => ({ ...prev, [soalId]: opsiId }))
  }

  const handleNext = () => {
    if (currentQuestion < asesmen.soal.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const answeredCount = Object.keys(answers).length
      if (answeredCount < asesmen.soal.length) {
        const proceed = await confirm(
          "Belum Semua Terjawab",
          {
            description: `Anda baru menjawab ${answeredCount} dari ${asesmen.soal.length} soal. Yakin ingin mengumpulkan?`,
            confirmText: "Ya, Kumpulkan",
            cancelText: "Batal",
          }
        )
        if (!proceed) return
      } else {
        const proceed = await confirm(
          "Kumpulkan Jawaban",
          {
            description: "Yakin ingin mengumpulkan jawaban? Anda tidak bisa mengubahnya lagi.",
            confirmText: "Ya, Kumpulkan",
            cancelText: "Batal",
          }
        )
        if (!proceed) return
      }
    }

    setIsSubmitting(true)

    try {
      // Calculate score
      let totalScore = 0
      let totalBobot = 0

      asesmen.soal.forEach(soal => {
        totalBobot += soal.bobot
        const selectedOpsiId = answers[soal.id]
        if (selectedOpsiId) {
          const selectedOpsi = soal.opsi.find(o => o.id === selectedOpsiId)
          if (selectedOpsi?.isBenar) {
            totalScore += soal.bobot
          }
        }
      })

      // Convert to 0-100 scale
      const finalScore = totalBobot > 0 ? Math.round((totalScore / totalBobot) * 100) : 0

      const response = await fetch(`/api/asesmen/${asesmen.id}/submit-kuis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siswaId: user.id,
          answers,
          skor: finalScore,
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal mengumpulkan jawaban')
      }

      success("Berhasil!", `Kuis selesai! Nilai Anda: ${finalScore}`)
      setTimeout(() => {
        router.push(`/courses`)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      showError("Error", "Gagal mengumpulkan jawaban. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If already submitted
  if (existingNilai) {
    return (
      <>
        <AlertComponent />
        <div className="container max-w-4xl py-8 space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Courses
            </Link>
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kuis Sudah Dikerjakan</h3>
              <p className="text-muted-foreground mb-6">
                Anda telah mengerjakan kuis ini sebelumnya
              </p>
              <div className="text-4xl font-bold text-primary mb-2">
                {existingNilai.skor}
              </div>
              <p className="text-sm text-muted-foreground mb-6">Nilai Anda</p>
              <Button asChild>
                <Link href="/courses">
                  Kembali ke Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // If deadline passed
  if (isDeadlinePassed) {
    return (
      <>
        <AlertComponent />
        <div className="container max-w-4xl py-8 space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Courses
            </Link>
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kuis Sudah Ditutup</h3>
              <p className="text-muted-foreground mb-6">
                Waktu pengerjaan kuis ini telah berakhir
              </p>
              <Button asChild>
                <Link href="/courses">
                  Kembali ke Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // If not yet started
  if (notYetStarted) {
    return (
      <>
        <AlertComponent />
        <div className="container max-w-4xl py-8 space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Courses
            </Link>
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kuis Belum Dimulai</h3>
              <p className="text-muted-foreground mb-6">
                Kuis ini akan dibuka pada:{" "}
                {asesmen.tgl_mulai && new Date(asesmen.tgl_mulai).toLocaleString('id-ID')}
              </p>
              <Button asChild>
                <Link href="/courses">
                  Kembali ke Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // No questions
  if (asesmen.soal.length === 0) {
    return (
      <>
        <AlertComponent />
        <div className="container max-w-4xl py-8 space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Courses
            </Link>
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Belum Ada Soal</h3>
              <p className="text-muted-foreground mb-6">
                Kuis ini belum memiliki soal. Silakan hubungi guru Anda.
              </p>
              <Button asChild>
                <Link href="/courses">
                  Kembali ke Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const currentSoal = asesmen.soal[currentQuestion]
  const progress = ((currentQuestion + 1) / asesmen.soal.length) * 100
  const answeredCount = Object.keys(answers).length

  // Start screen
  if (!quizStarted) {
    return (
      <>
        <AlertComponent />
        <div className="container max-w-4xl py-8 space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Courses
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{asesmen.nama}</CardTitle>
              <CardDescription>{asesmen.course.judul}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {asesmen.deskripsi && (
                <div>
                  <h3 className="font-semibold mb-2">Deskripsi</h3>
                  <p className="text-muted-foreground">{asesmen.deskripsi}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Total Soal</div>
                  <div className="text-2xl font-bold">{asesmen.soal.length}</div>
                </div>
                {asesmen.durasi && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Waktu</div>
                    <div className="text-2xl font-bold">{asesmen.durasi} menit</div>
                  </div>
                )}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Total Poin</div>
                  <div className="text-2xl font-bold">
                    {asesmen.soal.reduce((acc, s) => acc + s.bobot, 0)}
                  </div>
                </div>
                {asesmen.tgl_selesai && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Deadline</div>
                    <div className="text-lg font-bold">
                      {new Date(asesmen.tgl_selesai).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Petunjuk:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pastikan koneksi internet Anda stabil</li>
                  <li>• Jawab semua pertanyaan dengan teliti</li>
                  {asesmen.durasi && (
                    <li>• Waktu akan berjalan otomatis setelah Anda mulai</li>
                  )}
                  <li>• Anda tidak dapat mengulang kuis setelah dikumpulkan</li>
                </ul>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleStartQuiz}
              >
                Mulai Kuis
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Quiz screen
  return (
    <>
      <AlertComponent />
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header with timer */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{asesmen.nama}</h1>
            <p className="text-sm text-muted-foreground">
              Soal {currentQuestion + 1} dari {asesmen.soal.length}
            </p>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress: {Math.round(progress)}%</span>
            <span>Terjawab: {answeredCount}/{asesmen.soal.length}</span>
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant="outline" className="mb-3">
                  Poin: {currentSoal.bobot}
                </Badge>
                <CardTitle className="text-lg leading-relaxed">
                  {currentQuestion + 1}. {currentSoal.pertanyaan}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentSoal.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentSoal.id, value)}
            >
              {currentSoal.opsi.map((opsi, index) => (
                <div
                  key={opsi.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                    answers[currentSoal.id] === opsi.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={opsi.id} id={opsi.id} className="mt-0.5" />
                  <Label
                    htmlFor={opsi.id}
                    className="flex-1 cursor-pointer font-normal leading-relaxed"
                  >
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {opsi.teks}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Button>

          <div className="flex gap-2">
            {asesmen.soal.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  index === currentQuestion
                    ? 'bg-primary text-primary-foreground'
                    : answers[asesmen.soal[index].id]
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === asesmen.soal.length - 1 ? (
            <Button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mengumpulkan..." : "Kumpulkan"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Selanjutnya
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
