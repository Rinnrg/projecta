"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  courseId?: string
}

export default function BackButton({ courseId }: BackButtonProps) {
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
