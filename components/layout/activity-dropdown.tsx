"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, Award, Upload, BookOpen, Clock, CheckCircle2, Loader2, Check, CheckCheck } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { id as localeId, enUS } from "date-fns/locale"

interface Activity {
  action: string
  item: string
  course?: string
  time: string
  type: string
  score?: number
}

export function ActivityDropdown() {
  const { user } = useAuth()
  const { t, locale } = useAutoTranslate()
  const dateLocale = locale === 'id' ? localeId : enUS
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [readActivities, setReadActivities] = useState<Set<string>>(new Set())

  // Load read activities from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`read-activities-${user.id}`)
      if (stored) {
        setReadActivities(new Set(JSON.parse(stored)))
      }
    }
  }, [user])

  // Save read activities to localStorage
  const saveReadActivities = (readSet: Set<string>) => {
    if (user) {
      localStorage.setItem(`read-activities-${user.id}`, JSON.stringify(Array.from(readSet)))
      setReadActivities(readSet)
    }
  }

  // Fetch activities on mount and periodically (untuk update badge)
  useEffect(() => {
    if (!user) return

    const fetchActivities = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/activity?userId=${user.id}&role=${user.role}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setActivities(data.activities || [])
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchActivities()

    // Fetch every 2 minutes to check for new activities
    const interval = setInterval(fetchActivities, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [user])

  // Refresh when dropdown opens
  useEffect(() => {
    if (!user || !open) return

    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/activity?userId=${user.id}&role=${user.role}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setActivities(data.activities || [])
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      }
    }

    fetchActivities()
  }, [user, open])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz':
      case 'grade':
        return <Award className="h-4 w-4" />
      case 'assignment':
      case 'submission':
        return <Upload className="h-4 w-4" />
      case 'enrollment':
        return <BookOpen className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz':
      case 'grade':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case 'assignment':
      case 'submission':
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case 'enrollment':
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getActivityLabel = (action: string) => {
    switch (action) {
      case 'completed':
        return t('Menyelesaikan')
      case 'submitted':
        return t('Mengumpulkan')
      case 'graded':
        return t('Dinilai')
      case 'enrolled':
        return t('Bergabung')
      default:
        return action
    }
  }

  // Generate unique ID for activity
  const getActivityId = (activity: Activity, index: number) => {
    return `${activity.type}-${activity.item}-${activity.time}-${index}`
  }

  // Mark single activity as read
  const markAsRead = (activityId: string) => {
    const newReadSet = new Set(readActivities)
    newReadSet.add(activityId)
    saveReadActivities(newReadSet)
  }

  // Mark all activities as read
  const markAllAsRead = () => {
    const newReadSet = new Set<string>()
    activities.forEach((activity, index) => {
      newReadSet.add(getActivityId(activity, index))
    })
    saveReadActivities(newReadSet)
  }

  const unreadCount = activities.filter((activity, index) => 
    !readActivities.has(getActivityId(activity, index))
  ).length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-primary transition-colors duration-150 group"
        >
          <Bell className="h-5 w-5 transition-transform duration-150 group-hover:scale-110" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-base">{t("Aktivitas Terbaru")}</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} {t("baru")}
              </Badge>
            )}
            {activities.length > 0 && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 px-2"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("Tandai Semua")}
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="p-2">
              {activities.map((activity, index) => {
                const activityId = getActivityId(activity, index)
                const isRead = readActivities.has(activityId)
                
                return (
                  <div
                    key={index}
                    className={`mb-2 rounded-lg border p-3 transition-all ${
                      isRead 
                        ? 'border-border/50 bg-muted/30 hover:bg-muted/50' 
                        : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${isRead ? 'font-normal' : 'font-medium'}`}>
                            {getActivityLabel(activity.action)} {activity.item}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {activity.score !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {activity.score}
                              </Badge>
                            )}
                            {!isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(activityId)}
                                title={t("Tandai telah dibaca")}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {activity.course && (
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.course}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.time), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{t("Belum ada aktivitas")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("Aktivitas Anda akan muncul di sini")}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
