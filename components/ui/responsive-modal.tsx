'use client'

import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Drawer as DrawerPrimitive } from 'vaul'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Modal
 * 
 * Inspired by iOS 26 present:normal / present:card modal.
 * Features:
 * - Frosted glass background
 * - Corner buttons: ✕ (close) top-left, ✓ (confirm) top-right
 * - Title centered in toolbar
 * - Desktop: centered Dialog
 * - Mobile: bottom Drawer (sheet)
 */

// ─── Context for corner actions ─────────────────────────────────────────────
interface ModalContextValue {
  onClose: () => void
  onConfirm?: () => void
  confirmDisabled?: boolean
  confirmLoading?: boolean
}

const ModalContext = React.createContext<ModalContextValue>({
  onClose: () => {},
})

// ─── Root ───────────────────────────────────────────────────────────────────
interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: () => void
  confirmDisabled?: boolean
  confirmLoading?: boolean
  children: React.ReactNode
}

function ResponsiveModal({
  open,
  onOpenChange,
  onConfirm,
  confirmDisabled,
  confirmLoading,
  children,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile()

  const ctx = React.useMemo<ModalContextValue>(
    () => ({
      onClose: () => onOpenChange(false),
      onConfirm,
      confirmDisabled,
      confirmLoading,
    }),
    [onOpenChange, onConfirm, confirmDisabled, confirmLoading],
  )

  if (isMobile) {
    return (
      <ModalContext.Provider value={ctx}>
        <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange}>
          {children}
        </DrawerPrimitive.Root>
      </ModalContext.Provider>
    )
  }

  return (
    <ModalContext.Provider value={ctx}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  )
}

// ─── Overlay ────────────────────────────────────────────────────────────────
function ModalOverlay({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/20 backdrop-blur-[6px] backdrop-saturate-[80%]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

// ─── Corner button (internal) ───────────────────────────────────────────────
function CornerButton({
  side,
  onClick,
  disabled,
  loading,
  children,
}: {
  side: 'left' | 'right'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center',
        'h-8 w-8 rounded-full',
        'bg-muted/60 dark:bg-muted/40',
        'backdrop-blur-sm',
        'border border-white/30 dark:border-white/10',
        'text-foreground/70 hover:text-foreground',
        'transition-all duration-150',
        'hover:bg-muted/80 hover:scale-105',
        'active:scale-95',
        'disabled:opacity-40 disabled:pointer-events-none',
        side === 'left' ? 'absolute left-4 top-4' : 'absolute right-4 top-4',
      )}
    >
      {children}
    </button>
  )
}

// ─── iOS 26 Toolbar (close · title · confirm) ──────────────────────────────
function ModalToolbar({
  title,
  description,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const { onClose, onConfirm, confirmDisabled, confirmLoading } =
    React.useContext(ModalContext)

  // Radix requires a Title for accessibility
  const AccessibleTitle = isMobile ? DrawerPrimitive.Title : DialogPrimitive.Title
  const AccessibleDescription = isMobile ? DrawerPrimitive.Description : DialogPrimitive.Description

  return (
    <div className="relative flex items-center justify-center min-h-[56px] px-14 pt-4 pb-2">
      {/* Close (X) — top-left */}
      <CornerButton side="left" onClick={onClose}>
        <X className="h-4 w-4" />
      </CornerButton>

      {/* Center title area */}
      <div className="text-center flex-1 min-w-0">
        {title && (
          <AccessibleTitle className="text-base font-semibold leading-tight truncate">
            {title}
          </AccessibleTitle>
        )}
        {description && (
          <AccessibleDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {description}
          </AccessibleDescription>
        )}
      </div>

      {/* Confirm (✓) — top-right */}
      {onConfirm && (
        <CornerButton
          side="right"
          onClick={onConfirm}
          disabled={confirmDisabled}
          loading={confirmLoading}
        >
          {confirmLoading ? (
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </CornerButton>
      )}
    </div>
  )
}

// ─── Content ────────────────────────────────────────────────────────────────
interface ResponsiveModalContentProps {
  className?: string
  children: React.ReactNode
}

function ResponsiveModalContent({ className, children }: ResponsiveModalContentProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/30 backdrop-blur-[6px] backdrop-saturate-[80%]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <DrawerPrimitive.Content
          className={cn(
            'bg-background/90 dark:bg-background/85',
            'backdrop-blur-[16px] backdrop-saturate-[180%]',
            'fixed inset-x-0 bottom-0 z-50',
            'mt-24 max-h-[85vh]',
            'rounded-t-[20px]',
            'border-t-[0.5px] border-white/60 dark:border-white/10',
            'shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.4)]',
            'flex flex-col',
            className,
          )}
        >
          {/* Drag handle */}
          <div className="mx-auto mt-3 h-1.5 w-[40px] shrink-0 rounded-full bg-muted/60" />
          {children}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    )
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50',
          'bg-black/20 backdrop-blur-[6px] backdrop-saturate-[80%]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          /* Liquid Glass dialog panel */
          'bg-background/90 dark:bg-background/85',
          'backdrop-blur-[8px] backdrop-saturate-[360%]',
          'border-[0.5px] border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60',
          'dark:border-t-white/12 dark:border-b-white/12 dark:border-r-white/10 dark:border-l-white/8',
          'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.2),0_0_10px_0_rgba(220,220,220,0.82)]',
          'dark:shadow-[inset_0_0_8px_0_rgba(40,40,40,0.3),0_0_10px_0_rgba(0,0,0,0.5)]',
          'rounded-[30px]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'fixed top-[50%] left-[50%] z-50',
          'w-full max-w-[calc(100%-2rem)] sm:max-w-lg',
          'translate-x-[-50%] translate-y-[-50%]',
          'duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'flex flex-col max-h-[80vh]',
          'transform-gpu backface-hidden',
          className,
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

// ─── Header (uses ModalToolbar for iOS 26 style) ────────────────────────────
function ResponsiveModalHeader({
  className,
  title,
  description,
  children,
}: {
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  // If title/description props provided, render iOS 26 toolbar style
  if (title || description) {
    return (
      <div className={className}>
        <ModalToolbar title={title} description={description} />
      </div>
    )
  }

  // Otherwise render children (for backward compat)
  return <div className={cn('px-4 pt-4 pb-2', className)}>{children}</div>
}

// ─── Body (scrollable area) ─────────────────────────────────────────────────
function ResponsiveModalBody({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-4 pb-4', className)}>
      {children}
    </div>
  )
}

// ─── Title (standalone, if needed outside Header) ───────────────────────────
function ResponsiveModalTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerPrimitive.Title className={cn('text-base font-semibold', className)}>
        {children}
      </DrawerPrimitive.Title>
    )
  }

  return (
    <DialogPrimitive.Title className={cn('text-base font-semibold', className)}>
      {children}
    </DialogPrimitive.Title>
  )
}

// ─── Description ────────────────────────────────────────────────────────────
function ResponsiveModalDescription({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerPrimitive.Description
        className={cn('text-muted-foreground text-sm', className)}
      >
        {children}
      </DrawerPrimitive.Description>
    )
  }

  return (
    <DialogPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
    >
      {children}
    </DialogPrimitive.Description>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function ResponsiveModalFooter({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 px-4 pb-4 pt-2 sm:flex-row sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  )
}

export {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ModalContext,
}
