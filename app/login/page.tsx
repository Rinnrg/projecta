"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, GraduationCap, Shield, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, isLoading: authLoading, setUser, setUserRole } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (user) {
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email dan password harus diisi")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Set user data dari database
        setUser({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          nama: data.user.nama,
          role: data.user.role,
          foto: data.user.foto,
          createdAt: new Date(data.user.createdAt || Date.now()),
        })
        router.push("/dashboard")
      } else {
        setError(data.error || "Email atau password salah")
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("Terjadi kesalahan saat login")
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (role: "SISWA" | "GURU" | "ADMIN") => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 400))
    setUserRole(role)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">

      <Card className="w-full max-w-sm border-border/60 shadow-sm animate-fade-in">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold">Masuk</CardTitle>
          <CardDescription className="text-sm">Masukkan email untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-9 text-sm transition-all duration-150 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-9 text-sm transition-all duration-150 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-150"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive animate-scale-in">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-border accent-primary" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-150">
                  Ingat saya
                </span>
              </label>
              <button
                type="button"
                className="text-primary hover:text-primary/80 hover:underline transition-colors duration-150"
              >
                Lupa password?
              </button>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-9 text-sm">
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Masuk
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-[10px] uppercase text-muted-foreground">atau masuk sebagai</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
