"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, 
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import Link from "next/link"

interface AddSoalFormProps {
  asesmenId: string
  asesmenNama: string
  courseTitle: string
  currentSoalCount: number
}

interface Opsi {
  id: string
  teks: string
  isBenar: boolean
}

export default function AddSoalForm({ 
  asesmenId, 
  asesmenNama, 
  courseTitle,
  currentSoalCount,
}: AddSoalFormProps) {
  const router = useRouter()
  const { success, error: showError, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [pertanyaan, setPertanyaan] = useState("")
  const [bobot, setBobot] = useState("10")
  const [opsi, setOpsi] = useState<Opsi[]>([
    { id: "1", teks: "", isBenar: false },
    { id: "2", teks: "", isBenar: false },
    { id: "3", teks: "", isBenar: false },
    { id: "4", teks: "", isBenar: false },
  ])
  const [correctAnswerId, setCorrectAnswerId] = useState<string>("")

  const handleAddOpsi = () => {
    if (opsi.length >= 6) {
      showError("Error", "Maksimal 6 pilihan jawaban")
      return
    }
    const newId = (opsi.length + 1).toString()
    setOpsi([...opsi, { id: newId, teks: "", isBenar: false }])
  }

  const handleRemoveOpsi = (id: string) => {
    if (opsi.length <= 2) {
      showError("Error", "Minimal 2 pilihan jawaban")
      return
    }
    setOpsi(opsi.filter(o => o.id !== id))
    if (correctAnswerId === id) {
      setCorrectAnswerId("")
    }
  }

  const handleOpsiChange = (id: string, value: string) => {
    setOpsi(opsi.map(o => o.id === id ? { ...o, teks: value } : o))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pertanyaan.trim()) {
      showError("Error", "Pertanyaan harus diisi")
      return
    }

    if (!bobot || parseInt(bobot) <= 0) {
      showError("Error", "Poin harus lebih dari 0")
      return
    }

    // Check all options filled
    const emptyOpsi = opsi.filter(o => !o.teks.trim())
    if (emptyOpsi.length > 0) {
      showError("Error", "Semua pilihan jawaban harus diisi")
      return
    }

    // Check correct answer selected
    if (!correctAnswerId) {
      showError("Error", "Pilih jawaban yang benar")
      return
    }

    try {
      setIsLoading(true)

      // Update opsi dengan jawaban benar
      const finalOpsi = opsi.map(o => ({
        teks: o.teks,
        isBenar: o.id === correctAnswerId,
      }))

      const response = await fetch(`/api/asesmen/${asesmenId}/soal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pertanyaan,
          bobot: parseInt(bobot),
          opsi: finalOpsi,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal menambah soal")
      }

      success("Berhasil!", "Soal berhasil ditambahkan")
      
      setTimeout(() => {
        router.push(`/asesmen/${asesmenId}`)
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error adding question:", error)
      showError("Error", error instanceof Error ? error.message : "Gagal menambah soal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AlertComponent />
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={`/asesmen/${asesmenId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Detail Kuis
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Tambah Soal Baru</h1>
              <p className="text-muted-foreground mt-1">
                {asesmenNama} • {courseTitle}
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Soal #{currentSoalCount + 1}
            </Badge>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pertanyaan</CardTitle>
              <CardDescription>
                Tulis pertanyaan kuis dengan jelas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pertanyaan */}
              <div className="space-y-2">
                <Label htmlFor="pertanyaan">
                  Pertanyaan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="pertanyaan"
                  placeholder="Contoh: Apa itu JavaScript?"
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className="resize-none"
                  required
                />
              </div>

              {/* Poin */}
              <div className="space-y-2">
                <Label htmlFor="bobot">
                  Poin <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="bobot"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="10"
                    value={bobot}
                    onChange={(e) => setBobot(e.target.value)}
                    disabled={isLoading}
                    required
                    className="max-w-[150px]"
                  />
                  <span className="text-sm text-muted-foreground">
                    poin
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Soal dengan poin lebih tinggi akan memiliki bobot nilai lebih besar
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pilihan Jawaban</CardTitle>
                  <CardDescription>
                    Tambahkan pilihan jawaban dan pilih jawaban yang benar
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOpsi}
                  disabled={isLoading || opsi.length >= 6}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Opsi
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={correctAnswerId} onValueChange={setCorrectAnswerId}>
                {opsi.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      correctAnswerId === item.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem 
                        value={item.id} 
                        id={`opsi-${item.id}`}
                        className="mt-3"
                      />
                      <div className="flex-1 space-y-2">
                        <Label 
                          htmlFor={`input-${item.id}`}
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          Opsi {String.fromCharCode(65 + index)}
                          {correctAnswerId === item.id && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Jawaban Benar
                            </Badge>
                          )}
                        </Label>
                        <Input
                          id={`input-${item.id}`}
                          placeholder={`Jawaban ${String.fromCharCode(65 + index)}`}
                          value={item.teks}
                          onChange={(e) => handleOpsiChange(item.id, e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      {opsi.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOpsi(item.id)}
                          disabled={isLoading}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {!correctAnswerId && opsi.length > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Pilih salah satu jawaban yang benar dengan klik radio button
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Simpan Soal
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/asesmen/${asesmenId}`)}
              disabled={isLoading}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
