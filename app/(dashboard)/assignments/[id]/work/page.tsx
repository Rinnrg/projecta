import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import WorkAsesmenClient from "./work-asesmen-client"

interface PageProps {
  params: Promise<{ 
    id: string
  }>
}

export default async function WorkAsesmenPage({ params }: PageProps) {
  const { id } = await params

  // TODO: Implement proper authentication check
  // For now, we'll let the client component handle authentication
  
  try {
    // Fetch asesmen with questions and options
    const asesmen = await prisma.asesmen.findUnique({
      where: { id },
      include: {
        soal: {
          include: {
            opsi: {
              select: {
                id: true,
                teks: true,
              },
            },
          },
        },
        guru: {
          select: {
            id: true,
            nama: true,
          },
        },
        course: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    })

    if (!asesmen) {
      notFound()
    }

    return (
      <WorkAsesmenClient 
        asesmen={asesmen}
      />
    )
  } catch (error) {
    console.error("Error fetching asesmen:", error)
    notFound()
  }
}
