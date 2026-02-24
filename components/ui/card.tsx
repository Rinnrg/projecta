import type * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        /**
         * Liquid Glass Card — from tema/src/styles/components/ion-card.scss
         * border-radius: 24px + tema/src/styles/utils/api.scss glass-background
         */
        "bg-card/90 dark:bg-card/80 text-card-foreground flex flex-col gap-6 rounded-3xl py-6",
        "backdrop-blur-[2px] backdrop-saturate-[360%]",
        /* Glass border from api.scss: asymmetric 0.5px borders */
        "border-[0.5px] border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60",
        "dark:border-t-white/12 dark:border-b-white/12 dark:border-r-white/10 dark:border-l-white/8",
        /* Shadow from api.scss glass-background mixin */
        "shadow-[inset_0_0_8px_0_rgba(220,220,220,0.2),0_0_10px_0_rgba(220,220,220,0.82)]",
        "dark:shadow-[inset_0_0_8px_0_rgba(40,40,40,0.3),0_0_10px_0_rgba(0,0,0,0.5)]",
        /* Transition: 140ms from default-variables.scss --ios26-activated-transition-duration */
        "transition-[box-shadow,transform,border-color] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:shadow-[inset_0_0_8px_0_rgba(220,220,220,0.25),0_2px_16px_0_rgba(220,220,220,0.9)]",
        "hover:border-white/90 dark:hover:border-white/16",
        /* GPU compositing from api.scss */
        "transform-gpu backface-hidden",
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
