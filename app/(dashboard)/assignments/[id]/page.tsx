"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { mockAsesmenList, mockCourses } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, FileText, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const mockQuestions = [
  {
    id: "q1",
    pertanyaan: "Apa yang dimaksud dengan React Component?",
    bobot: 10,
    opsi: [
      { id: "o1", teks: "Sebuah fungsi atau class yang mengembalikan elemen React", isBenar: true },
      { id: "o2", teks: "Sebuah file JavaScript biasa", isBenar: false },
      { id: "o3", teks: "Sebuah library CSS", isBenar: false },
      { id: "o4", teks: "Sebuah database query", isBenar: false },
    ],
  },
  {
    id: "q2",
    pertanyaan: "Hook mana yang digunakan untuk mengelola state di functional component?",
    bobot: 10,
    opsi: [
      { id: "o5", teks: "useEffect", isBenar: false },
      { id: "o6", teks: "useState", isBenar: true },
      { id: "o7", teks: "useRef", isBenar: false },
      { id: "o8", teks: "useCallback", isBenar: false },
    ],
  },
  {
    id: "q3",
    pertanyaan: "Apa fungsi dari useEffect hook?",
    bobot: 10,
    opsi: [
      { id: "o9", teks: "Untuk mengelola state", isBenar: false },
      { id: "o10", teks: "Untuk melakukan side effects", isBenar: true },
      { id: "o11", teks: "Untuk membuat referensi", isBenar: false },
      { id: "o12", teks: "Untuk memoization", isBenar: false },
    ],
  },
  {
    id: "q4",
    pertanyaan: "Bagaimana cara passing data dari parent ke child component?",
    bobot: 10,
    opsi: [
      { id: "o13", teks: "Menggunakan state", isBenar: false },
      { id: "o14", teks: "Menggunakan props", isBenar: true },
      { id: "o15", teks: "Menggunakan localStorage", isBenar: false },
      { id: "o16", teks: "Menggunakan cookies", isBenar: false },
    ],
  },
  {
    id: "q5",
    pertanyaan: "Apa kegunaan dari React.memo()?",
    bobot: 10,
    opsi: [
      { id: "o17", teks: "Untuk menyimpan data ke memory", isBenar: false },
      { id: "o18", teks: "Untuk mencegah re-render yang tidak perlu", isBenar: true },
      { id: "o19", teks: "Untuk membuat memo/catatan", isBenar: false },
      { id: "o20", teks: "Untuk debugging", isBenar: false },
    ],
  },
]

export default function AssessmentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const assessment = mockAsesmenList.find((a) => a.id === id) || mockAsesmenList[0]
  const course = mockCourses.find((c) => c.id === assessment.courseId)

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isStarted, timeLeft, isSubmitted])

  const handleStart = () => {
    setIsStarted(true)
    setTimeLeft(assessment.durasi * 60)
  }

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = () => {
    let totalScore = 0
    mockQuestions.forEach((q) => {
      const selectedOption = q.opsi.find((o) => o.id === answers[q.id])
      if (selectedOption?.isBenar) {
        totalScore += q.bobot
      }
    })
    setScore(totalScore)
    setIsSubmitted(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (Object.keys(answers).length / mockQuestions.length) * 100

  // Pre-assessment view
  if (!isStarted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assignments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-2 w-fit">{course?.kategori}</Badge>
            <CardTitle className="text-2xl">{assessment.nama}</CardTitle>
            <CardDescription>{assessment.deskripsi}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <FileText className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-2xl font-bold">{assessment.jml_soal}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <Clock className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-2xl font-bold">{assessment.durasi}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Before you start:</p>
                  <ul className="mt-1 list-disc pl-4 text-yellow-700">
                    <li>Make sure you have a stable internet connection</li>
                    <li>The timer will start immediately once you begin</li>
                    <li>You cannot pause the assessment once started</li>
                    <li>Your answers are saved automatically</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleStart}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results view
  if (isSubmitted) {
    const totalPossible = mockQuestions.reduce((acc, q) => acc + q.bobot, 0)
    const percentage = Math.round((score / totalPossible) * 100)
    const isPassing = percentage >= 70

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${isPassing ? "bg-green-100" : "bg-red-100"}`}
            >
              <CheckCircle2 className={`h-10 w-10 ${isPassing ? "text-green-600" : "text-red-600"}`} />
            </div>
            <CardTitle className="text-2xl">Assessment Completed!</CardTitle>
            <CardDescription>Here are your results for {assessment.nama}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className={`text-5xl font-bold ${isPassing ? "text-green-600" : "text-red-600"}`}>{percentage}%</p>
              <p className="mt-1 text-muted-foreground">
                {score} out of {totalPossible} points
              </p>
              <Badge className={`mt-2 ${isPassing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {isPassing ? "Passed" : "Needs Improvement"}
              </Badge>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Review Answers</h3>
              {mockQuestions.map((question, index) => {
                const selectedOption = question.opsi.find((o) => o.id === answers[question.id])
                const isCorrect = selectedOption?.isBenar

                return (
                  <div
                    key={question.id}
                    className={`rounded-lg border p-4 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Q{index + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium">{question.pertanyaan}</p>
                        <p className="mt-1 text-sm">
                          Your answer:{" "}
                          <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                            {selectedOption?.teks || "Not answered"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700">
                            Correct answer: {question.opsi.find((o) => o.isBenar)?.teks}
                          </p>
                        )}
                      </div>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <Button asChild className="w-full">
              <Link href="/assignments">Back to Assessments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Assessment in progress
  const currentQ = mockQuestions[currentQuestion]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Timer and Progress */}
      <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-4 pt-2 md:-mx-6 md:px-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timeLeft < 60 ? "text-red-500" : "text-primary"}`} />
                <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? "text-red-500" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="hidden sm:block">
                <Progress value={progress} className="h-2 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {Object.keys(answers).length} / {mockQuestions.length} answered
              </span>
              <Button onClick={handleSubmit} variant="destructive" size="sm">
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {mockQuestions.length}
            </Badge>
            <Badge variant="secondary">{currentQ.bobot} points</Badge>
          </div>
          <CardTitle className="mt-4 text-xl">{currentQ.pertanyaan}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers[currentQ.id] || ""} onValueChange={(value) => handleAnswer(currentQ.id, value)}>
            <div className="space-y-3">
              {currentQ.opsi.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted ${
                    answers[currentQ.id] === option.id ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <span>{option.teks}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="bg-transparent"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {/* Question Navigator */}
        <div className="hidden flex-wrap justify-center gap-2 sm:flex">
          {mockQuestions.map((_, index) => (
            <Button
              key={index}
              variant={
                currentQuestion === index ? "default" : answers[mockQuestions[index].id] ? "secondary" : "outline"
              }
              size="icon"
              className={`h-8 w-8 ${currentQuestion !== index && !answers[mockQuestions[index].id] ? "bg-transparent" : ""}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        <Button
          onClick={() => {
            if (currentQuestion === mockQuestions.length - 1) {
              handleSubmit()
            } else {
              setCurrentQuestion((prev) => Math.min(mockQuestions.length - 1, prev + 1))
            }
          }}
        >
          {currentQuestion === mockQuestions.length - 1 ? "Submit" : "Next"}
          {currentQuestion !== mockQuestions.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
