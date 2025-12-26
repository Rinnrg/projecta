"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { FileUploadField } from "@/components/file-upload-field"
import { AnimateIn } from "@/components/ui/animate-in"

export default function CreateProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { error: showError, success: showSuccess, AlertComponent } = useSweetAlert()
  const [judul, setJudul] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [lampiran, setLampiran] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showError("Error", "You must be logged in to create a project")
      return
    }

    // Validasi form
    if (!judul.trim()) {
      showError("Error", "Project title is required")
      return
    }

    if (!deskripsi.trim()) {
      showError("Error", "Project description is required")
      return
    }

    if (!startDate) {
      showError("Error", "Start date is required")
      return
    }

    if (!endDate) {
      showError("Error", "End date is required")
      return
    }

    if (endDate < startDate) {
      showError("Error", "End date must be after start date")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/proyek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          tgl_mulai: startDate.toISOString(),
          tgl_selesai: endDate.toISOString(),
          lampiran: lampiran || null,
          guruId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project")
      }

      await showSuccess("Success!", "Project created successfully")
      router.push("/projects")
      router.refresh()
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error creating project:", error)
      showError("Error", error instanceof Error ? error.message : "Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AlertComponent />
      
      <AnimateIn stagger={0}>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </AnimateIn>

      <AnimateIn stagger={1}>
        <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Create a project assignment for your students</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="judul">Project Title</Label>
              <Input
                id="judul"
                placeholder="e.g., E-Commerce Website"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Description</Label>
              <Textarea
                id="deskripsi"
                placeholder="Describe the project requirements, deliverables, and grading criteria..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={6}
                required
              />
            </div>

            <FileUploadField
              label="Attachment / Resource Link (Optional)"
              value={lampiran}
              onChange={setLampiran}
              accept="*/*"
              description="Upload file atau masukkan link ke project resources, guidelines, atau reference materials"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 bg-transparent" 
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </AnimateIn>
    </div>
  )
}
