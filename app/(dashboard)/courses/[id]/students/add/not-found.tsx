import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="w-full">

      <Card className="border-destructive/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Course Tidak Ditemukan</CardTitle>
          <CardDescription>
            Course yang Anda cari tidak ditemukan atau telah dihapus
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Gunakan tombol kembali di pojok kiri atas untuk kembali ke dashboard
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
