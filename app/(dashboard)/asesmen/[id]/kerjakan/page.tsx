import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import KerjakanKuisClient from "./kerjakan-kuis-client"

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

export default async function KerjakanKuisPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser()

  // Only students can access this page
  if (user.role !== 'SISWA') {
    redirect(`/asesmen/${id}`)
  }

  const asesmen = await prisma.asesmen.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          judul: true,
          kategori: true,
        },
      },
      soal: {
        include: {
          opsi: true,
        },
        orderBy: {
          id: 'asc',
        },
      },
    },
  })

  if (!asesmen) {
    notFound()
  }

  // Check if it's a quiz
  if (asesmen.tipe !== 'KUIS') {
    redirect(`/asesmen/${id}/submit`)
  }

  // Check if already submitted
  const existingNilai = await prisma.nilai.findFirst({
    where: {
      asesmenId: id,
      siswaId: user.id,
    },
  })

  // Check if deadline passed
  const isDeadlinePassed = asesmen.tgl_selesai 
    ? new Date(asesmen.tgl_selesai) < new Date() 
    : false

  // Check if not yet started
  const notYetStarted = asesmen.tgl_mulai
    ? new Date(asesmen.tgl_mulai) > new Date()
    : false

  return (
    <KerjakanKuisClient 
      asesmen={asesmen}
      user={user}
      existingNilai={existingNilai}
      isDeadlinePassed={isDeadlinePassed}
      notYetStarted={notYetStarted}
    />
  )
}
