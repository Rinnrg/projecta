'use client'

import * as React from 'react'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent/50 focus:text-accent-foreground data-[state=open]:bg-accent/40 data-[state=open]:text-accent-foreground",
        "[&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-xl px-2.5 py-2 text-sm outline-hidden select-none",
        "transition-[background,color,transform,box-shadow,filter] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        "active:scale-[1.03] active:brightness-[1.03] transform-gpu backface-hidden",
        "data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        /* Liquid Glass sub-panel */
        'bg-popover/80 dark:bg-popover/75 text-popover-foreground',
        'backdrop-blur-[24px] backdrop-saturate-[280%]',
        'border-[0.5px] border-white/70 dark:border-white/12',
        'shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.4),inset_0_0_6px_0_rgba(255,255,255,0.06),0_4px_24px_-4px_rgba(0,0,0,0.14),0_1px_4px_0_rgba(0,0,0,0.06)]',
        'dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05),inset_0_0_6px_0_rgba(255,255,255,0.02),0_4px_24px_-4px_rgba(0,0,0,0.5),0_1px_4px_0_rgba(0,0,0,0.2)]',
        /* Liquid blob entrance */
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-[0.92] data-[state=open]:zoom-in-[0.92]',
        'data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3',
        'data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3',
        'duration-[380ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
        'data-[state=closed]:duration-[250ms] data-[state=closed]:ease-[cubic-bezier(0.32,0.72,0,1)]',
        'z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-2xl p-1.5',
        'transform-gpu backface-hidden',
        className,
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          /* Liquid Glass context menu */
          'bg-popover/80 dark:bg-popover/75 text-popover-foreground',
          'backdrop-blur-[24px] backdrop-saturate-[280%]',
          'border-[0.5px] border-white/70 dark:border-white/12',
          'shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.4),inset_0_0_6px_0_rgba(255,255,255,0.06),0_4px_24px_-4px_rgba(0,0,0,0.14),0_1px_4px_0_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.03)]',
          'dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05),inset_0_0_6px_0_rgba(255,255,255,0.02),0_4px_24px_-4px_rgba(0,0,0,0.5),0_1px_4px_0_rgba(0,0,0,0.2),0_0_0_0.5px_rgba(255,255,255,0.04)]',
          'rounded-2xl p-1.5',
          /* Liquid blob entrance */
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-[0.92] data-[state=open]:zoom-in-[0.92]',
          'data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3',
          'data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3',
          'duration-[380ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
          'data-[state=closed]:duration-[250ms] data-[state=closed]:ease-[cubic-bezier(0.32,0.72,0,1)]',
          'z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem]',
          'origin-(--radix-context-menu-content-transform-origin)',
          'overflow-x-hidden overflow-y-auto',
          'transform-gpu backface-hidden',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        /* Liquid Glass menu item */
        "focus:bg-accent/50 focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10",
        "dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive",
        "data-[variant=destructive]:*:[svg]:!text-destructive",
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "relative flex cursor-default items-center gap-2 rounded-xl px-2.5 py-2 text-sm outline-hidden select-none",
        "transition-[background,color,transform,box-shadow,filter] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        "hover:shadow-[inset_0_0_10px_0_rgba(0,0,0,0.03)]",
        "dark:hover:shadow-[inset_0_0_10px_0_rgba(255,255,255,0.04)]",
        "active:scale-[1.03] active:brightness-[1.03]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "transform-gpu backface-hidden",
        className,
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent/50 focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xl py-2 pr-2.5 pl-8 text-sm outline-hidden select-none",
        "transition-[background,color,transform,box-shadow,filter] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        "active:scale-[1.03] active:brightness-[1.03] transform-gpu backface-hidden",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent/50 focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xl py-2 pr-2.5 pl-8 text-sm outline-hidden select-none",
        "transition-[background,color,transform,box-shadow,filter] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        "active:scale-[1.03] active:brightness-[1.03] transform-gpu backface-hidden",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        'text-foreground px-2.5 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('bg-border/50 -mx-1.5 my-1 h-px', className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
