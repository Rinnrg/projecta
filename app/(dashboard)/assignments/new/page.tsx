"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { mockCourses } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  pertanyaan: string
  bobot: number
  opsi: { id: string; teks: string; isBenar: boolean }[]
}

export default function CreateAssessmentPage() {
  const router = useRouter()
  const [nama, setNama] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [courseId, setCourseId] = useState("")
  const [durasi, setDurasi] = useState("30")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      pertanyaan: "",
      bobot: 10,
      opsi: [
        { id: "o1", teks: "", isBenar: true },
        { id: "o2", teks: "", isBenar: false },
        { id: "o3", teks: "", isBenar: false },
        { id: "o4", teks: "", isBenar: false },
      ],
    },
  ])

  const addQuestion = () => {
    const newId = `q${questions.length + 1}`
    setQuestions([
      ...questions,
      {
        id: newId,
        pertanyaan: "",
        bobot: 10,
        opsi: [
          { id: `${newId}_o1`, teks: "", isBenar: true },
          { id: `${newId}_o2`, teks: "", isBenar: false },
          { id: `${newId}_o3`, teks: "", isBenar: false },
          { id: `${newId}_o4`, teks: "", isBenar: false },
        ],
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== questionId))
    }
  }

  const updateQuestion = (questionId: string, field: string, value: string | number) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId: string, optionId: string, field: string, value: string | boolean) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              opsi: q.opsi.map((o) => {
                if (field === "isBenar" && value === true) {
                  return { ...o, isBenar: o.id === optionId }
                }
                return o.id === optionId ? { ...o, [field]: value } : o
              }),
            }
          : q,
      ),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/assignments")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/assignments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Link>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Create Assessment</CardTitle>
            <CardDescription>Create a new quiz or test for your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Assessment Name</Label>
              <Input
                id="nama"
                placeholder="e.g., Quiz React Basics"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Description</Label>
              <Textarea
                id="deskripsi"
                placeholder="Describe this assessment..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.judul}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durasi">Duration (minutes)</Label>
                <Input
                  id="durasi"
                  type="number"
                  min="5"
                  max="180"
                  value={durasi}
                  onChange={(e) => setDurasi(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
            <Button type="button" variant="outline" onClick={addQuestion} className="bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Question {qIndex + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={question.bobot}
                      onChange={(e) => updateQuestion(question.id, "bobot", Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">points</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeQuestion(question.id)}
                      disabled={questions.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea
                    placeholder="Enter your question..."
                    value={question.pertanyaan}
                    onChange={(e) => updateQuestion(question.id, "pertanyaan", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options (select correct answer)</Label>
                  <div className="space-y-2">
                    {question.opsi.map((option, oIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${question.id}`}
                          checked={option.isBenar}
                          onChange={() => updateOption(question.id, option.id, "isBenar", true)}
                          className="h-4 w-4 accent-primary"
                        />
                        <Input
                          placeholder={`Option ${oIndex + 1}`}
                          value={option.teks}
                          onChange={(e) => updateOption(question.id, option.id, "teks", e.target.value)}
                          className={option.isBenar ? "border-primary" : ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create Assessment
          </Button>
        </div>
      </form>
    </div>
  )
}
