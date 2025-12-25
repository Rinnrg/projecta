"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AddAsesmenForm from "./add-asesmen-form"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: { id: string }
}

export default function AddAsesmenPage({ params }: PageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<{ id: string; judul: string } | null>(null)
  const [loading, setLoading] = useState(true)

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

    // Fetch course data
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCourse(data.course)
        } else {
          router.push('/courses')
        }
      } catch (error) {
        console.error('Error fetching course:', error)
        router.push('/courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [user, isLoading, router, params.id])

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!course) {
    return null
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
