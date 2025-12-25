"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  FileText,
  FolderKanban,
  GraduationCap,
  BookOpen,
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfMonth,
  endOfMonth,
  isAfter,
  addDays,
} from "date-fns"
import { id as localeId, enUS } from "date-fns/locale"
import type { DayButtonProps } from "react-day-picker"
import { AnimateIn } from "@/components/ui/animate-in"

type EventType = "assessment" | "project" | "lesson"

interface ScheduleEvent {
  id: string
  title: string
  date: Date
  type: EventType
  courseId?: string
  description?: string
  course?: string
  group?: string
  status?: string
}

export default function SchedulePage() {
  const { user } = useAuth()
  const { t, locale } = useAutoTranslate()
  const dateLocale = locale === 'id' ? localeId : enUS

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [filterType, setFilterType] = useState<"all" | EventType>("all")
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch schedule events from API
  useEffect(() => {
    if (!user) return

    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/schedule?userId=${user.id}&role=${user.role}`)
        const data = await response.json()

        if (response.ok) {
          // Convert date strings to Date objects
          const events: ScheduleEvent[] = data.schedule.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            // Map API types to our event types
            type: event.type === 'assessment' ? 'assessment' : 
                  event.type === 'project' ? 'project' : 
                  'lesson' as EventType
          }))
          setAllEvents(events)
        }
      } catch (error) {
        console.error('Error fetching schedule:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [user])

  const eventTypeConfig = useMemo(
    () => ({
      assessment: {
        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        dotColor: "bg-blue-500",
        icon: GraduationCap,
        label: t("assessment"),
      },
      project: {
        color:
          "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        dotColor: "bg-emerald-500",
        icon: FolderKanban,
        label: t("project"),
      },
      lesson: {
        color:
          "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
        dotColor: "bg-purple-500",
        icon: BookOpen,
        label: t("lesson"),
      },
    }),
    [t],
  )

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => filterType === "all" || event.type === filterType)
  }, [allEvents, filterType])

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.date, date))
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    const nextWeek = addDays(today, 7)
    return filteredEvents
      .filter((event) => !isBefore(event.date, today) && isBefore(event.date, nextWeek))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [filteredEvents])

  const overdueEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return allEvents
      .filter((event) => isBefore(event.date, today) && (event.type === "assessment" || event.type === "project"))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3)
  }, [allEvents])

  const monthEvents = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return filteredEvents
      .filter((event) => !isBefore(event.date, start) && !isAfter(event.date, end))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [filteredEvents, currentMonth])

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) {
      return t("today")
    }
    return format(date, "EEEE, d MMMM", { locale: dateLocale })
  }

  const CustomDayButton = ({ day, modifiers, ...props }: DayButtonProps) => {
    const date = day.date
    const events = getEventsForDate(date)
    const isSelected = modifiers.selected
    const isOutside = modifiers.outside
    const isTodayDate = modifiers.today

    return (
      <button
        {...props}
        onClick={() => setSelectedDate(date)}
        className={`relative flex h-10 w-full flex-col items-center justify-center rounded-lg transition-colors sm:h-12 ${
          isSelected ? "bg-primary text-primary-foreground" : isTodayDate ? "bg-accent font-semibold" : "hover:bg-muted"
        } ${isOutside ? "opacity-40" : ""}`}
      >
        <span className="text-xs sm:text-sm">{format(date, "d")}</span>
        {events.length > 0 && (
          <div className="mt-0.5 flex gap-0.5">
            {events.slice(0, 3).map((event, i) => (
              <div
                key={i}
                className={`h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${
                  isSelected ? "bg-primary-foreground" : eventTypeConfig[event.type].dotColor
                }`}
              />
            ))}
            {events.length > 3 && (
              <span
                className={`text-[8px] sm:text-[10px] ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                +{events.length - 3}
              </span>
            )}
          </div>
        )}
      </button>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <AnimateIn stagger={0}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("schedule")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">{t("scheduleDesc")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
              <TabsList className="h-9">
                <TabsTrigger value="calendar" className="text-xs sm:text-sm">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                  {t("calendarView")}
                </TabsTrigger>
                <TabsTrigger value="list" className="text-xs sm:text-sm">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  {t("listView")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as "all" | EventType)}>
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue placeholder={t("filter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allEvents")}</SelectItem>
                {(Object.entries(eventTypeConfig) as [EventType, (typeof eventTypeConfig)[EventType]][]).map(
                  ([type, config]) => (
                    <SelectItem key={type} value={type}>
                      {config.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AnimateIn>

      {/* Legend */}
      <AnimateIn stagger={1}>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {(Object.entries(eventTypeConfig) as [EventType, (typeof eventTypeConfig)[EventType]][]).map(
            ([type, config]) => (
              <div key={type} className="flex items-center gap-1.5 sm:gap-2">
                <div className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${config.dotColor}`} />
                <span className="text-xs sm:text-sm">{config.label}</span>
              </div>
            ),
          )}
        </div>
      </AnimateIn>

      {/* Overdue Alert */}
      {overdueEvents.length > 0 && (
        <AnimateIn stagger={2}>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-3 sm:p-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">
                  {overdueEvents.length} {t("overdueItems")}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {overdueEvents.map((event) => (
                    <Badge key={event.id} variant="outline" className="text-xs border-destructive/30">
                      {event.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <AnimateIn stagger={3} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-1.5 text-base sm:gap-2 sm:text-lg">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{format(currentMonth, "MMMM yyyy", { locale: dateLocale })}</span>
              </CardTitle>
              <div className="flex gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                  onClick={() => {
                    setCurrentMonth(new Date())
                    setSelectedDate(new Date())
                  }}
                >
                  {t("today")}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 sm:pt-0">
              {viewMode === "calendar" ? (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={dateLocale}
                  className="w-full"
                  components={{
                    DayButton: CustomDayButton,
                  }}
                />
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {monthEvents.length > 0 ? (
                    monthEvents.map((event) => {
                      const config = eventTypeConfig[event.type]
                      const Icon = config.icon

                      return (
                        <div key={event.id} className={`flex items-start gap-3 rounded-lg border p-3 ${config.color}`}>
                          <div className="rounded-full bg-background/50 p-2">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium truncate">{event.title}</p>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {format(event.date, "d MMM", { locale: dateLocale })}
                              </Badge>
                            </div>
                            {event.course && <p className="text-xs opacity-80 mt-0.5 truncate">{event.course}</p>}
                            {event.description && (
                              <p className="text-xs opacity-70 mt-1 line-clamp-2">{event.description}</p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t("noEvents")}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimateIn>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {viewMode === "calendar" && (
            <AnimateIn stagger={4}>
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base">
                    {selectedDate ? formatDateLabel(selectedDate) : t("selectDate")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3 max-h-[250px] overflow-y-auto">
                      {selectedDateEvents.map((event) => {
                        const config = eventTypeConfig[event.type]
                        const Icon = config.icon

                        return (
                          <div key={event.id} className={`rounded-lg border p-2 sm:p-3 ${config.color}`}>
                            <div className="flex items-start gap-1.5 sm:gap-2">
                              <Icon className="h-3.5 w-3.5 mt-0.5 sm:h-4 sm:w-4 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium sm:text-sm">{event.title}</p>
                                {event.course && <p className="text-xs opacity-80 truncate">{event.course}</p>}
                                {event.description && (
                                  <p className="text-xs opacity-70 mt-1 line-clamp-2">{event.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground sm:text-sm">{t("noEvents")}</p>
                  )}
                </CardContent>
              </Card>
            </AnimateIn>
          )}

          <AnimateIn stagger={5}>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-1.5 text-sm sm:gap-2 sm:text-base">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t("next7Days")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto">
                    {upcomingEvents.map((event) => {
                      const config = eventTypeConfig[event.type]
                      const Icon = config.icon

                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className={`rounded-full p-1.5 sm:p-2 ${config.color}`}>
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium sm:text-sm truncate">{event.title}</p>
                            <p className="text-[10px] text-muted-foreground sm:text-xs">
                              {format(event.date, "EEEE, d MMM", { locale: dateLocale })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("noUpcoming")}</p>
                )}
              </CardContent>
            </Card>
          </AnimateIn>

          <AnimateIn stagger={6}>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base">{t("monthSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {(Object.entries(eventTypeConfig) as [EventType, (typeof eventTypeConfig)[EventType]][]).map(
                    ([type, config]) => {
                      const count = monthEvents.filter((e) => e.type === type).length
                      const Icon = config.icon
                      return (
                        <div
                          key={type}
                          className={`flex items-center gap-2 rounded-lg border p-2 sm:p-3 ${config.color}`}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <div>
                            <p className="text-lg font-bold sm:text-xl">{count}</p>
                            <p className="text-[10px] sm:text-xs">{config.label}</p>
                          </div>
                        </div>
                      )
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        </div>
      </div>
    </div>
  )
}
