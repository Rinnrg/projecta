'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Slider
 * From tema/src/styles/components/ion-range.scss:
 * - --knob-size: 20px, --knob-border-radius: 24px
 * - Knob width: 38px, transition: transform 300ms ease
 * - Pressed knob: scale(1.4, 1.6), glass-background(0.1, 0.5px, 120%)
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={
          'bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
        }
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={
            'bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
          }
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            /* Knob from ion-range.scss: rounded-3xl, 38px wide equivalent */
            'border-primary ring-ring/50 block size-5 shrink-0 rounded-3xl border bg-white shadow-sm',
            /* Transition from ion-range.scss: transform 300ms ease */
            'transition-[color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            'hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden',
            /* Pressed: scale(1.4, 1.6) from ion-range.scss .range-pressed::part(knob) */
            'active:scale-x-[1.4] active:scale-y-[1.6]',
            /* Glass effect on press from api.scss glass-background(0.1, 0.5px, 120%) */
            'active:shadow-[inset_0_0_8px_-4px_rgba(var(--primary))]',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
