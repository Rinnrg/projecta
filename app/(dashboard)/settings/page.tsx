"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Settings has been merged into the Profile page
export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/profile")
  }, [router])

  return null
}
