import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MateriNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-muted">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Materi Tidak Ditemukan</h1>
          <p className="text-muted-foreground">
            Materi yang Anda cari tidak dapat ditemukan atau telah dihapus.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">Kembali ke Daftar Kursus</Link>
        </Button>
      </div>
    </div>
  )
}
