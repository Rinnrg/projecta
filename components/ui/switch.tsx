'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Switch — simplified version without drag gesture
 * Just click to toggle, no complex pointer handling, no blob
 * From tema/src/styles/components/ion-toggle.scss:
 * - Track: width 64px, height 28px
 * - Handle: 24px circle, positioned at left (unchecked) or right (checked)
 * - No hover effects, no blob
 */

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        /* Track — exact tema: width 64px, height 28px */
        'peer inline-flex h-[28px] w-[64px] shrink-0 cursor-pointer items-center rounded-full',
        'border-none shadow-none outline-none',
        /* Glass track backgrounds — tema: --track-background rgba(text-color, 0.23) */
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground/[0.23]',
        'dark:data-[state=unchecked]:bg-white/[0.23]',
        /* Tema: box-shadow: inset 0 0 8px 0 var(--track-background) */
        'data-[state=unchecked]:shadow-[inset_0_0_8px_0_rgba(0,0,0,0.08)]',
        'dark:data-[state=unchecked]:shadow-[inset_0_0_8px_0_rgba(255,255,255,0.06)]',
        /* Focus ring — only on keyboard focus, NO hover effects */
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'overflow-visible',
        /* Smooth color transition on toggle */
        'transition-colors duration-200 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-50',
        /* NO hover effects */
        'hover:brightness-100 hover:shadow-none',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          /* Handle — 24px circle */
          'pointer-events-none block h-6 w-6 rounded-full ring-0',
          'bg-background',
          'dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground',
          /* Translation positions: unchecked (2px) to checked (38px) */
          'data-[state=checked]:translate-x-[38px] data-[state=unchecked]:translate-x-[2px]',
          /* Smooth slide transition */
          'transition-transform duration-200 ease-out',
          /* Handle shadow */
          'shadow-[0_2px_8px_0_rgba(0,0,0,0.18),0_1px_3px_0_rgba(0,0,0,0.12)]',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
