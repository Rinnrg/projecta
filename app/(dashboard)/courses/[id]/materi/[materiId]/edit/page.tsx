import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditMateriClient from "./edit-materi-client"

interface PageProps {
  params: Promise<{ id: string; materiId: string }>
}

export default async function EditMateriPage({ params }: PageProps) {
  const resolvedParams = await params
  const courseId = resolvedParams.id
  const materiId = resolvedParams.materiId

  // Fetch materi data
  const materi = await prisma.materi.findUnique({
    where: { id: materiId },
    include: {
      course: {
        select: {
          id: true,
          judul: true,
        },
      },
    },
  })

  if (!materi) {
    notFound()
  }

  // Check if materi belongs to this course
  if (materi.courseId !== courseId) {
    notFound()
  }

  // Transform data for client component - exclude binary data
  const materiForClient = {
    id: materi.id,
    judul: materi.judul,
    deskripsi: materi.deskripsi,
    lampiran: materi.lampiran,
    fileName: materi.fileName,
    fileType: materi.fileType,
    fileSize: materi.fileSize,
    tgl_unggah: materi.tgl_unggah,
    courseId: materi.courseId,
    course: materi.course,
    // Don't send binary fileData to client component
    hasFile: materi.fileData !== null && materi.fileType !== null,
  }

  return <EditMateriClient materi={materiForClient} />
}
