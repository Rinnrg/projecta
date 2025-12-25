import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ArrowLeft } from "lucide-react"

export default function CourseNotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Kursus Tidak Ditemukan</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Kursus yang Anda cari tidak ditemukan atau mungkin sudah dihapus.
          </p>
          <Button asChild className="mt-6">
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Kursus
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
