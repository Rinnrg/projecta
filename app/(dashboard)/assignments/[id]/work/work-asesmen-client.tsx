/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Send,
} from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { useAutoTranslate } from "@/lib/auto-translate-context"

interface Option {
  id: string
  teks: string
}

interface Soal {
  id: string
  pertanyaan: string
  bobot: number
  opsi: Option[]
}

interface AsesmenData {
  id: string
  nama: string
  deskripsi: string | null
  jml_soal: number
  durasi: number
  soal: Soal[]
  guru: {
    id: string
    nama: string
  }
  course: {
    id: string
    judul: string
  }
}

interface WorkAsesmenClientProps {
  asesmen: AsesmenData
}

export default function WorkAsesmenClient({ asesmen }: WorkAsesmenClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useAutoTranslate()
  const { confirm, success: showSuccess, error: showError, AlertComponent } = useSweetAlert()

  // State
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(asesmen.durasi * 60) // durasi dalam menit
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const totalQuestions = asesmen.soal.length
  const currentQuestion = asesmen.soal[currentIdx]
  const answeredCount = Object.keys(answers).length
  const progressPercent = (answeredCount / totalQuestions) * 100

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0 || hasSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, hasSubmitted])

  // Auto Submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !hasSubmitted && !isSubmitting) {
      handleSubmit(true)
    }
  }, [timeLeft, hasSubmitted, isSubmitting])

  // Format time display
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Submit Handler
  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (isSubmitting || hasSubmitted) return

    // Check if all questions answered
    const unansweredCount = totalQuestions - answeredCount
    if (!autoSubmit && unansweredCount > 0) {
      const shouldContinue = await confirm(
        t("Perhatian!"),
        {
          description: t(`Masih ada ${unansweredCount} soal yang belum dijawab. Apakah Anda yakin ingin mengumpulkan?`),
          type: "warning"
        }
      )
      if (!shouldContinue) return
    }

    if (!autoSubmit) {
      const shouldSubmit = await confirm(
        t("Konfirmasi Pengumpulan"),
        {
          description: t("Apakah Anda yakin ingin mengumpulkan jawaban? Aksi ini tidak dapat dibatalkan."),
          type: "question"
        }
      )
      if (!shouldSubmit) return
    }

    setIsSubmitting(true)
    setHasSubmitted(true)

    try {
      // TODO: Implement submit API call
      const response = await fetch("/api/asesmen/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asesmenId: asesmen.id,
          studentId: user?.id,
          answers: answers,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit")
      }

      const result = await response.json()

      showSuccess(
        t("Berhasil!"),
        t(`Nilai Anda: ${result.score || 0}`)
      )

      // Redirect after showing success
      setTimeout(() => {
        router.push("/assignments")
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Submit error:", error)
      showError(t("Error"), t("Gagal mengumpulkan jawaban. Silakan coba lagi."))
      setIsSubmitting(false)
      setHasSubmitted(false)
    }
  }, [answers, asesmen.id, user?.id, isSubmitting, hasSubmitted, answeredCount, totalQuestions])

  // Answer Handler
  const handleAnswer = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }))
  }

  // Navigation
  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentIdx(index)
  }

  // Render Guard
  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="mb-2 text-xl font-bold">Soal Tidak Ditemukan</h2>
          <p className="mb-4 text-muted-foreground">
            Asesmen ini belum memiliki soal atau data gagal dimuat.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <AlertComponent />
      <div className="flex min-h-screen flex-col bg-gray-50/50">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3 shadow-sm sm:px-6 sm:py-4">
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-base font-bold sm:text-lg md:text-xl">
              {asesmen.nama}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Soal {currentIdx + 1} dari {totalQuestions}
            </p>
          </div>

          <div
            className={`ml-2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-sm font-bold sm:gap-2 sm:px-4 sm:py-2 ${
              timeLeft < 60
                ? "animate-pulse border-red-200 bg-red-50 text-red-600"
                : "border-blue-200 bg-blue-50 text-blue-600"
            }`}
          >
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{formatTime(timeLeft)}</span>
            <span className="sm:hidden">{Math.floor(timeLeft / 60)}m</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="container flex-1 grid grid-cols-1 gap-4 py-4 sm:gap-6 sm:py-6 md:grid-cols-4 md:py-8 lg:max-w-6xl">
          {/* Question Section */}
          <div className="space-y-4 md:col-span-3 sm:space-y-6">
            <Card className="flex min-h-[400px] flex-col">
              <CardContent className="flex-1 space-y-6 p-4 sm:space-y-8 sm:p-6 md:p-8">
                {/* Question Header */}
                <div className="space-y-3 sm:space-y-4">
                  <Badge variant="secondary" className="text-xs">
                    Pertanyaan {currentIdx + 1}
                  </Badge>
                  <p className="text-base leading-relaxed sm:text-lg md:text-xl">
                    {currentQuestion.pertanyaan}
                  </p>
                </div>

                {/* Options */}
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={handleAnswer}
                  className="space-y-2 sm:space-y-3"
                >
                  {currentQuestion.opsi.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center space-x-2 rounded-lg border p-3 transition-all hover:bg-muted/50 cursor-pointer sm:space-x-3 sm:p-4 ${
                        answers[currentQuestion.id] === opt.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} />
                      <Label
                        htmlFor={opt.id}
                        className="flex-1 cursor-pointer text-sm font-normal sm:text-base"
                      >
                        <span className="mr-2 font-semibold text-muted-foreground sm:mr-3">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt.teks}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="w-28 sm:w-32"
              >
                <ChevronLeft className="mr-1 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sebelumnya</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              {currentIdx === totalQuestions - 1 ? (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting || hasSubmitted}
                  className="w-28 bg-green-600 hover:bg-green-700 text-white sm:w-32"
                >
                  {isSubmitting ? (
                    "Mengirim..."
                  ) : (
                    <>
                      <span className="hidden sm:inline">Selesai</span>
                      <span className="sm:hidden">Submit</span>
                      <Send className="ml-1 h-4 w-4 sm:ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-28 sm:w-32">
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="ml-1 h-4 w-4 sm:mr-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
                    Navigasi Soal
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Dijawab: {answeredCount}</span>
                    <span>Sisa: {totalQuestions - answeredCount}</span>
                  </div>
                  <Progress value={progressPercent} className="mt-2 h-1.5" />
                </div>

                <ScrollArea className="h-[400px] pr-2">
                  <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                    {asesmen.soal.map((q, idx) => {
                      const isAnswered = !!answers[q.id]
                      const isCurrent = currentIdx === idx

                      return (
                        <button
                          key={q.id}
                          onClick={() => goToQuestion(idx)}
                          className={`h-9 w-full rounded-md text-xs font-medium transition-all sm:h-10 sm:text-sm ${
                            isCurrent
                              ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                              : ""
                          } ${
                            !isCurrent && isAnswered
                              ? "border border-green-200 bg-green-100 text-green-700"
                              : ""
                          } ${
                            !isCurrent && !isAnswered
                              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              : ""
                          }`}
                        >
                          {idx + 1}
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
