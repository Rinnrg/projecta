"use client"

import type React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    redirect("/login")
  }

  return <AppShell>{children}</AppShell>
}
