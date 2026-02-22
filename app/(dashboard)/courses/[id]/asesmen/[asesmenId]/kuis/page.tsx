"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { 
  ArrowLeft, 
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface PageProps {
  params: Promise<{ 
    id: string
    asesmenId: string
  }>
}

interface Opsi {
  id: string
  teks: string
  isBenar: boolean
}

interface Soal {
  id: string
  pertanyaan: string
  bobot: number
  tipeJawaban: 'PILIHAN_GANDA' | 'ISIAN'
  opsi: Opsi[]
}

interface Jawaban {
  soalId: string
  jawaban: string
}

export default function KuisPage({ params }: PageProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  const { id: courseId, asesmenId } = resolvedParams
  const { confirm, success, error: showError, AlertComponent } = useSweetAlert()
  
  const [asesmen, setAsesmen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0)
  const [jawaban, setJawaban] = useState<Jawaban[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  
  // Check if already submitted
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'SISWA') {
      router.push(`/courses/${courseId}/asesmen/${asesmenId}`)
      return
    }

    // Fetch asesmen data
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/asesmen/${asesmenId}?userId=${user.id}&userRole=${user.role}`)
        if (response.ok) {
          const data = await response.json()
          const asesmenData = data.asesmen
          
          // Check if asesmen has started
          if (asesmenData.tgl_mulai && new Date(asesmenData.tgl_mulai) > new Date()) {
            showError("Belum Dimulai", "Kuis ini belum bisa dimulai")
            router.push(`/courses/${courseId}/asesmen/${asesmenId}`)
            return
          }
          
          // Check if deadline has passed
          if (asesmenData.tgl_selesai && new Date(asesmenData.tgl_selesai) < new Date()) {
            showError("Sudah Ditutup", "Kuis ini sudah ditutup")
            router.push(`/courses/${courseId}/asesmen/${asesmenId}`)
            return
          }
          
          setAsesmen(asesmenData)
          
          // Check if already submitted
          if (asesmenData.nilai && asesmenData.nilai.length > 0) {
            setHasSubmitted(true)
          }
          
          // Initialize jawaban array
          if (asesmenData.soal) {
            setJawaban(asesmenData.soal.map((s: Soal) => ({
              soalId: s.id,
              jawaban: ''
            })))
          }
          
          // Start timer if durasi is set
          if (data.asesmen.durasi) {
            setTimeLeft(data.asesmen.durasi * 60) // Convert to seconds
            setStartTime(new Date())
          }
        } else {
          router.push(`/courses/${courseId}`)
        }
      } catch (error) {
        console.error('Error fetching asesmen:', error)
        router.push(`/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, router, asesmenId, courseId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || hasSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Auto submit when time runs out
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, hasSubmitted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleJawabanChange = (soalId: string, value: string) => {
    setJawaban(prev => prev.map(j => 
      j.soalId === soalId ? { ...j, jawaban: value } : j
    ))
  }

  const handleNext = () => {
    if (asesmen?.soal && currentSoalIndex < asesmen.soal.length - 1) {
      setCurrentSoalIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSoalIndex > 0) {
      setCurrentSoalIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async (autoSubmit = false) => {
    const confirmed = autoSubmit || await confirm(
      "Kumpulkan Kuis?",
      {
        description: "Apakah Anda yakin ingin mengumpulkan kuis ini? Jawaban tidak dapat diubah setelah dikumpulkan.",
        confirmText: "Kumpulkan",
        cancelText: "Batal",
        type: "warning",
        onConfirm: async () => {
          try {
            const payload = {
              siswaId: user?.id,
              jawaban: jawaban,
              waktuMulai: startTime,
              waktuSelesai: new Date(),
            }
            
            const response = await fetch(`/api/asesmen/${asesmenId}/submit-kuis`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            
            const responseData = await response.json()
            
            if (!response.ok) {
              throw new Error(responseData.error || "Gagal mengumpulkan kuis")
            }
            
            return responseData
          } catch (error) {
            console.error('Error submitting:', error)
            throw error
          }
        }
      }
    )
    
    if (confirmed || autoSubmit) {
      success(
        "Berhasil!",
        autoSubmit 
          ? "Waktu habis! Kuis telah dikumpulkan secara otomatis." 
          : "Kuis berhasil dikumpulkan"
      )
      setTimeout(() => {
        router.push(`/courses/${courseId}/asesmen/${asesmenId}`)
      }, 2000)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!asesmen || !asesmen.soal || asesmen.soal.length === 0) {
    return (
      <div className="w-full py-6 sm:py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kuis tidak ditemukan atau belum memiliki soal.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/courses/${courseId}/asesmen/${asesmenId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
    )
  }

  if (hasSubmitted) {
    return (
      <div className="w-full py-6 sm:py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Kuis Sudah Dikumpulkan</CardTitle>
            </div>
            <CardDescription>
              Anda sudah mengumpulkan kuis ini. Lihat nilai Anda di halaman detail asesmen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/courses/${courseId}/asesmen/${asesmenId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Detail Asesmen
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentSoal = asesmen.soal[currentSoalIndex]
  const currentJawaban = jawaban.find(j => j.soalId === currentSoal.id)
  const answeredCount = jawaban.filter(j => j.jawaban !== '').length
  const progress = (answeredCount / asesmen.soal.length) * 100

  return (
    <div className="w-full py-6 sm:py-8 space-y-6">
      <AlertComponent />
      
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">{asesmen.nama}</h1>
        {timeLeft !== null && (
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${timeLeft < 60 ? 'text-red-600' : 'text-muted-foreground'}`} />
            <span className={`text-lg font-mono ${timeLeft < 60 ? 'text-red-600 font-bold' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progres: {answeredCount} / {asesmen.soal.length} soal</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Soal {currentSoalIndex + 1} / {asesmen.soal.length}</Badge>
              <Badge variant="outline">{currentSoal.bobot} poin</Badge>
              <Badge variant={currentSoal.tipeJawaban === 'PILIHAN_GANDA' ? 'default' : 'secondary'}>
                {currentSoal.tipeJawaban === 'PILIHAN_GANDA' ? 'Pilihan Ganda' : 'Isian'}
              </Badge>
            </div>
          </div>
          <CardTitle className="mt-4">{currentSoal.pertanyaan}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSoal.tipeJawaban === 'PILIHAN_GANDA' ? (
            <RadioGroup
              value={currentJawaban?.jawaban || ''}
              onValueChange={(value) => handleJawabanChange(currentSoal.id, value)}
            >
              {currentSoal.opsi.map((opsi) => (
                <div key={opsi.id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value={opsi.id} id={opsi.id} />
                  <Label htmlFor={opsi.id} className="flex-1 cursor-pointer">
                    {opsi.teks}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="jawaban-isian">Jawaban Anda</Label>
              <Textarea
                id="jawaban-isian"
                value={currentJawaban?.jawaban || ''}
                onChange={(e) => handleJawabanChange(currentSoal.id, e.target.value)}
                placeholder="Tulis jawaban Anda di sini..."
                rows={6}
              />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Soal isian akan dinilai secara manual oleh guru.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSoalIndex === 0}
            >
              Sebelumnya
            </Button>
            
            {currentSoalIndex === asesmen.soal.length - 1 ? (
              <Button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengumpulkan...
                  </>
                ) : (
                  'Kumpulkan Kuis'
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Selanjutnya
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Navigasi Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {asesmen.soal.map((soal: Soal, index: number) => {
              const isAnswered = jawaban.find(j => j.soalId === soal.id)?.jawaban !== ''
              const isCurrent = index === currentSoalIndex
              
              return (
                <Button
                  key={soal.id}
                  variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSoalIndex(index)}
                  className="h-10 w-full"
                >
                  {index + 1}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
