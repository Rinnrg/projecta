"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: Promise<{ 
    asesmenId: string
  }>
}

// Redirect route untuk backward compatibility
// Route yang benar: /courses/[courseId]/asesmen/[asesmenId]
export default function AsesmenRedirectPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { asesmenId } = resolvedParams

  useEffect(() => {
    // Fetch asesmen untuk mendapatkan courseId
    const fetchAndRedirect = async () => {
      try {
        const response = await fetch(`/api/asesmen/${asesmenId}`)
        if (response.ok) {
          const data = await response.json()
          const courseId = data.asesmen.courseId
          // Redirect ke route yang benar
          router.replace(`/courses/${courseId}/asesmen/${asesmenId}`)
        } else {
          // Jika gagal, redirect ke dashboard
          router.replace('/dashboard')
        }
      } catch (error) {
        console.error('Error fetching asesmen:', error)
        router.replace('/dashboard')
      }
    }

    fetchAndRedirect()
  }, [asesmenId, router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Mengalihkan...</p>
      </div>
    </div>
  )
}
