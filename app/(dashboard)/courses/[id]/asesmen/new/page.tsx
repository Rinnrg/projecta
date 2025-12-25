import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import AddAsesmenForm from "./add-asesmen-form"

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

  // Only GURU and ADMIN can create asesmen
  if (user.role !== 'GURU' && user.role !== 'ADMIN') {
    redirect('/courses')
  }

  return user
}

export default async function AddAsesmenPage({ params }: PageProps) {
  const { id: courseId } = await params
  const user = await getUser()

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      judul: true,
    },
  })

  if (!course) {
    redirect('/courses')
  }

  return (
    <div className="container max-w-3xl py-6 sm:py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Buat Asesmen Baru</h1>
        <p className="text-muted-foreground">
          Buat asesmen (kuis atau tugas) untuk course {course.judul}
        </p>
      </div>
      <AddAsesmenForm courseId={course.id} courseTitle={course.judul} />
    </div>
  )
}
