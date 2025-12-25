"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockAsesmenList, mockCourses } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Clock, FileText, CheckCircle2, AlertCircle, Play, BarChart3 } from "lucide-react"
import Link from "next/link"
import { AnimateIn } from "@/components/ui/animate-in"
import { useAutoTranslate } from "@/lib/auto-translate-context"

const mockGrades = [
  { asesmenId: "a1", score: 85, date: new Date("2024-12-10") },
  { asesmenId: "a3", score: 92, date: new Date("2024-12-12") },
]

export default function AssignmentsPage() {
  const { user } = useAuth()
  const { t } = useAutoTranslate()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredAssessments = mockAsesmenList.filter((assessment) =>
    assessment.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const isTeacher = user?.role === "GURU"

  const getAssessmentStatus = (asesmenId: string) => {
    const grade = mockGrades.find((g) => g.asesmenId === asesmenId)
    if (grade) return { status: "completed", score: grade.score }
    return { status: "pending", score: null }
  }

  const getCourse = (courseId: string) => {
    return mockCourses.find((c) => c.id === courseId)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <AnimateIn stagger={0}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("assignments.assignmentsTitle")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {isTeacher ? t("assignments.assignmentsSubtitleTeacher") : t("assignments.assignmentsSubtitleStudent")}
            </p>
          </div>
          {isTeacher && (
            <Button asChild size="sm" className="w-full sm:w-auto sm:size-auto">
              <Link href="/assignments/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("assignments.createAssessment")}
              </Link>
            </Button>
          )}
        </div>
      </AnimateIn>

      {/* Search */}
      <AnimateIn stagger={1}>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("assignments.searchAssessments")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 sm:h-10"
            />
          </div>
        </div>
      </AnimateIn>

      {/* Tabs for Students */}
      {user?.role === "SISWA" && (
        <AnimateIn stagger={2}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="inline-flex w-max sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  {t("assignments.all")}
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">
                  {t("Tertunda")}
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm">
                  {t("Selesai")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-4 sm:mt-6">
              <AssessmentGrid
                assessments={filteredAssessments}
                getStatus={getAssessmentStatus}
                getCourse={getCourse}
                userRole={user.role}
                t={t}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-4 sm:mt-6">
              <AssessmentGrid
                assessments={filteredAssessments.filter((a) => getAssessmentStatus(a.id).status === "pending")}
                getStatus={getAssessmentStatus}
                getCourse={getCourse}
                userRole={user.role}
                t={t}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-4 sm:mt-6">
              <AssessmentGrid
                assessments={filteredAssessments.filter((a) => getAssessmentStatus(a.id).status === "completed")}
                getStatus={getAssessmentStatus}
                getCourse={getCourse}
                userRole={user.role}
                t={t}
              />
            </TabsContent>
          </Tabs>
        </AnimateIn>
      )}

      {/* Direct Grid for Teachers */}
      {isTeacher && (
        <AnimateIn stagger={2}>
          <AssessmentGrid
            assessments={filteredAssessments}
            getStatus={getAssessmentStatus}
            getCourse={getCourse}
            userRole={user!.role}
            t={t}
          />
        </AnimateIn>
      )}
    </div>
  )
}

function AssessmentGrid({
  assessments,
  getStatus,
  getCourse,
  userRole,
  t,
}: {
  assessments: typeof mockAsesmenList
  getStatus: (id: string) => { status: string; score: number | null }
  getCourse: (id: string) => (typeof mockCourses)[0] | undefined
  userRole: string
  t: (key: any) => string
}) {
  if (assessments.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
        <FileText className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
        <h3 className="mt-4 text-sm font-semibold sm:text-base">{t("assignments.noAssessments")}</h3>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{t("assignments.assessmentsWillAppear")}</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {assessments.map((assessment, index) => {
        const { status, score } = getStatus(assessment.id)
        const course = getCourse(assessment.courseId)

        return (
          <AnimateIn key={assessment.id} stagger={3 + index}>
            <Card className="flex flex-col">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertCircle className="mr-1 h-3 w-3" />
                    )}
                    {status === "completed" ? t("Selesai") : t("Tertunda")}
                  </Badge>
                  {score !== null && <span className="text-base font-bold text-green-600 sm:text-lg">{score}%</span>}
                </div>
                <CardTitle className="mt-2 text-sm sm:text-lg">{assessment.nama}</CardTitle>
                <CardDescription className="text-xs sm:text-sm line-clamp-2">{assessment.deskripsi}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-3 sm:pb-4">
                {course && (
                  <p className="mb-2 text-xs text-muted-foreground sm:mb-3 sm:text-sm">
                    {t("courses.course")}: <span className="font-medium text-foreground">{course.judul}</span>
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {assessment.jml_soal} {t("common.questions")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {assessment.durasi} {t("common.mins")}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 sm:pt-4">
                <Button asChild className="w-full" size="sm" variant={status === "completed" ? "outline" : "default"}>
                  <Link href={`/assignments/${assessment.id}`}>
                    {userRole === "GURU" ? (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        {t("assignments.viewResults")}
                      </>
                    ) : status === "completed" ? (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        {t("assignments.viewResults")}
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {t("assignments.startAssessment")}
                      </>
                    )}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </AnimateIn>
        )
      })}
    </div>
  )
}
