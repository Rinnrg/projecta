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

export function BreadcrumbProvider({ children }: { children: ReactNode }): JSX.Element {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  const addBreadcrumb = (breadcrumb: BreadcrumbItem) => {
    setBreadcrumbs(prev => [...prev, breadcrumb])
  }

  const resetBreadcrumbs = () => {
    setBreadcrumbs([])
  }

  return {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    resetBreadcrumbs,
    children
  } as any
}
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}

// Hook untuk set breadcrumb berdasarkan halaman
export function useBreadcrumbPage(items: BreadcrumbItem[]) {
  const { setBreadcrumbs } = useBreadcrumb()
  
  useEffect(() => {
    setBreadcrumbs(items)
    
    return () => {
      setBreadcrumbs([])
    }
  }, [items, setBreadcrumbs])
}
