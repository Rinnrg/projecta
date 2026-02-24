import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Textarea
 * From tema/src/styles/components/ion-searchbar.scss: glass input, rounded-[20px]
 * From tema/src/styles/utils/api.scss: glass-background inner shadow
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-ring/50',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'dark:bg-input/30 flex field-sizing-content min-h-16 w-full bg-transparent px-3 py-2 text-base md:text-sm',
        /* Rounded from searchbar.scss: border-radius: 20px */
        'rounded-[20px] border-[0.5px]',
        /* Inner shadow from api.scss glass-background */
        'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.12)]',
        'dark:shadow-[inset_0_0_8px_0_rgba(0,0,0,0.15)]',
        /* Transition: 140ms from default-variables.scss, easing from ios.transition.ts */
        'transition-[color,box-shadow,border-color] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none',
        'focus-visible:ring-[3px]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
