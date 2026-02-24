"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'

interface BreadcrumbConfig {
  [key: string]: {
    label: string
    icon?: React.ReactNode
  }
}

const breadcrumbConfig: BreadcrumbConfig = {
  '/': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  '/dashboard': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  '/courses': { label: 'Kursus' },
  '/materi': { label: 'Materi' },
  '/asesmen': { label: 'Asesmen' },
  '/projects': { label: 'Proyek' },
  '/proyek': { label: 'Proyek Saya' },
  '/users': { label: 'Pengguna' },
  '/schedule': { label: 'Jadwal' },
  '/profile': { label: 'Profil' },
  '/settings': { label: 'Pengaturan' },
  '/compiler': { label: 'Compiler' },
  '/add': { label: 'Tambah' },
  '/edit': { label: 'Edit' },
  '/kelompok': { label: 'Kelompok' },
  '/sintaks_1': { label: 'Sintaks 1: Orientasi Masalah' },
  '/sintaks_2': { label: 'Sintaks 2: Organisasi Belajar' },
  '/sintaks_3': { label: 'Sintaks 3: Investigasi Individual/Kelompok' },
  '/sintaks_4': { label: 'Sintaks 4: Pengembangan dan Penyajian' },
  '/sintaks_5': { label: 'Sintaks 5: Analisis dan Evaluasi' },
  '/sintaks_6': { label: 'Sintaks 6: Refleksi' },
  '/sintaks_7': { label: 'Sintaks 7: Assessment' },
  '/sintaks_8': { label: 'Sintaks 8: Closure' },
  '/nilai': { label: 'Nilai' },
  '/pengumpulan': { label: 'Pengumpulan' },
  '/activity': { label: 'Aktivitas' },
  '/stats': { label: 'Statistik' },
  '/search': { label: 'Pencarian' },
}

interface AppBreadcrumbProps {
  className?: string
}

export function AppBreadcrumb({ className }: AppBreadcrumbProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Don't show breadcrumb on login page or root dashboard
  if (pathname === '/login' || pathname === '/' || pathname === '/dashboard') {
    return null
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []

  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
    isActive: false
  })

  // Build breadcrumbs from path segments
  let currentPath = ''
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    currentPath += `/${segment}`
    
    const config = breadcrumbConfig[`/${segment}`] || breadcrumbConfig[currentPath]
    const isActive = i === pathSegments.length - 1
    
    // Handle dynamic routes (like [id])
    let label = config?.label || segment
    
    // If it's a dynamic ID, try to make it more readable
    if (!config && segment.length > 10 && segment.includes('-')) {
      label = 'Detail'
    } else if (!config && /^[0-9a-f]{24}$/.test(segment)) {
      label = 'Detail'
    } else if (!config) {
      // Capitalize first letter and replace dashes with spaces
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      icon: config?.icon,
      isActive
    })
  }

  return (
    <div className={cn('mb-6', className)}>
      {/* Desktop & Tablet Breadcrumb */}
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isActive ? (
                  <BreadcrumbPage className="flex items-center gap-2 text-foreground font-medium">
                    {crumb.icon}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={crumb.href} 
                      className="flex items-center gap-2 hover:text-foreground transition-colors text-muted-foreground"
                    >
                      {crumb.icon}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Mobile - Show back button and current page title */}
      <div className="block md:hidden">
        <div className="flex items-center gap-3">
          {/* Floating Back Button for Mobile */}
          <Button
            onClick={() => router.back()}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700",
              "text-white shadow-lg",
              "transition-all duration-200 ease-in-out",
              "hover:scale-105 active:scale-95",
              "flex-shrink-0"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Kembali</span>
          </Button>
          
          {/* Current page title */}
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            {breadcrumbs[breadcrumbs.length - 1]?.icon}
            {breadcrumbs[breadcrumbs.length - 1]?.label}
          </div>
        </div>
      </div>
    </div>
  )
}
