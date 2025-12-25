"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimateInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: number
}

export function AnimateIn({ children, className, delay = 0, stagger }: AnimateInProps) {
  const staggerClass = stagger ? `stagger-${Math.min(stagger, 10)}` : ""

  return (
    <div
      className={cn("animate-bounce-in", staggerClass, className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

interface AnimateStaggerProps {
  children: React.ReactNode
  className?: string
  baseDelay?: number
  staggerDelay?: number
}

export function AnimateStagger({ children, className, baseDelay = 0, staggerDelay = 60 }: AnimateStaggerProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child

        return (
          <div className="animate-bounce-in" style={{ animationDelay: `${baseDelay + index * staggerDelay}ms` }}>
            {child}
          </div>
        )
      })}
    </div>
  )
}
