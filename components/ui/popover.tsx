'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@/lib/utils'

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  // iOS 26 Control Center blob entrance
  React.useEffect(() => {
    const el = contentRef.current
    if (!el) return
    el.animate([
      { transform: 'scale(0.4, 0.3)', borderRadius: '28px', opacity: 0, filter: 'blur(8px)', offset: 0 },
      { transform: 'scale(1.06, 1.08)', borderRadius: '18px', opacity: 1, filter: 'blur(0px)', offset: 0.55 },
      { transform: 'scale(0.98, 0.99)', borderRadius: '15px', opacity: 1, filter: 'blur(0px)', offset: 0.78 },
      { transform: 'scale(1, 1)', borderRadius: '16px', opacity: 1, filter: 'blur(0px)', offset: 1 },
    ], { duration: 420, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' })
  }, [])

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={contentRef}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          /* Liquid Glass popover — frosted glass panel */
          'bg-popover/85 dark:bg-popover/80 text-popover-foreground',
          'backdrop-blur-[12px] backdrop-saturate-[200%]',
          'border-[0.5px] border-white/60 dark:border-white/10',
          'shadow-[inset_0_0_4px_0_rgba(255,255,255,0.08),0_4px_24px_-4px_rgba(0,0,0,0.12),0_0_10px_0_rgba(0,0,0,0.06)]',
          'dark:shadow-[inset_0_0_4px_0_rgba(255,255,255,0.03),0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_10px_0_rgba(0,0,0,0.2)]',
          'rounded-2xl p-4 outline-hidden',
          /* Close animation fallback */
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-[0.85]',
          'data-[state=closed]:duration-[200ms] data-[state=closed]:ease-[cubic-bezier(0.32,0.72,0,1)]',
          'z-50 w-72 origin-(--radix-popover-content-transform-origin)',
          'transform-gpu backface-hidden will-change-[transform,border-radius,opacity,filter]',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
