"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function BackButton() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId")

  const backHref = courseId 
    ? `/courses/${courseId}?tab=assessments` 
    : "/asesmen"
  
  const backText = courseId 
    ? "Kembali ke Course" 
    : "Kembali ke Daftar Asesmen"

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href={backHref}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {backText}
      </Link>
    </Button>
  )
}
