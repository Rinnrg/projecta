import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditMateriClient from "@/app/(dashboard)/materi/[id]/edit/edit-materi-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMateriPage({ params }: PageProps) {
  const resolvedParams = await params
  const materiId = resolvedParams.id

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

  return <EditMateriClient materi={materi} />
}
