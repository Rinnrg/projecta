import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import SubmitTugasForm from "./submit-tugas-form"

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

export default async function SubmitTugasPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser()

  // Only students can submit
  if (user.role !== 'SISWA') {
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
    },
  })

  if (!asesmen) {
    notFound()
  }

  // Check if it's a task (TUGAS)
  if (asesmen.tipe !== 'TUGAS') {
    redirect(`/asesmen/${id}`)
  }

  // Check if already submitted
  const existingSubmission = await prisma.pengumpulanTugas.findFirst({
    where: {
      asesmenId: id,
      siswaId: user.id,
    },
  })

  // Check deadline
  const isDeadlinePassed = asesmen.tgl_selesai 
    ? new Date(asesmen.tgl_selesai) < new Date() 
    : false

  return (
    <div className="container max-w-3xl py-6 sm:py-8">
      <SubmitTugasForm 
        asesmen={asesmen}
        user={user}
        existingSubmission={existingSubmission}
        isDeadlinePassed={isDeadlinePassed}
      />
    </div>
  )
}
