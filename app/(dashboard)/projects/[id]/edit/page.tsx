"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { toast } from "@/hooks/use-toast"

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const projectId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [judul, setJudul] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [lampiran, setLampiran] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/proyek/${projectId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }
        
        const data = await response.json()
        const project = data.proyek
        
        setJudul(project.judul || "")
        setDeskripsi(project.deskripsi || "")
        setLampiran(project.lampiran || "")
        
        if (project.tgl_mulai) {
          setStartDate(new Date(project.tgl_mulai))
        }
        if (project.tgl_selesai) {
          setEndDate(new Date(project.tgl_selesai))
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a project",
        variant: "destructive",
      })
      return
    }

    // Validasi form
    if (!judul.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      })
      return
    }

    if (!deskripsi.trim()) {
      toast({
        title: "Error",
        description: "Project description is required",
        variant: "destructive",
      })
      return
    }

    if (!startDate) {
      toast({
        title: "Error",
        description: "Start date is required",
        variant: "destructive",
      })
      return
    }

    if (!endDate) {
      toast({
        title: "Error",
        description: "End date is required",
        variant: "destructive",
      })
      return
    }

    if (endDate < startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/proyek/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          tgl_mulai: startDate.toISOString(),
          tgl_selesai: endDate.toISOString(),
          lampiran: lampiran || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update project")
      }

      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/projects/${projectId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
          <CardDescription>Update project information</CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="lampiran">Attachment Link (Optional)</Label>
              <Input
                id="lampiran"
                type="url"
                placeholder="https://..."
                value={lampiran}
                onChange={(e) => setLampiran(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Add a link to project resources, guidelines, or reference materials
              </p>
            </div>

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
                    Updating...
                  </>
                ) : (
                  "Update Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
