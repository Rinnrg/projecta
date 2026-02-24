"use client"

import { useRouter } from "next/navigation"
import PythonCompiler from "@/components/python-compiler"
import { AnimateIn } from "@/components/ui/animate-in"

export default function CompilerPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <AnimateIn stagger={0}>
      <div className="h-[calc(100vh-4rem)] -mx-4 -my-5 sm:-mx-6 sm:-my-6 md:-mx-8 rounded-none md:rounded-xl md:mx-0 md:my-0 md:h-[calc(100vh-5rem)] overflow-hidden md:border md:border-border/50 md:shadow-sm">
        <PythonCompiler onBack={handleBack} />
      </div>
    </AnimateIn>
  )
}
