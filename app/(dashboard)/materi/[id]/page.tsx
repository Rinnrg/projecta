import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MateriDetailClient from "./materi-detail-client"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ 
    id: string
    materiId: string
  }>
  searchParams: Promise<{ mode?: string }>
}

export default async function MateriDetailPage({ params, searchParams }: PageProps) {
  const { id: courseId, materiId } = await params
  const { mode } = await searchParams

  try {
    // Fetch materi with course details
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
      include: {
        course: {
          include: {
            guru: {
              select: {
                id: true,
                nama: true,
                email: true,
                foto: true,
              },
            },
          },
        },
      },
    })

    if (!materi || materi.courseId !== courseId) {
      notFound()
    }

    // Fetch all materi from the same course for sidebar
    const allMateri = await prisma.materi.findMany({
      where: { courseId },
      orderBy: { tgl_unggah: 'asc' },
      select: {
        id: true,
        judul: true,
        tgl_unggah: true,
      },
    })

    return (
      <MateriDetailClient 
        materi={materi}
        allMateri={allMateri}
        courseId={courseId}
      />
    )
  } catch (error) {
    console.error("Error fetching materi:", error)
    notFound()
  }
}
