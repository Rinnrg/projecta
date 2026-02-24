"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void
  resetBreadcrumbs: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
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

// Hook untuk set breadcrumb berdasarkan halaman
export function useBreadcrumbPage(items: BreadcrumbItem[]) {
  const { setBreadcrumbs } = useBreadcrumb()
  const prevItemsRef = useRef<string>('')
  
  useEffect(() => {
    // Create a serializable key from items (without icons)
    const itemsKey = items.map(item => `${item.label}-${item.href || ''}`).join('|')
    
    // Only update if the items actually changed
    if (prevItemsRef.current !== itemsKey) {
      setBreadcrumbs(items)
      prevItemsRef.current = itemsKey
    }
    
    return () => {
      setBreadcrumbs([])
    }
  }, [items, setBreadcrumbs])
}
