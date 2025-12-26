import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditProyekClient from "./client"

const SINTAKS_MAP: Record<string, string> = {
  sintaks_1: "Orientasi Masalah",
  sintaks_2: "Menyusun Rencana Proyek",
  sintaks_3: "Membuat Jadwal Proyek",
  sintaks_4: "Monitoring Pelaksanaan",
  sintaks_5: "Pengumpulan Proyek",
  sintaks_6: "Presentasi Proyek",
  sintaks_7: "Penilaian dan Evaluasi",
  sintaks_8: "Refleksi",
}

export default async function EditProyekPage({ params }: { params: Promise<{ sintaks: string }> }) {
  const resolvedParams = await params

  const judulProyek = SINTAKS_MAP[resolvedParams.sintaks] || "Tahapan Proyek"

  // Cari proyek berdasarkan judul (setiap sintaks hanya punya 1 proyek)
  const proyek = await prisma.proyek.findFirst({
    where: { judul: judulProyek },
    include: { guru: { select: { nama: true } } }
  })

  if (!proyek) {
    redirect(`/projects/${resolvedParams.sintaks}`)
  }

  return (
    <EditProyekClient 
      proyek={proyek} 
      sintaks={resolvedParams.sintaks}
      judulProyek={judulProyek}
    />
  )
}
