import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import AddSoalForm from "./add-soal-form"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  if (!userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return user
}

export default async function AddSoalPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser()

  // Only teachers and admins can add questions
  if (user.role !== 'GURU' && user.role !== 'ADMIN') {
    redirect(`/asesmen/${id}`)
  }

  const asesmen = await prisma.asesmen.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          judul: true,
        },
      },
      soal: true,
    },
  })

  if (!asesmen) {
    notFound()
  }

  // Check if it's a quiz
  if (asesmen.tipe !== 'KUIS') {
    redirect(`/asesmen/${id}`)
  }

  // Check permission
  if (user.role === 'GURU' && asesmen.guruId !== user.id) {
    redirect(`/asesmen/${id}`)
  }

  return (
    <div className="container max-w-4xl py-6 sm:py-8">
      <AddSoalForm 
        asesmenId={asesmen.id}
        asesmenNama={asesmen.nama}
        courseTitle={asesmen.course.judul}
        currentSoalCount={asesmen.soal.length}
      />
    </div>
  )
}
