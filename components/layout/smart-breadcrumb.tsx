"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransitionRouter } from '@/hooks/use-transition-router'
import { ChevronRight, ChevronLeft, Home, BookOpen, Users, Calendar, User, Settings, Code, Activity, BarChart3, Search as SearchIcon, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { useBreadcrumb, type BreadcrumbItem as BreadcrumbItemType } from '@/hooks/use-breadcrumb'

const LIQUID_SETTLE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)'

interface SmartBreadcrumbProps {
  className?: string
  showMobile?: boolean
}

// Smart breadcrumb config with better descriptions
const pathConfig: { [key: string]: { label: string; icon?: React.ReactNode } } = {
  '/': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  '/dashboard': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  '/courses': { label: 'Kursus', icon: <BookOpen className="h-4 w-4" /> },
  '/asesmen': { label: 'Asesmen', icon: <BookOpen className="h-4 w-4" /> },
  '/projects': { label: 'Proyek', icon: <BookOpen className="h-4 w-4" /> },
  '/proyek': { label: 'Proyek Saya', icon: <BookOpen className="h-4 w-4" /> },
  '/users': { label: 'Pengguna', icon: <Users className="h-4 w-4" /> },
  '/schedule': { label: 'Jadwal', icon: <Calendar className="h-4 w-4" /> },
  '/profile': { label: 'Profil', icon: <User className="h-4 w-4" /> },
  '/settings': { label: 'Pengaturan', icon: <Settings className="h-4 w-4" /> },
  '/compiler': { label: 'Compiler', icon: <Code className="h-4 w-4" /> },
  '/add': { label: 'Tambah' },
  '/new': { label: 'Tambah' },
  '/edit': { label: 'Edit' },
  '/kelompok': { label: 'Kelompok', icon: <Users className="h-4 w-4" /> },
  '/nilai': { label: 'Nilai', icon: <BarChart3 className="h-4 w-4" /> },
  '/pengumpulan': { label: 'Pengumpulan', icon: <BookOpen className="h-4 w-4" /> },
  '/activity': { label: 'Aktivitas', icon: <Activity className="h-4 w-4" /> },
  '/stats': { label: 'Statistik', icon: <BarChart3 className="h-4 w-4" /> },
  '/search': { label: 'Pencarian', icon: <SearchIcon className="h-4 w-4" /> },
}

function generateAutoBreadcrumbs(pathname: string): BreadcrumbItemType[] {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItemType[] = []

  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
  })

  // Process path segments with smart context awareness
  let i = 0
  while (i < pathSegments.length) {
    const segment = pathSegments[i]
    const nextSegment = pathSegments[i + 1]
    const prevSegment = pathSegments[i - 1]
    
    // Updated regex to better detect MongoDB ObjectIds, UUIDs, and long random strings
    const isCurrentId = /^[0-9a-fA-Z]{15,}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$|^[0-9]+$/.test(segment)
    const isNextId = nextSegment && (/^[0-9a-fA-Z]{15,}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$|^[0-9]+$/.test(nextSegment))
    
    // Build current path up to this point
    const currentPath = '/' + pathSegments.slice(0, i + 1).join('/')
    const isActive = i === pathSegments.length - 1
    
    // Get base config for the segment
    const config = pathConfig[`/${segment}`] || pathConfig[currentPath]
    
    // Handle different patterns
    if (segment === 'courses') {
      // Add "Kursus" breadcrumb
      breadcrumbs.push({
        label: 'Kursus',
        href: isActive ? undefined : '/courses',
        icon: <BookOpen className="h-4 w-4" />
      })
      
      // If next segment is an ID, skip it and add placeholder
      // The actual name should be handled by manual breadcrumbs in the page component
      if (nextSegment && isNextId) {
        i++ // Skip the ID
        const detailPath = '/' + pathSegments.slice(0, i + 1).join('/')
        const isDetailActive = i === pathSegments.length - 1
        
        // Use generic label - actual course name should come from manual breadcrumbs
        breadcrumbs.push({
          label: 'Detail Kursus',
          href: isDetailActive ? undefined : detailPath,
          icon: <BookOpen className="h-4 w-4" />
        })
      }
      
    } else if (segment === 'materi') {
      // Only handle materi when it's nested under a course ID
      if (prevSegment && /^[0-9a-fA-Z]{15,}$/.test(prevSegment)) {
        // This is materi under a course
        if (nextSegment && isNextId) {
          i++ // Skip the materi ID
          // Use generic label - actual materi name should come from manual breadcrumbs
          breadcrumbs.push({
            label: 'Detail Materi',
            href: undefined, // Final item
            icon: <FileText className="h-4 w-4" />
          })
        }
      }
      // Skip standalone /materi routes as they don't exist
      
    } else if (segment === 'asesmen') {
      breadcrumbs.push({
        label: 'Asesmen',
        href: isActive ? undefined : currentPath,
        icon: <BookOpen className="h-4 w-4" />
      })
      
      // If next segment is an ID, skip it and add placeholder
      if (nextSegment && isNextId) {
        i++ // Skip the ID
        const isDetailActive = i === pathSegments.length - 1
        
        breadcrumbs.push({
          label: 'Detail Asesmen',
          href: isDetailActive ? undefined : undefined,
          icon: <BookOpen className="h-4 w-4" />
        })
      }
      
    } else if (segment === 'proyek') {
      breadcrumbs.push({
        label: 'Proyek Saya',
        href: isActive ? undefined : '/proyek',
        icon: <BookOpen className="h-4 w-4" />
      })
      
      // If next segment is an ID, skip it and add placeholder
      if (nextSegment && isNextId) {
        i++ // Skip the ID
        const isDetailActive = i === pathSegments.length - 1
        
        breadcrumbs.push({
          label: 'Detail Proyek',
          href: isDetailActive ? undefined : undefined,
          icon: <BookOpen className="h-4 w-4" />
        })
      }
      
    } else if (segment === 'users') {
      breadcrumbs.push({
        label: 'Pengguna',
        href: isActive ? undefined : '/users',
        icon: <Users className="h-4 w-4" />
      })
      
      // If next segment is an ID, skip it and add placeholder
      if (nextSegment && isNextId) {
        i++ // Skip the ID
        const isDetailActive = i === pathSegments.length - 1
        
        breadcrumbs.push({
          label: 'Detail Pengguna',
          href: isDetailActive ? undefined : undefined,
          icon: <Users className="h-4 w-4" />
        })
      }
      
    } else if (segment === 'new' || segment === 'add') {
      // Handle add/new pages
      let label = 'Tambah'
      
      if (prevSegment === 'courses') {
        label = 'Tambah Kursus'
      } else if (prevSegment === 'materi') {
        label = 'Tambah Materi'
      } else if (prevSegment === 'asesmen') {
        label = 'Tambah Asesmen'
      } else if (prevSegment === 'proyek' || prevSegment === 'projects') {
        label = 'Tambah Proyek'
      }
      
      breadcrumbs.push({
        label,
        href: isActive ? undefined : currentPath,
        icon: config?.icon
      })
      
    } else if (segment === 'edit') {
      breadcrumbs.push({
        label: 'Edit',
        href: isActive ? undefined : currentPath,
        icon: config?.icon
      })
      
    } else if (config && !isCurrentId) {
      // Use predefined config for non-ID segments
      breadcrumbs.push({
        label: config.label,
        href: isActive ? undefined : currentPath,
        icon: config.icon
      })
      
    } else if (!isCurrentId) {
      // Regular segment (not an ID) - only add non-ID segments
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({
        label,
        href: isActive ? undefined : currentPath,
        icon: undefined
      })
    }
    
    // Always increment to next segment
    i++
  }

  return breadcrumbs
}

export function SmartBreadcrumb({ className, showMobile = false }: SmartBreadcrumbProps) {
  const pathname = usePathname()
  const router = useTransitionRouter()
  const { breadcrumbs: manualBreadcrumbs } = useBreadcrumb()
  
  // Don't show breadcrumb on login page or root dashboard
  if (pathname === '/login' || pathname === '/' || pathname === '/dashboard') {
    return null
  }

  // Use manual breadcrumbs if available, otherwise generate automatically
  const breadcrumbs = manualBreadcrumbs.length > 0 
    ? manualBreadcrumbs 
    : generateAutoBreadcrumbs(pathname)

  if (breadcrumbs.length <= 1) {
    return null
  }

  // Check if current page is compiler (has its own back button)
  const isCompilerPage = pathname.includes('/compiler')

  return (
    <div className={cn('mb-4 mt-1 overflow-visible relative z-10', className)}>
      {/* Desktop & Tablet Breadcrumb */}
      <Breadcrumb className={cn('hidden md:block', showMobile && 'block')}>
        <BreadcrumbList className="flex-wrap">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.href || crumb.label}-${index}`}>
              <BreadcrumbItem className="flex items-center">
                {!crumb.href ? (
                  <BreadcrumbPage className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                    {crumb.icon}
                    <span>{crumb.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={crumb.href} 
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors text-muted-foreground text-sm"
                    >
                      {crumb.icon}
                      <span>{crumb.label}</span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Mobile — Liquid Glass Sticky Back Button */}
      {showMobile && !isCompilerPage && (
        <MobileStickyBackButton
          breadcrumbs={breadcrumbs}
          onBack={() => router.navigateBack()}
        />
      )}
    </div>
  )
}

/**
 * MobileStickyBackButton — Floating back button that:
 * - At top of page: floats above content (normal flow)
 * - On scroll down: transitions to sticky at top with liquid glass morphing
 * - Uses IntersectionObserver for performance
 */
function MobileStickyBackButton({
  breadcrumbs,
  onBack,
}: {
  breadcrumbs: BreadcrumbItemType[]
  onBack: () => void
}) {
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = React.useState(false)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Animate liquid morph on sticky change
  React.useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    if (isSticky) {
      // Morphing INTO sticky — liquid glass blob expand
      bar.animate([
        { transform: 'scale(1) translateY(0)', borderRadius: '24px', opacity: 1, backdropFilter: 'blur(0px)' },
        { transform: 'scale(1.06, 0.94) translateY(-2px)', borderRadius: '20px', opacity: 0.95, offset: 0.2 },
        { transform: 'scale(0.98, 1.02) translateY(0)', borderRadius: '22px', opacity: 1, offset: 0.5 },
        { transform: 'scale(1) translateY(0)', borderRadius: '22px', opacity: 1, backdropFilter: 'blur(20px)' },
      ], {
        duration: 450,
        easing: LIQUID_SETTLE,
        fill: 'forwards',
      })
    } else {
      // Morphing OUT of sticky — settle back
      bar.animate([
        { transform: 'scale(1) translateY(0)', borderRadius: '22px', backdropFilter: 'blur(20px)' },
        { transform: 'scale(1.03, 0.97)', borderRadius: '24px', offset: 0.3 },
        { transform: 'scale(0.99, 1.01)', borderRadius: '24px', offset: 0.6 },
        { transform: 'scale(1) translateY(0)', borderRadius: '24px', backdropFilter: 'blur(0px)' },
      ], {
        duration: 380,
        easing: LIQUID_SETTLE,
        fill: 'forwards',
      })
    }
  }, [isSticky])

  const currentPage = breadcrumbs[breadcrumbs.length - 1]

  return (
    <div className="block md:hidden">
      {/* Sentinel — when this scrolls out of view, bar becomes sticky */}
      <div ref={sentinelRef} className="h-0 w-full" />

      <div
        ref={barRef}
        className={cn(
          'flex items-center gap-3 py-2 px-1 transition-none',
          'transform-gpu backface-hidden will-change-[transform,border-radius,backdrop-filter]',
          isSticky && [
            /* Sticky mode — glass pill at top */
            'sticky top-0 z-50 -mx-4 px-4 py-3',
            'bg-background/72 dark:bg-background/68',
            'backdrop-blur-[20px] backdrop-saturate-[360%]',
            'shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.4),0_1px_3px_0_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.08)]',
            'dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.06),0_1px_3px_0_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.3)]',
            'border-b border-border/30 dark:border-white/5',
          ],
        )}
      >
        {/* Liquid Glass Back Button */}
        <Button
          onClick={onBack}
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full flex-shrink-0 relative overflow-hidden",
            // Liquid glass effect
            "bg-primary/15 hover:bg-primary/25",
            "backdrop-blur-md border border-white/20",
            "text-primary",
            "shadow-[0_2px_8px_-2px_rgba(var(--ios26-accent-rgb,59,130,246),0.25),inset_0_0.5px_0_0_rgba(255,255,255,0.3)]",
            "dark:shadow-[0_2px_8px_-2px_rgba(var(--ios26-accent-rgb,59,130,246),0.3),inset_0_0.5px_0_0_rgba(255,255,255,0.06)]",
            // Liquid transitions
            "transition-[transform,box-shadow,background,filter] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
            "hover:scale-110 hover:shadow-[0_4px_16px_-2px_rgba(var(--ios26-accent-rgb,59,130,246),0.35),inset_0_0.5px_0_0_rgba(255,255,255,0.4)]",
            "active:scale-95 active:brightness-[0.96]",
            "transform-gpu backface-hidden",
          )}
        >
          <ChevronLeft className="h-5 w-5 relative z-10" />
          <span className="sr-only">Kembali</span>
        </Button>
        
        {/* Current page title */}
        <div className={cn(
          "flex items-center gap-2 text-base font-semibold text-foreground",
          "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
        )}>
          {currentPage?.icon}
          <span>{currentPage?.label}</span>
        </div>
      </div>
    </div>
  )
}
