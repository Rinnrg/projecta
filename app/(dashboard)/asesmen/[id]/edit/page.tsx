import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { AsesmenEditForm } from "@/components/asesmen-edit-form"

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

  // Only GURU and ADMIN can edit asesmen
  if (user.role !== 'GURU' && user.role !== 'ADMIN') {
    redirect('/asesmen')
  }

  return user
}

export default async function EditAsesmenPage({ params }: { params: { id: string } }) {
  const user = await getUser()

  return (
    <div className="container py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Edit Asesmen</h1>
        <p className="text-muted-foreground">
          Perbarui informasi asesmen
        </p>
      </div>

      <AsesmenEditForm asesmenId={params.id} />
    </div>
  )
}
