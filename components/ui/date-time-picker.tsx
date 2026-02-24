'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarIcon, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/* ─────────────────────────────────────────────────────────
 *  ion-picker wheel column - SCROLL VERSION with better UX
 *  Scrollable picker like iOS native wheel
 * ───────────────────────────────────────────────────────── */

function IonicPickerColumn({
  items,
  value,
  onChange,
}: {
  items: string[]
  value: string
  onChange: (val: string) => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const itemHeight = 40
  const isScrollingRef = React.useRef(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>(undefined)

  // Scroll to selected value on mount / value change
  React.useEffect(() => {
    if (isScrollingRef.current) return
    const idx = items.indexOf(value)
    if (idx >= 0 && containerRef.current) {
      containerRef.current.scrollTo({
        top: idx * itemHeight,
        behavior: 'smooth',
      })
    }
  }, [value, items])

  const handleScroll = () => {
    isScrollingRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return
      const scrollTop = containerRef.current.scrollTop
      const idx = Math.round(scrollTop / itemHeight)
      const clamped = Math.max(0, Math.min(idx, items.length - 1))

      containerRef.current.scrollTo({
        top: clamped * itemHeight,
        behavior: 'smooth',
      })

      if (items[clamped] !== value) {
        onChange(items[clamped])
      }
      isScrollingRef.current = false
    }, 150)
  }

  return (
    <div className="ionic-picker-column relative h-[200px] w-20 overflow-hidden">
      {/* Wheel highlight - center selection without blur */}
      <div 
        className={cn(
          'pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 h-10',
          'rounded-[20px]',
          'bg-accent/20 dark:bg-accent/15',
          'border border-accent/30 dark:border-accent/20',
          /* Remove backdrop-blur to prevent text blur */
          'z-10'
        )}
      />
      
      {/* Top fade gradient */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background via-background/80 to-transparent z-20" />
      
      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent z-20" />
      
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory no-scrollbar pt-20 pb-20",
          /* Optimize text rendering */
          "subpixel-antialiased",
          "will-change-scroll"
        )}
      >
        {items.map((item, index) => {
          const isSelected = item === value
          return (
            <div
              key={`${item}-${index}`}
              className={cn(
                'flex h-10 w-full items-center justify-center snap-center',
                'text-lg font-medium tabular-nums cursor-pointer',
                'transition-all duration-300 ease-out',
                'select-none',
                /* Sharp text rendering without blur */
                'subpixel-antialiased',
                /* Reduce scale transforms to prevent blur */
                isSelected
                  ? 'text-foreground opacity-100 scale-105 font-semibold'
                  : 'text-muted-foreground opacity-50 scale-95',
                'hover:opacity-80 active:scale-98'
              )}
              onClick={() => onChange(item)}
            >
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
 *  ion-picker - SCROLL VERSION with fade overlay
 *  Clean scrollable picker with better spacing
 * ───────────────────────────────────────────────────────── */

function IonicPicker({
  value,
  onChange,
}: {
  value: { hours: string; minutes: string }
  onChange: (v: { hours: string; minutes: string }) => void
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <div className="ionic-picker flex items-center justify-center gap-8 py-6 px-6">
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Jam</span>
        <div className="subpixel-antialiased">
          <IonicPickerColumn
            items={hours}
            value={value.hours}
            onChange={(h) => onChange({ ...value, hours: h })}
          />
        </div>
      </div>
      
      <div className="flex items-center text-3xl font-bold text-accent/60 select-none mt-8 subpixel-antialiased">
        :
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Menit</span>
        <div className="subpixel-antialiased">
          <IonicPickerColumn
            items={minutes}
            value={value.minutes}
            onChange={(m) => onChange({ ...value, minutes: m })}
          />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
 *  ion-datetime-button - exact replica from tema demo
 *  From tema/demo/src/app/index/pages/date-and-time-pickers
 * ───────────────────────────────────────────────────────── */

function IonicDatetimeButton({
  datetime,
  value,
  onChange,
}: {
  datetime: string
  value: { hours: string; minutes: string }
  onChange: (v: { hours: string; minutes: string }) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-8 px-3 font-mono text-sm',
            'bg-transparent border-accent/20',
            'hover:bg-accent/10',
            'transition-colors duration-200',
          )}
        >
          {value.hours}.{value.minutes}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0 overflow-hidden",
          /* Clear glass styling without blur on text */
          "bg-background border border-border",
          "rounded-[24px] shadow-lg",
          /* Remove any inherited backdrop-blur */
          "backdrop-blur-none",
        )} 
        align="center"
      >
        <div className="ionic-modal-content">
          <IonicPicker value={value} onChange={onChange} />
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ─────────────────────────────────────────────────────────
 *  ion-datetime - exact replica from tema
 *  From tema/src/styles/components/ion-datetime.scss:
 *  @include api.glass-background-overlay;
 *  border-radius: 24px;
 *  --wheel-highlight-background: transparent;
 *  --wheel-highlight-border-radius: 24px;
 * ───────────────────────────────────────────────────────── */

interface IonicDatetimeProps {
  value?: string // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"
  onChange?: (value: string) => void
  presentation?: 'date' | 'time' | 'date-time'
  placeholder?: string
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
  className?: string
}

function IonicDatetime({
  value,
  onChange,
  presentation = 'date',
  placeholder = '1986-04-20T12:00:00',
  min,
  max,
  required,
  disabled,
  id,
  name,
  className,
}: IonicDatetimeProps) {
  const [open, setOpen] = React.useState(false)

  // Parse value based on presentation
  const parsed = React.useMemo(() => {
    if (!value) return { date: undefined, hours: '12', minutes: '00' }
    
    if (presentation === 'date') {
      const d = parse(value, 'yyyy-MM-dd', new Date())
      return { date: isValid(d) ? d : undefined, hours: '12', minutes: '00' }
    }
    
    if (presentation === 'time') {
      const [h = '12', m = '00'] = value.split(':')
      return { date: undefined, hours: h.padStart(2, '0'), minutes: m.padStart(2, '0') }
    }
    
    // date-time
    const normalized = value.replace('T', ' ')
    const [datePart, timePart] = normalized.split(' ')
    const d = parse(datePart, 'yyyy-MM-dd', new Date())
    
    let hours = '12'
    let minutes = '00'
    if (timePart) {
      const [h, m] = timePart.split(':')
      hours = (h || '12').padStart(2, '0')
      minutes = (m || '00').padStart(2, '0')
    }
    
    return { date: isValid(d) ? d : undefined, hours, minutes }
  }, [value, presentation])

  const minDate = React.useMemo(() => {
    if (!min) return undefined
    const d = parse(min.split('T')[0], 'yyyy-MM-dd', new Date())
    return isValid(d) ? d : undefined
  }, [min])

  const maxDate = React.useMemo(() => {
    if (!max) return undefined
    const d = parse(max.split('T')[0], 'yyyy-MM-dd', new Date())
    return isValid(d) ? d : undefined
  }, [max])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    
    if (presentation === 'date') {
      onChange?.(format(date, 'yyyy-MM-dd'))
      setOpen(false)
    } else if (presentation === 'date-time') {
      const dateStr = format(date, 'yyyy-MM-dd')
      onChange?.(`${dateStr}T${parsed.hours}:${parsed.minutes}`)
    }
  }

  const handleTimeChange = (time: { hours: string; minutes: string }) => {
    if (presentation === 'time') {
      onChange?.(`${time.hours}:${time.minutes}`)
    } else if (presentation === 'date-time' && parsed.date) {
      const dateStr = format(parsed.date, 'yyyy-MM-dd')
      onChange?.(`${dateStr}T${time.hours}:${time.minutes}`)
    }
  }

  const getDisplayText = () => {
    if (presentation === 'time') {
      return `${parsed.hours}:${parsed.minutes}`
    }
    
    if (presentation === 'date' && parsed.date) {
      return format(parsed.date, 'dd MMM yyyy', { locale: idLocale })
    }
    
    if (presentation === 'date-time') {
      if (parsed.date) {
        return `${format(parsed.date, 'dd MMM yyyy', { locale: idLocale })} ${parsed.hours}:${parsed.minutes}`
      }
    }
    
    return placeholder
  }

  return (
    <>
      {name && (
        <input type="hidden" name={name} value={value || ''} />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              /**
               * ion-datetime glass-background-overlay from tema/src/styles/components/ion-datetime.scss
               * @include api.glass-background-overlay; (0.6667 opacity, 8px blur)
               * border-radius: 24px;
               */
              'ionic-datetime w-full justify-start text-left font-normal',
              'h-11 px-4 rounded-[24px]',
              /* glass-background-overlay: rgba(glass-bg-rgb, 0.6667) + backdrop-filter: blur(8px) saturate(360%) */
              'bg-background/67 dark:bg-background/67',
              'backdrop-blur-[8px] backdrop-saturate-[360%]',
              /* api.scss glass borders */
              'border-[0.5px]',
              'border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60',
              'dark:border-t-white/12 dark:border-b-white/12 dark:border-r-white/10 dark:border-l-white/8',
              /* glass shadow from api.scss */
              'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.2),0_0_10px_0_rgba(220,220,220,0.82)]',
              'dark:shadow-[inset_0_0_8px_0_rgba(40,40,40,0.2),0_0_10px_0_rgba(0,0,0,0.82)]',
              /* hardware acceleration */
              'transform-gpu backface-hidden',
              'transition-colors duration-200 ease-out',
              'hover:bg-background/80 dark:hover:bg-background/80',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2',
              !value && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon className="mr-3 h-4 w-4 shrink-0 opacity-60" />
            {getDisplayText()}
            {presentation === 'date-time' && (
              <Clock className="ml-auto h-4 w-4 shrink-0 opacity-60" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            /**
             * ion-datetime glass-background-overlay patterns from tema
             */
            'ionic-datetime-popup p-0 w-auto overflow-hidden',
            'rounded-[24px]',
            /* glass-background-overlay: rgba(glass-bg-rgb, 0.6667) + backdrop-filter: blur(8px) saturate(360%) */
            'bg-background/67 dark:bg-background/67',
            'backdrop-blur-[8px] backdrop-saturate-[360%]',
            /* api.scss glass borders */
            'border-[0.5px]',
            'border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60',
            'dark:border-t-white/12 dark:border-b-white/12 dark:border-r-white/10 dark:border-l-white/8',
            /* glass shadow from api.scss */
            'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.2),0_0_10px_0_rgba(220,220,220,0.82)]',
            'dark:shadow-[inset_0_0_8px_0_rgba(40,40,40,0.2),0_0_10px_0_rgba(0,0,0,0.82)]',
            /* hardware acceleration */
            'transform-gpu backface-hidden',
          )}
          align="start"
        >
          <div className="ionic-datetime-content flex flex-col">
            {(presentation === 'date' || presentation === 'date-time') && (
              <Calendar
                mode="single"
                selected={parsed.date}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
                defaultMonth={parsed.date}
                required={required}
              />
            )}

            {(presentation === 'time' || presentation === 'date-time') && (
              <div className={cn(
                'ionic-datetime-time-section',
                presentation === 'date-time' && 'border-t border-white/20 dark:border-white/10 pt-4',
              )}>
                <div className="px-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 opacity-60" />
                      <span className="text-sm font-medium opacity-80">Time</span>
                    </div>
                    <IonicDatetimeButton
                      datetime="time-picker"
                      value={{ hours: parsed.hours, minutes: parsed.minutes }}
                      onChange={handleTimeChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

/* ─────────────────────────────────────────────────────────
 *  Public API - matching tema demo usage
 * ───────────────────────────────────────────────────────── */

// Date picker
function DatePicker(props: Omit<IonicDatetimeProps, 'presentation'>) {
  return <IonicDatetime {...props} presentation="date" />
}

// Time picker  
function TimePicker(props: Omit<IonicDatetimeProps, 'presentation'>) {
  return <IonicDatetime {...props} presentation="time" />
}

// DateTime picker
function DateTimePicker(props: Omit<IonicDatetimeProps, 'presentation'>) {
  return <IonicDatetime {...props} presentation="date-time" />
}

export { DatePicker, TimePicker, DateTimePicker, IonicDatetime }
