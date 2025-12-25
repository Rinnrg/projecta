import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditMateriClient from "./edit-materi-client"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMateriPage({ params }: PageProps) {
  const { id } = await params

  try {
    const materi = await prisma.materi.findUnique({
      where: { id },
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
  } catch (error) {
    console.error("Error fetching materi:", error)
    notFound()
  }
}
