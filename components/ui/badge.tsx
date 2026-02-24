import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Badge / Chip
 * From tema/src/styles/components/ion-alert.scss: scale(1.016) activated
 * From tema/src/styles/utils/api.scss: glass-background for secondary
 * From tema/src/styles/default-variables.scss: 140ms activated transition
 * Easing from tema/src/transition/ios.transition.ts
 */
const badgeVariants = cva(
  [
    'inline-flex items-center justify-center border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0',
    '[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    'overflow-hidden',
    /* Pill shape — rounded-full like iOS 26 chips */
    'rounded-full',
    /* Transition: 140ms from default-variables.scss, easing from ios.transition.ts */
    'transition-[color,box-shadow,background,transform] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
    'transform-gpu backface-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-primary text-primary-foreground',
          /* Glass inner glow from api.scss */
          'shadow-[inset_0_0_8px_0_rgba(255,255,255,0.15)]',
          /* Scale from ion-alert.scss: scale(1.016) → 1.04 for chip interaction */
          '[a&]:hover:bg-primary/90 [a&]:hover:scale-[1.04]',
        ].join(' '),
        secondary: [
          'border-transparent bg-secondary/80 text-secondary-foreground',
          /* Glass-background from api.scss */
          'backdrop-blur-[2px] backdrop-saturate-[360%]',
          'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.1)]',
          '[a&]:hover:bg-secondary/90 [a&]:hover:scale-[1.04]',
        ].join(' '),
        destructive: [
          'border-transparent bg-destructive text-white',
          'shadow-[inset_0_0_8px_0_rgba(255,255,255,0.1)]',
          '[a&]:hover:bg-destructive/90 [a&]:hover:scale-[1.04]',
          'focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        ].join(' '),
        outline: [
          'text-foreground',
          /* Asymmetric glass border from api.scss */
          'border-white/50 dark:border-white/15',
          'bg-white/40 dark:bg-white/5',
          'backdrop-blur-[2px]',
          '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:scale-[1.04]',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
