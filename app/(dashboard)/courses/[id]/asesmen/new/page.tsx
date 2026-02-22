"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AddAsesmenForm from "./add-asesmen-form"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AddAsesmenPage({ params }: PageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Unwrap the Promise using React's use() hook
  const resolvedParams = use(params)
  const courseId = resolvedParams.id

  useEffect(() => {
    // Check authentication and authorization
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'GURU' && user.role !== 'ADMIN') {
      router.push('/courses')
      return
    }
  }, [user, isLoading, router, resolvedParams, courseId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || (user.role !== 'GURU' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="w-full py-6 sm:py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Buat Asesmen Baru</h1>
        <p className="text-muted-foreground">
          Buat asesmen (kuis atau tugas) untuk course ini
        </p>
      </div>
      <AddAsesmenForm courseId={courseId} courseTitle="" />
    </div>
  )
}
