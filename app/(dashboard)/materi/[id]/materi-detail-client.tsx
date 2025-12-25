"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  BookOpen, 
  PlayCircle, 
  FileText, 
  ChevronRight, 
  Download, 
  Link as LinkIcon,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { useAutoTranslate } from "@/lib/auto-translate-context"

interface MateriDetailClientProps {
  materi: {
    id: string
    judul: string
    deskripsi: string | null
    tgl_unggah: Date
    lampiran: string | null
    courseId: string
    course: {
      id: string
      judul: string
      guru: {
        id: string
        nama: string
        email: string
        foto: string | null
      }
    }
  }
  allMateri: {
    id: string
    judul: string
    tgl_unggah: Date
  }[]
  courseId: string
}

export default function MateriDetailClient({ materi, allMateri, courseId }: MateriDetailClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useAutoTranslate()
  const { confirm, success: showSuccess, error: showError, AlertComponent } = useSweetAlert()
  const [selectedMateriId, setSelectedMateriId] = useState(materi.id)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    judul: materi.judul,
    deskripsi: materi.deskripsi || "",
    lampiran: materi.lampiran || "",
  })

  const isTeacherOrAdmin = user?.role === "GURU" || user?.role === "ADMIN"

  const getFileIcon = (url: string | null) => {
    if (!url) return <FileText className="h-6 w-6" />
    if (url.includes("youtube") || url.endsWith(".mp4")) return <PlayCircle className="h-6 w-6" />
    if (url.endsWith(".pdf")) return <FileText className="h-6 w-6" />
    return <LinkIcon className="h-6 w-6" />
  }

  const getBgColor = (url: string | null) => {
    if (!url) return "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
    if (url.includes("youtube")) return "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
    if (url.endsWith(".pdf")) return "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
    return "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
  }

  const handleDeleteMateri = async () => {
    const confirmed = await confirm(t("Hapus Materi"), {
      description: t(`Apakah Anda yakin ingin menghapus materi "${materi.judul}"?`),
      confirmText: t("Hapus"),
      cancelText: t("Batal"),
      type: "warning",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/materi/${materi.id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Gagal menghapus materi")
          }
        } catch (error) {
          console.error("Error deleting materi:", error)
          throw error
        }
      },
    })

    if (confirmed) {
      showSuccess(t("Berhasil"), t(`Materi "${materi.judul}" berhasil dihapus`))
      router.push(`/courses/${courseId}`)
    }
  }

  const handleMateriChange = (materiId: string) => {
    setSelectedMateriId(materiId)
    router.push(`/materi/${materiId}?courseId=${courseId}`)
  }

  const handleEditMateri = async () => {
    if (!editForm.judul.trim()) {
      showError(t("Error"), t("Judul materi harus diisi"))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/materi/${materi.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error("Gagal mengupdate materi")
      }

      showSuccess(t("Berhasil"), t("Materi berhasil diupdate"))
      setEditDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating materi:", error)
      showError(t("Error"), t("Gagal mengupdate materi"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 sm:-m-8">
      <AlertComponent />

      {/* Edit Materi Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("Edit Materi")}</DialogTitle>
            <DialogDescription>
              {t("Perbarui informasi materi pembelajaran")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-judul">{t("Judul Materi")} *</Label>
              <Input
                id="edit-judul"
                value={editForm.judul}
                onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
                placeholder={t("Masukkan judul materi")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deskripsi">{t("Deskripsi")}</Label>
              <Textarea
                id="edit-deskripsi"
                value={editForm.deskripsi}
                onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                placeholder={t("Masukkan deskripsi materi")}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lampiran">{t("Lampiran URL")}</Label>
              <Input
                id="edit-lampiran"
                value={editForm.lampiran}
                onChange={(e) => setEditForm({ ...editForm, lampiran: e.target.value })}
                placeholder={t("Masukkan URL lampiran (PDF, Video, dll)")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
              {t("Batal")}
            </Button>
            <Button onClick={handleEditMateri} disabled={isSubmitting}>
              {isSubmitting ? t("Menyimpan...") : t("Simpan Perubahan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar - Materi List */}
      <div className="w-80 border-r bg-card/50 flex flex-col hidden lg:flex">
        <div className="p-4 sm:p-6 border-b">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link href={`/courses/${courseId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Kembali ke Kursus")}
            </Link>
          </Button>
          <h2 className="font-semibold text-lg mb-1">{t("Daftar Materi")}</h2>
          <p className="text-sm text-muted-foreground">{t("Pilih materi untuk melihat detail")}</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 sm:p-4 space-y-2">
            {allMateri.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMateriChange(m.id)}
                className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all hover:border-primary/50 ${
                  selectedMateriId === m.id
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-background border-transparent hover:bg-accent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-medium line-clamp-2 text-sm ${selectedMateriId === m.id ? "text-primary" : ""}`}>
                    {m.judul}
                  </span>
                  {selectedMateriId === m.id && <ChevronRight className="h-4 w-4 text-primary shrink-0 ml-2" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.tgl_unggah).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Materi Detail */}
      <div className="flex-1 overflow-auto bg-muted/10">
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Mobile Back Button */}
          <div className="lg:hidden">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${courseId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Kembali")}
              </Link>
            </Button>
          </div>

          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                    {t("Materi Pembelajaran")}
                  </Badge>
                  <Badge variant="secondary">
                    {new Date(materi.tgl_unggah).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{materi.judul}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("Oleh")}: {materi.course.guru.nama}
                </p>
              </div>

              {isTeacherOrAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("Edit Materi")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={handleDeleteMateri}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("Hapus")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {materi.deskripsi || t("Tidak ada deskripsi")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Lampiran Section */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {t("Lampiran & Sumber Belajar")}
            </h3>

            {materi.lampiran ? (
              <div className="grid gap-4">
                <Card className="group hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-lg shrink-0 ${getBgColor(materi.lampiran)}`}>
                      {getFileIcon(materi.lampiran)}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <h4 className="font-medium leading-none group-hover:text-primary transition-colors">
                        {t("Lihat Lampiran Materi")}
                      </h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="truncate">{materi.lampiran}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      asChild
                    >
                      <a href={materi.lampiran} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        {t("Buka")}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg">{t("Belum ada lampiran")}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                  {t("Pengajar tidak menyertakan file lampiran untuk materi ini")}
                </p>
              </div>
            )}
          </div>

          {/* Course Info Card */}
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold mb-4">{t("Informasi Kursus")}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t("Nama Kursus")}</p>
                  <p className="font-medium">{materi.course.judul}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">{t("Pengajar")}</p>
                  <p className="font-medium">{materi.course.guru.nama}</p>
                  <p className="text-sm text-muted-foreground">{materi.course.guru.email}</p>
                </div>
                <Separator />
                <Button className="w-full" asChild>
                  <Link href={`/courses/${courseId}`}>
                    {t("Kembali ke Kursus")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
