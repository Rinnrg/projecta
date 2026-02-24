'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        /**
         * Enhanced Liquid Glass overlay with full coverage blur using utility class
         * From tema/src/styles/components/ion-modal.scss: --backdrop-opacity: 0.2
         */
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'fixed inset-0 z-50',
        'bg-black/30 backdrop-modal',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          /**
           * Liquid Glass dialog panel
           * From tema/src/styles/components/ion-modal.scss:
           * - modal-sheet: --border-radius: 30px
           * - glass-background(1) on ::part(content)
           * From tema/src/styles/utils/api.scss: full glass mixin
           */
          'bg-background/90 dark:bg-background/85',
          'backdrop-blur-[8px] backdrop-saturate-[360%]',
          /* Asymmetric borders from api.scss */
          'border-[0.5px] border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60',
          'dark:border-t-white/12 dark:border-b-white/12 dark:border-r-white/10 dark:border-l-white/8',
          /* Glass shadow from api.scss */
          'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.2),0_0_10px_0_rgba(220,220,220,0.82)]',
          'dark:shadow-[inset_0_0_8px_0_rgba(40,40,40,0.3),0_0_10px_0_rgba(0,0,0,0.5)]',
          /* border-radius: 30px from ion-modal.scss modal-sheet */
          'rounded-[30px] p-6 gap-4',
          /* Animations — easing from ios.transition.ts */
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)]',
          'translate-x-[-50%] translate-y-[-50%]',
          'duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'sm:max-w-lg',
          'transform-gpu backface-hidden',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "ring-offset-background focus:ring-ring",
              "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
              "absolute top-4 right-4 rounded-full opacity-70",
              /* Transition: 140ms from default-variables.scss */
              "transition-[opacity,transform] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
              "hover:opacity-100 hover:scale-[1.1]",
              "focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
              "disabled:pointer-events-none",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
