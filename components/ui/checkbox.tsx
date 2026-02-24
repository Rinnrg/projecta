'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Checkbox
 * Border-radius from tema: rounded like pills
 * Transition: 140ms from default-variables.scss
 * Easing from ios.transition.ts: cubic-bezier(0.32,0.72,0,1)
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-input dark:bg-input/30 size-5 shrink-0 rounded-[6px] border shadow-xs outline-none',
        'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        /* Transition: 140ms from default-variables.scss, easing from ios.transition.ts */
        'transition-[background,box-shadow,border-color,transform] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        /* Activated scale from ion-alert.scss pattern: scale(1.016) */
        'active:scale-[1.1]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current animate-in zoom-in-75 duration-150"
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
