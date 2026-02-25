"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void
  resetBreadcrumbs: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  const addBreadcrumb = (breadcrumb: BreadcrumbItem) => {
    setBreadcrumbs(prev => [...prev, breadcrumb])
  }

  const resetBreadcrumbs = () => {
    setBreadcrumbs([])
  }

  return (
    <BreadcrumbContext.Provider value={{
      breadcrumbs,
      setBreadcrumbs,
      addBreadcrumb,
      resetBreadcrumbs
    }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}

// Hook untuk auto-update breadcrumb berdasarkan pathname
export function useAutoBreadcrumb(pathname: string) {
  const { setBreadcrumbs } = useBreadcrumb()
  
  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      if (segment === 'dashboard') return
      
      currentPath += `/${segment}`
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      const isLast = index === segments.length - 1
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      })
    })
    
    return breadcrumbs
  }
  
  setBreadcrumbs(generateBreadcrumbs(pathname))
}

// Hook untuk mengatur breadcrumb khusus halaman
export function useBreadcrumbPage(title: string, breadcrumbs?: BreadcrumbItem[]) {
  const { setBreadcrumbs } = useBreadcrumb()
  
  useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs)
    } else {
      setBreadcrumbs([
        { label: 'Dashboard', href: '/dashboard' },
        { label: title }
      ])
    }
  }, [title, breadcrumbs, setBreadcrumbs])
}
