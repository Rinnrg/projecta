import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Liquid Glass Input — from tema/src/styles/components/ion-searchbar.scss
 * glass-background on input, border-radius: 20px
 * Easing from tema/src/transition/ios.transition.ts
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        /* Glass input — from ion-searchbar.scss: glass-background + rounded-[20px] */
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'dark:bg-input/30 border-input h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base md:text-sm',
        'rounded-[20px] border-[0.5px]',
        /* Inner shadow from api.scss glass-background */
        'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.12)]',
        'dark:shadow-[inset_0_0_8px_0_rgba(0,0,0,0.15)]',
        /* Transition: 140ms from default-variables.scss, easing from ios.transition.ts */
        'transition-[color,box-shadow,border-color,transform] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Floating Label Input — from tema/src/styles/components/ion-list.scss
 * ion-input[labelplacement='floating'] pattern:
 * - Label starts inside input, animates up on focus/value
 * - translateY(-2px) when not floating
 * - transition: transform 200ms ease
 */
function FloatingInput({
  className,
  label,
  type,
  id,
  error,
  ...props
}: React.ComponentProps<'input'> & {
  label: string
  error?: string
}) {
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const hasValue = props.value !== undefined && props.value !== '' && props.value !== null

  const isFloating = isFocused || hasValue

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        id={id}
        data-slot="floating-input"
        className={cn(
          /* Glass input — same as Input but with floating label padding */
          'peer dark:bg-input/30 border-input h-14 w-full min-w-0 bg-transparent px-4 pt-5 pb-1 text-base md:text-sm',
          'rounded-[20px] border-[0.5px]',
          'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.12)]',
          'dark:shadow-[inset_0_0_8px_0_rgba(0,0,0,0.15)]',
          'transition-[color,box-shadow,border-color,transform] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          error && 'border-destructive ring-destructive/20',
          'placeholder:text-transparent',
          className,
        )}
        placeholder={label}
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          /* Floating label — from ion-list.scss: transition transform 200ms ease */
          'absolute left-4 pointer-events-none',
          'text-muted-foreground',
          'transition-[transform,font-size,color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'origin-top-left',
          isFloating
            ? 'translate-y-1.5 scale-[0.75] text-primary'
            : 'translate-y-4 scale-100',
          error && 'text-destructive',
        )}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1.5 text-xs text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">{error}</p>
      )}
    </div>
  )
}

export { Input, FloatingInput }
