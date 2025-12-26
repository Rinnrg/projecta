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

  return <EditMateriClient materi={materi} />
}
