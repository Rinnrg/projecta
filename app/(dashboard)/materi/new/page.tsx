import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AddMateriForm from "./add-materi-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AddMateriPage({ params }: PageProps) {
  const { id } = await params

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      judul: true,
    },
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="container max-w-3xl py-6 sm:py-8">
      <AddMateriForm courseId={course.id} courseTitle={course.judul} />
    </div>
  )
}
