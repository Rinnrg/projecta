'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Tabs — Fluid Water-Glass Transitions + Drag Gesture
 * From tema/src/styles/components/ion-segment.scss
 * Blob positions at active text, follows pointer during drag, text turns blue when active
 * No clipping — overflow visible, no top/left/right borders that crop
 */

const SPRING_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const LIQUID_SETTLE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const WATER_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

/**
 * Segment scale values from tema/src/index.ts registerSegmentEffect
 */
const SEGMENT_SCALES = {
  small: 'scale(1.35)',
  medium: 'scale(1.45)',
  large: 'scale(1.55)',
  xlarge: 'scale(1.55, 1.65)',
}

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

/**
 * TabsList — Liquid Glass container with morphing indicator blob + drag gesture
 * Blob snaps to active tab, follows pointer during drag, liquid morphing animations
 * Container uses overflow-visible, no clipping borders
 */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const blobRef = React.useRef<HTMLDivElement>(null)
  const blobInnerRef = React.useRef<HTMLDivElement>(null)
  const prevIdxRef = React.useRef(-1)

  /* Drag gesture refs */
  const isDragging = React.useRef(false)
  const isPointerDown = React.useRef(false) // NEW: track pointer down state
  const startX = React.useRef(0)
  const lastPointerX = React.useRef(0)
  const lastTimestamp = React.useRef(0)
  const lastVelocity = React.useRef(0)
  const maxVelocity = React.useRef(0)
  const dragTargetIdx = React.useRef(-1)
  const dragThreshold = 6 // px before drag activates

  /* Helper: get all triggers with their values */
  const getTriggersWithValues = React.useCallback(() => {
    const list = listRef.current
    if (!list) return []
    const triggers = Array.from(list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]'))
    return triggers.map(trigger => {
      // Get the actual value from Radix TabsTrigger
      const value = trigger.getAttribute('data-value') || trigger.getAttribute('value')
      // If no explicit value, derive from text content with proper mapping
      const textContent = trigger.textContent?.trim() || ''
      const derivedValue = value || (() => {
        switch(textContent.toLowerCase()) {
          case 'materi': return 'materials'
          case 'asesmen': return 'assessments'  
          case 'siswa': return 'students'
          default: return textContent.toLowerCase()
        }
      })()
      
      return {
        element: trigger,
        value: derivedValue
      }
    })
  }, [])

  /* Helper: get all triggers */
  const getTriggers = React.useCallback(() => {
    const list = listRef.current
    if (!list) return []
    return Array.from(list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]'))
  }, [])

  /* Helper: trigger tab change via Radix value */
  const triggerTabChange = React.useCallback((targetIdx: number) => {
    const triggersWithValues = getTriggersWithValues()
    if (targetIdx < 0 || targetIdx >= triggersWithValues.length) return false

    const { element: targetTrigger, value: targetValue } = triggersWithValues[targetIdx]
    
    if (targetValue) {
      const tabsRoot = listRef.current?.closest('[data-slot="tabs"]') as HTMLElement
      
      if (tabsRoot) {
        const reactFiber = (tabsRoot as any)._reactInternalFiber || (tabsRoot as any).__reactInternalInstance
        if (reactFiber) {
          try {
            let fiber = reactFiber
            while (fiber) {
              if (fiber.memoizedProps && fiber.memoizedProps.onValueChange) {
                fiber.memoizedProps.onValueChange(targetValue)
                return true
              }
              fiber = fiber.return
            }
          } catch { /* fallback */ }
        }
        
        tabsRoot.dispatchEvent(new CustomEvent('valueChange', {
          detail: { value: targetValue },
          bubbles: true
        }))
        
        setTimeout(() => {
          targetTrigger.focus()
          targetTrigger.click()
        }, 0)
        
        return true
      }
    }
    
    return false
  }, [getTriggersWithValues])

  /* Helper: find trigger at X coordinate */
  const getTriggerAtX = React.useCallback((x: number): number => {
    const triggers = getTriggers()
    
    // Find trigger that contains the X coordinate
    for (let i = 0; i < triggers.length; i++) {
      const rect = triggers[i].getBoundingClientRect()
      // Add some tolerance for edge cases
      const tolerance = 5
      if (x >= rect.left - tolerance && x <= rect.right + tolerance) {
        return i
      }
    }
    
    // If no exact match, find closest trigger
    let closestIdx = -1
    let closestDistance = Infinity
    
    for (let i = 0; i < triggers.length; i++) {
      const rect = triggers[i].getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const distance = Math.abs(x - centerX)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestIdx = i
      }
    }
    
    return closestIdx
  }, [getTriggers])

  /* Move blob to absolute X during drag */
  const moveBlobToX = React.useCallback((x: number) => {
    const blob = blobRef.current
    const list = listRef.current
    if (!blob || !list) return
    const listRect = list.getBoundingClientRect()
    const blobWidth = blob.offsetWidth
    const relX = x - listRect.left - blobWidth / 2
    const clamped = Math.max(3, Math.min(relX, listRect.width - blobWidth - 3))
    blob.style.transition = 'none'
    blob.style.left = `${clamped}px`
  }, [])

  /* Animate blob inner for drag states */
  const animateBlobInner = React.useCallback((type: 'zoomIn' | 'settle' | 'slowly' | 'moveRight' | 'moveLeft') => {
    const inner = blobInnerRef.current
    if (!inner) return

    if (type === 'zoomIn') {
      inner.animate([
        { transform: 'scale(1)', borderRadius: '22px' },
        { transform: SEGMENT_SCALES.large, borderRadius: '22px' },
      ], { duration: 250, easing: LIQUID_SETTLE, fill: 'forwards' })
      return
    }

    if (type === 'settle') {
      inner.animate([
        { transform: inner.style.transform || SEGMENT_SCALES.large, borderRadius: '22px' },
        { transform: 'scale(1.06, 1.08)', borderRadius: '20px 24px 24px 20px', offset: 0.25 },
        { transform: 'scale(0.98, 1.01)', borderRadius: '23px 21px 21px 23px', offset: 0.6 },
        { transform: 'scale(1)', borderRadius: '22px' },
      ], { duration: 400, easing: LIQUID_SETTLE, fill: 'forwards' })
      return
    }

    const keyframes: Record<string, Keyframe[]> = {
      moveRight: [
        { transform: SEGMENT_SCALES.large, borderRadius: '22px', offset: 0 },
        { transform: SEGMENT_SCALES.small, borderRadius: '18px 26px 26px 18px', offset: 0.3 },
        { transform: SEGMENT_SCALES.xlarge, borderRadius: '26px 18px 18px 26px', offset: 0.6 },
        { transform: SEGMENT_SCALES.large, borderRadius: '22px', offset: 1 },
      ],
      moveLeft: [
        { transform: SEGMENT_SCALES.large, borderRadius: '22px', offset: 0 },
        { transform: SEGMENT_SCALES.xlarge, borderRadius: '26px 18px 18px 26px', offset: 0.1 },
        { transform: SEGMENT_SCALES.small, borderRadius: '18px 26px 26px 18px', offset: 0.5 },
        { transform: SEGMENT_SCALES.large, borderRadius: '22px', offset: 1 },
      ],
      slowly: [
        { transform: SEGMENT_SCALES.large, borderRadius: '22px', offset: 0 },
        { transform: SEGMENT_SCALES.medium, borderRadius: '20px 24px 24px 20px', offset: 0.4 },
        { transform: SEGMENT_SCALES.large, borderRadius: '22px', offset: 1 },
      ],
    }

    inner.animate(keyframes[type], { duration: 800, easing: WATER_EASING, fill: 'forwards' })
  }, [])

  /* Move the blob to a specific trigger index */
  const moveBlobToIdx = React.useCallback((idx: number, animated = true) => {
    const list = listRef.current
    const blob = blobRef.current
    const inner = blobInnerRef.current
    if (!list || !blob || !inner) return

    const triggers = getTriggers()
    const trigger = triggers[idx]
    if (!trigger) { blob.style.opacity = '0'; return }

    const listRect = list.getBoundingClientRect()
    const triggerRect = trigger.getBoundingClientRect()
    const left = triggerRect.left - listRect.left
    const width = triggerRect.width

    const prev = prevIdxRef.current
    const distance = prev >= 0 ? Math.abs(idx - prev) : 0
    const dir = idx > prev ? 1 : idx < prev ? -1 : 0

    if (animated && prev >= 0 && distance > 0) {
      const dur = 380 + distance * 50

      const stretchX = 1 + distance * 0.12
      const squashY = 1 - distance * 0.04
      const overshoot = dir * (5 + distance * 2)

      inner.animate([
        { transform: 'scale(1)', borderRadius: '22px', offset: 0 },
        { transform: `scaleX(${stretchX}) scaleY(${squashY}) translateX(${overshoot}px)`, borderRadius: `${18 - distance}px ${26 + distance}px ${26 + distance}px ${18 - distance}px`, offset: 0.25 },
        { transform: SEGMENT_SCALES.medium, borderRadius: `${24 + distance}px ${20 - distance}px ${20 - distance}px ${24 + distance}px`, offset: 0.55 },
        { transform: `scaleX(${1 + distance * 0.03}) scaleY(${1 - distance * 0.015})`, borderRadius: '21px 23px 23px 21px', offset: 0.8 },
        { transform: 'scale(1)', borderRadius: '22px', offset: 1 },
      ], { duration: dur + 150, easing: LIQUID_SETTLE, fill: 'forwards' })

      blob.style.transition = `left ${dur}ms ${SPRING_EASING}, width ${dur}ms ${SPRING_EASING}, opacity 180ms ease`
    } else {
      blob.style.transition = animated
        ? `left 300ms ${SPRING_EASING}, width 300ms ${SPRING_EASING}, opacity 180ms ease`
        : 'none'
    }

    blob.style.left = `${left}px`
    blob.style.width = `${width}px`
    blob.style.opacity = '1'
    prevIdxRef.current = idx
  }, [getTriggers])

  /* Sync blob when active state changes (click or programmatic) */
  const syncBlob = React.useCallback((animated = true) => {
    if (isDragging.current) return // Don't interfere during drag
    const list = listRef.current
    if (!list) return
    const triggers = getTriggers()
    const active = list.querySelector<HTMLElement>('[data-state="active"]')
    if (!active) { if (blobRef.current) blobRef.current.style.opacity = '0'; return }
    const idx = triggers.indexOf(active)
    // Only move blob if the active tab actually changed, not on hover or other state changes
    if (idx >= 0 && idx !== prevIdxRef.current) moveBlobToIdx(idx, animated)
  }, [getTriggers, moveBlobToIdx])

  /* Observe ONLY active state changes via MutationObserver - filter out hover and other states */
  React.useEffect(() => {
    const list = listRef.current
    if (!list) return
    syncBlob(false)
    
    const obs = new MutationObserver((mutations) => {
      // Only respond to actual data-state="active" changes, ignore hover and other mutations
      const hasActiveStateChange = mutations.some(mutation => 
        mutation.type === 'attributes' && 
        mutation.attributeName === 'data-state' &&
        (mutation.target as HTMLElement).getAttribute('data-state') === 'active'
      )
      if (hasActiveStateChange) {
        syncBlob(true)
      }
    })
    obs.observe(list, { attributes: true, attributeFilter: ['data-state'], subtree: true })
    
    const onResize = () => syncBlob(false)
    window.addEventListener('resize', onResize)
    return () => { 
      obs.disconnect(); 
      window.removeEventListener('resize', onResize) 
    }
  }, [syncBlob])

  /* ---- Drag Gesture Handlers ---- */
  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    // Only handle left mouse button or touch
    if (e.button !== undefined && e.button !== 0) return
    
    isPointerDown.current = true // Mark pointer as down
    isDragging.current = false // Reset drag state
    startX.current = e.clientX
    lastPointerX.current = e.clientX
    lastTimestamp.current = e.timeStamp
    lastVelocity.current = 0
    maxVelocity.current = 0

    const idx = getTriggerAtX(e.clientX)
    dragTargetIdx.current = idx

    // Container micro-scale lift
    const list = listRef.current
    if (list) {
      list.style.transition = `transform 200ms ${SPRING_EASING}`
      list.style.transform = 'scale(1.04) translateZ(0)'
    }

    // Capture pointer for reliable drag tracking
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [getTriggerAtX])

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    // CRITICAL: ONLY respond when pointer is actually down - NEVER on hover without pointer down
    if (!isPointerDown.current) return
    
    const dx = Math.abs(e.clientX - startX.current)

    // Activate drag mode after threshold
    if (!isDragging.current && dx > dragThreshold) {
      isDragging.current = true
      const idx = getTriggerAtX(e.clientX)
      if (idx >= 0) {
        moveBlobToIdx(idx, false)
        animateBlobInner('zoomIn')
        dragTargetIdx.current = idx
      }
    }

    // CRITICAL: Exit early if not actively dragging - this prevents hover blob movement
    if (!isDragging.current) return

    // Velocity tracking
    const dt = e.timeStamp - lastTimestamp.current
    if (dt > 0) {
      lastVelocity.current = (e.clientX - lastPointerX.current) / dt
    }
    lastPointerX.current = e.clientX
    lastTimestamp.current = e.timeStamp

    const absV = Math.abs(lastVelocity.current)
    if (absV > maxVelocity.current) maxVelocity.current = absV

    // Blob inner morph based on velocity
    if (absV > 0.2) {
      animateBlobInner('slowly')
    }
    if (maxVelocity.current > 0.2 && absV < 0.15 && dx > 40) {
      animateBlobInner(lastVelocity.current > 0 ? 'moveRight' : 'moveLeft')
      maxVelocity.current = 0
    }

    // Blob follows pointer
    moveBlobToX(e.clientX)

    // Highlight trigger under pointer
    const triggers = getTriggers()
    const idx = getTriggerAtX(e.clientX)
    if (idx >= 0 && idx !== dragTargetIdx.current) {
      // Revert old trigger
      if (dragTargetIdx.current >= 0 && triggers[dragTargetIdx.current]) {
        const old = triggers[dragTargetIdx.current]
        old.style.color = ''
        old.style.transition = 'color 200ms ease'
      }
      // Highlight new trigger blue
      const cur = triggers[idx]
      if (cur) {
        cur.style.transition = 'color 150ms ease'
        cur.style.color = 'hsl(var(--primary))'
      }
      dragTargetIdx.current = idx
    }
  }, [getTriggerAtX, getTriggers, moveBlobToX, moveBlobToIdx, animateBlobInner])

  const onPointerUp = React.useCallback((e: React.PointerEvent) => {
    // Reset pointer down state
    isPointerDown.current = false
    
    // Container settle
    const list = listRef.current
    if (list) {
      list.style.transition = `transform 350ms ${LIQUID_SETTLE}`
      list.style.transform = 'translateZ(0)'
    }

    // Clear inline styles from drag highlighting
    const triggers = getTriggers()
    triggers.forEach(el => { el.style.color = ''; el.style.transition = '' })

    if (!isDragging.current) {
      // Check if this was a potential drag that didn't reach threshold
      const dx = Math.abs(e.clientX - startX.current)
      if (dx > 0 && dx < dragThreshold) {
        // Small movement - treat as click on target under pointer
        const targetIdx = getTriggerAtX(e.clientX)
        if (targetIdx >= 0 && triggers[targetIdx]) {
          // Don't prevent default - let Radix handle the click
          isDragging.current = false
          dragTargetIdx.current = -1
          return
        }
      }
      
      // Pure click (no movement) — Radix handles this via its own click
      isDragging.current = false
      dragTargetIdx.current = -1
      return
    }

    // Was dragging - now determine final target
    isDragging.current = false

    // PRIORITIZE dragTargetIdx (last target during drag) over release position
    // This handles cases where release position differs from drag target
    let targetIdx = dragTargetIdx.current
    
    // Only use release position if no drag target was set
    if (targetIdx < 0) {
      targetIdx = getTriggerAtX(e.clientX)
    }
    
    // Final fallback to current active tab
    if (targetIdx < 0) {
      const active = list?.querySelector<HTMLElement>('[data-state="active"]')
      targetIdx = active ? triggers.indexOf(active) : 0
    }

    // Settle blob animation first
    animateBlobInner('settle')
    moveBlobToIdx(targetIdx, true)

    // Programmatically switch to target tab
    if (targetIdx >= 0 && triggers[targetIdx]) {
      const trigger = triggers[targetIdx]
      
      const success = triggerTabChange(targetIdx)
      
      if (!success) {
        setTimeout(() => { trigger.click() }, 10)
        setTimeout(() => { trigger.focus(); trigger.click() }, 30)
        setTimeout(() => {
          trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        }, 50)
        setTimeout(() => {
          trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
          trigger.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
          trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        }, 70)
      }
    }

    dragTargetIdx.current = -1
    maxVelocity.current = 0
  }, [getTriggerAtX, getTriggers, moveBlobToIdx, animateBlobInner, triggerTabChange])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}  
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      // Disable mouse events that might trigger blob movement on hover
      onMouseEnter={undefined}
      onMouseLeave={undefined}
      onMouseMove={undefined}
      onMouseOver={undefined}
      onMouseOut={undefined}
      className={cn(
        /* Liquid Glass container — overflow VISIBLE, NO clipping borders */
        'relative inline-flex h-11 w-fit items-center justify-center p-[3px]',
        'rounded-[25px]',
        /* Glass background from api.scss glass-background mixin */
        'bg-white/72 dark:bg-[rgba(40,40,40,0.72)]',
        'backdrop-blur-[20px] backdrop-saturate-[360%]',
        /* Multi-layer glass shadow — inner glow + outer bloom (NO border) */
        'shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.5),inset_0_0_8px_0_rgba(220,220,220,0.15),0_1px_3px_0_rgba(0,0,0,0.04),0_0_10px_0_rgba(220,220,220,0.6)]',
        'dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.06),inset_0_0_8px_0_rgba(60,60,60,0.35),0_1px_3px_0_rgba(0,0,0,0.15),0_0_10px_0_rgba(0,0,0,0.5)]',
        /* GPU compositing + overflow visible for blob to exceed container */
        'transform-gpu backface-hidden',
        'overflow-visible',
        /* Touch action for drag gesture */
        'touch-action-none select-none',
        className,
      )}
      style={{ touchAction: 'none' }}
      {...props}
    >
      {/* Morphing water blob indicator */}
      <div
        ref={blobRef}
        aria-hidden
        className={cn(
          'absolute top-[3px] bottom-[3px] z-0 pointer-events-none',
          'rounded-[22px]',
        )}
        style={{ left: 0, width: 0, opacity: 0, willChange: 'left, width' }}
      >
        {/* Inner blob — scales/morphs on tab change and drag */}
        <div
          ref={blobInnerRef}
          className={cn(
            'w-full h-full rounded-[22px]',
            /* Water-glass fill — from ion-segment-button.scss .ion-cloned-element */
            'bg-black/[0.06] dark:bg-white/[0.09]',
            /* Glass background from api.scss glass-background(1, 0, 104%) on cloned element */
            'backdrop-blur-[2px] backdrop-saturate-[104%]',
            /* Inner refraction shadow — water surface effect */
            'shadow-[inset_0_1px_3px_0_rgba(0,0,0,0.06),inset_0_-0.5px_1px_0_rgba(255,255,255,0.3),0_0_6px_0_rgba(0,0,0,0.02)]',
            'dark:shadow-[inset_0_1px_3px_0_rgba(255,255,255,0.06),inset_0_-0.5px_1px_0_rgba(255,255,255,0.04),0_0_6px_0_rgba(255,255,255,0.02)]',
          )}
          style={{ transformOrigin: 'center center', willChange: 'transform, border-radius' }}
        />
      </div>
      {props.children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        /* Base layout */
        'relative z-[1] inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 px-3 py-1.5',
        'text-sm font-medium whitespace-nowrap',
        'text-foreground/60 dark:text-white/50',
        /* Liquid Glass pill — rounded from ion-segment-button */
        'rounded-[22px] mx-[2px]',
        /* Fluid water-like transitions — smooth multi-property */
        'transition-[color,transform,filter] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'transform-gpu backface-hidden',
        /* NO hover effects - disabled per user request - explicitly reset all possible hover states */
        'hover:!text-foreground/60 dark:hover:!text-white/50 hover:!transform-none hover:!filter-none hover:!brightness-100 hover:!scale-100 hover:!opacity-100 hover:!bg-transparent hover:!shadow-none',
        /* Prevent any pointer events that might trigger blob movement on hover */
        'pointer-events-auto',
        /* Active press: water squish */
        'active:scale-[1.06] active:brightness-[1.04]',
        /* Selected: text turns BLUE (primary) — like navbar behavior */
        'data-[state=active]:text-primary dark:data-[state=active]:text-primary',
        'data-[state=active]:font-semibold',
        /* Focus */
        'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 outline-none',
        /* Fluid water-glass entrance */
        'animate-in fade-in-0 slide-in-from-bottom-1 duration-300',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
