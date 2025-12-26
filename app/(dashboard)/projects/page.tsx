"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockSintaksSubmissions, getProjectBySintaks } from "@/lib/mock-data"
import { SINTAKS_MAP, SINTAKS_KEYS, type SintaksKey } from "@/lib/constants/project"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, Clock, ArrowRight, CheckCircle2, Circle, AlertCircle, FolderKanban } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays, isPast, isFuture, isWithinInterval } from "date-fns"
import { id as idLocale, enUS } from "date-fns/locale"
import { AnimateIn } from "@/components/ui/animate-in"
import { useAutoTranslate } from "@/lib/auto-translate-context"

type FilterStatus = "all" | "active" | "completed" | "upcoming"

export default function ProjectsPage() {
  const { user } = useAuth()
  const { t, locale } = useAutoTranslate()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")

  const isTeacher = user?.role === "GURU"
  const dateLocale = locale === 'id' ? idLocale : enUS

  // Calculate overall progress
  const completedCount = Object.values(mockSintaksSubmissions).filter((s) => s.submitted && s.grade !== null).length
  const submittedCount = Object.values(mockSintaksSubmissions).filter((s) => s.submitted).length
  const overallProgress = (completedCount / 8) * 100

  const getProjectStatus = (sintaksKey: SintaksKey) => {
    const project = getProjectBySintaks(sintaksKey)
    const submission = mockSintaksSubmissions[sintaksKey]

    if (!project) return "not_created"
    if (submission.submitted && submission.grade !== null) return "completed"
    if (submission.submitted) return "submitted"

    const now = new Date()
    if (isPast(project.tgl_selesai)) return "overdue"
    if (isFuture(project.tgl_mulai)) return "upcoming"
    if (isWithinInterval(now, { start: project.tgl_mulai, end: project.tgl_selesai })) return "active"

    return "upcoming"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {t('projects.completed')}
          </Badge>
        )
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {t('projects.submitted')}
          </Badge>
        )
      case "active":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Circle className="mr-1 h-3 w-3 fill-current" />
            {t('projects.active')}
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            {t('projects.overdue')}
          </Badge>
        )
      case "upcoming":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t("Proyek Mendatang")}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Circle className="mr-1 h-3 w-3" />
            {t('projects.notCreated')}
          </Badge>
        )
    }
  }

  const filteredSintaks = SINTAKS_KEYS.filter((key) => {
    if (filterStatus === "all") return true
    const status = getProjectStatus(key)
    if (filterStatus === "active") return status === "active" || status === "overdue"
    if (filterStatus === "completed") return status === "completed" || status === "submitted"
    if (filterStatus === "upcoming") return status === "upcoming" || status === "not_created"
    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <AnimateIn stagger={0}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {t('projects.title')}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('projects.subtitle')}
            </p>
          </div>
          {isTeacher && (
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/projects/manage">
                <Plus className="mr-2 h-4 w-4" />
                {t('projects.manageProjects')}
              </Link>
            </Button>
          )}
        </div>
      </AnimateIn>

      {/* Overall Progress */}
      <AnimateIn stagger={1}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{t('projects.overallProgress')}</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} {t('projects.of')} 8{" "}
                  {t('projects.phasesCompleted')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 sm:w-48">
                  <Progress value={overallProgress} className="h-2" />
                </div>
                <span className="text-sm font-medium">{overallProgress.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimateIn>

      {/* Filter Tabs */}
      <AnimateIn stagger={2}>
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "completed", "upcoming"] as FilterStatus[]).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="text-xs sm:text-sm"
            >
              {status === "all" && t('projects.all')}
              {status === "active" && t('projects.active')}
              {status === "completed" && t('projects.completed')}
              {status === "upcoming" && t("Proyek Mendatang")}
            </Button>
          ))}
        </div>
      </AnimateIn>

      {/* Sintaks Grid */}
      {filteredSintaks.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSintaks.map((sintaksKey, index) => {
            const sintaksInfo = SINTAKS_MAP[sintaksKey]
            const project = getProjectBySintaks(sintaksKey)
            const submission = mockSintaksSubmissions[sintaksKey]
            const status = getProjectStatus(sintaksKey)
            const daysLeft = project ? differenceInDays(project.tgl_selesai, new Date()) : 0

            return (
              <AnimateIn key={sintaksKey} stagger={3 + index}>
                <Card className="flex flex-col transition-all hover:shadow-md">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
                        {sintaksInfo.icon}
                      </div>
                      {getStatusBadge(status)}
                    </div>
                    <CardTitle className="mt-3 text-sm sm:text-base">
                      <span className="text-muted-foreground">Sintaks {sintaksInfo.order}:</span>{" "}
                      {locale === 'id' ? sintaksInfo.title : sintaksInfo.titleEn}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                      {locale === 'id' ? sintaksInfo.description : sintaksInfo.descriptionEn}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3 pb-3 sm:pb-4">
                    {project && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(project.tgl_mulai, "d MMM", { locale: dateLocale })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{format(project.tgl_selesai, "d MMM", { locale: dateLocale })}</span>
                          </div>
                        </div>

                        {status === "active" && daysLeft >= 0 && (
                          <div className="rounded-lg bg-amber-50 p-2 text-center dark:bg-amber-900/20">
                            <span
                              className={`text-xs font-medium ${daysLeft <= 3 ? "text-red-600" : "text-amber-700"}`}
                            >
                              {daysLeft === 0
                                ? t('projects.dueToday')
                                : `${daysLeft} ${t('projects.daysLeft')}`}
                            </span>
                          </div>
                        )}

                        {submission.grade !== null && (
                          <div className="flex items-center justify-center rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                              {t('projects.grade')}: {submission.grade}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>

                  <div className="border-t p-3 sm:p-4">
                    <Button
                      asChild
                      className="w-full"
                      size="sm"
                      variant={status === "completed" || status === "submitted" ? "outline" : "default"}
                    >
                      <Link href={`/projects/${sintaksKey}`}>
                        {status === "completed" || status === "submitted"
                          ? t("Lihat Detail")
                          : status === "active"
                            ? t('projects.workOnIt')
                            : t("Lihat Detail")}
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </AnimateIn>
            )
          })}
        </div>
      ) : (
        <AnimateIn stagger={3}>
          <Card className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <FolderKanban className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
            <h3 className="mt-4 text-sm font-semibold sm:text-base">
              {t('projects.noPhasesFound')}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              {t('projects.tryDifferentFilter')}
            </p>
          </Card>
        </AnimateIn>
      )}
    </div>
  )
}
