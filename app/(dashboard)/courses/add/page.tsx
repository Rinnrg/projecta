"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, X, ImageIcon } from "lucide-react"
import Link from "next/link"

const categories = ["Programming", "Database", "Design", "Networking", "Security", "DevOps"]

export default function AddCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to database
    router.push("/courses")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <CardDescription>Fill in the details below to create a new course for your students</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              {thumbnail ? (
                <div className="relative aspect-video overflow-hidden rounded-lg border">
                  <img
                    src={thumbnail || "/placeholder.svg"}
                    alt="Course thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => setThumbnail(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50"
                  onClick={() => setThumbnail("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop")}
                >
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload thumbnail</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Web Development"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn in this course..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Course
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
