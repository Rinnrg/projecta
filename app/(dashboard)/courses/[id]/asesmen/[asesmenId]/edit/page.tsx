"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AsesmenEditForm } from "@/components/asesmen-edit-form"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: Promise<{ 
    id: string
    asesmenId: string
  }>
}

export default function EditAsesmenPage({ params }: PageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  const { id: courseId, asesmenId } = resolvedParams

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'GURU' && user.role !== 'ADMIN') {
      router.push('/courses')
      return
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Edit Asesmen</h1>
        <p className="text-muted-foreground">
          Perbarui informasi asesmen
        </p>
      </div>

      <AsesmenEditForm asesmenId={asesmenId} courseId={courseId} />
    </div>
  )
}
