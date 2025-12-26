"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: Promise<{ 
    asesmenId: string
    pengumpulanId: string
  }>
}

export default function PengumpulanRedirectPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { asesmenId, pengumpulanId } = resolvedParams

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const asesmenRes = await fetch(`/api/asesmen/${asesmenId}`)
        if (asesmenRes.ok) {
          const asesmenData = await asesmenRes.json()
          const courseId = asesmenData.asesmen.courseId
          router.replace(`/courses/${courseId}/asesmen/${asesmenId}/pengumpulan/${pengumpulanId}`)
        } else {
          router.replace("/dashboard")
        }
      } catch (error) {
        console.error("Error:", error)
        router.replace("/dashboard")
      }
    }
    fetchAndRedirect()
  }, [asesmenId, pengumpulanId, router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
