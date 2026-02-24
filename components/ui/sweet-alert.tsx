"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, Info, HelpCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertType = "success" | "error" | "warning" | "info" | "question"

interface SweetAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type?: AlertType
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  showCancelButton?: boolean
  isLoading?: boolean
}

/**
 * iOS 26 Liquid Glass Alert Config
 * From tema/src/styles/components/ion-alert.scss:
 * - glass-background-overlay on .alert-wrapper
 * - border-radius: 32px
 * - scale(1.016) on :has(.ion-activated)
 * - buttons: glass-background-overlay-button, border-radius: 32px, height: 48px
 */
const alertConfig: Record<AlertType, { icon: React.ElementType; color: string; bgColor: string }> = {
  success: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100/80 dark:bg-green-900/30 backdrop-blur-[2px]",
  },
  error: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100/80 dark:bg-red-900/30 backdrop-blur-[2px]",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100/80 dark:bg-yellow-900/30 backdrop-blur-[2px]",
  },
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-[2px]",
  },
  question: {
    icon: HelpCircle,
    color: "text-primary",
    bgColor: "bg-primary/10 backdrop-blur-[2px]",
  },
}

export function SweetAlert({
  open,
  onOpenChange,
  type = "info",
  title,
  description,
  confirmText = "OK",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  showCancelButton = false,
  isLoading = false,
}: SweetAlertProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(
        /* From ion-alert.scss: --max-width: 322px, border-radius: 32px */
        "max-w-[90vw] sm:max-w-[322px] rounded-[32px]",
        /* Glass-background-overlay from api.scss */
        "bg-background/67 dark:bg-background/67",
        "backdrop-blur-[8px] backdrop-saturate-[360%]",
        /* Asymmetric glass borders */
        "border-[0.5px] border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60",
        "dark:border-t-white/12 dark:border-b-white/12 dark:border-r-white/10 dark:border-l-white/8",
        /* Glass shadow from api.scss */
        "shadow-[inset_0_0_8px_0_rgba(220,220,220,0.2),0_0_10px_0_rgba(220,220,220,0.82)]",
        "dark:shadow-[inset_0_0_8px_0_rgba(40,40,40,0.3),0_0_10px_0_rgba(0,0,0,0.5)]",
        /* Scale(1.016) on activated from ion-alert.scss */
        "transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "active:scale-[1.016]",
      )}>
        <AlertDialogHeader className="flex flex-col items-center text-center">
          {/* Icon with glass background circle */}
          <div className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            "transition-transform duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
            config.bgColor,
          )}>
            <Icon className={cn("h-8 w-8", config.color)} />
          </div>
          <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className={cn(
              /* From ion-alert.scss: text-align left, margin 14px, font-size 0.98rem */
              "text-center text-[0.98rem] leading-[1.2rem]",
            )}>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {/* Button group from ion-alert.scss: padding 0 8px 12px, gap 8px */}
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center px-2 pb-3">
          {showCancelButton && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className={cn(
                "w-full sm:w-auto",
                /* From ion-alert.scss: glass-background-overlay-button, border-radius: 32px, height: 48px */
                "rounded-[32px] h-12 font-semibold bg-transparent",
                "border-none",
              )}
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant={type === "error" ? "destructive" : "default"}
            className={cn(
              "w-full sm:w-auto",
              /* From ion-alert.scss: button height 48px, rounded 32px, font-weight 550 */
              "rounded-[32px] h-12 font-semibold",
            )}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook untuk menggunakan SweetAlert secara programatik
interface AlertState {
  open: boolean
  type: AlertType
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  showCancelButton?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

const initialState: AlertState = {
  open: false,
  type: "info",
  title: "",
  description: undefined,
  confirmText: "OK",
  cancelText: "Batal",
  showCancelButton: false,
  onConfirm: undefined,
  onCancel: undefined,
}

export function useSweetAlert() {
  const [state, setState] = React.useState<AlertState>(initialState)
  const [isLoading, setIsLoading] = React.useState(false)

  const showAlert = React.useCallback((options: Omit<AlertState, "open">) => {
    setState({ ...options, open: true })
  }, [])

  const hideAlert = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
    setIsLoading(false)
  }, [])

  const success = React.useCallback(
    (title: string, description?: string) => {
      showAlert({ type: "success", title, description })
    },
    [showAlert],
  )

  const error = React.useCallback(
    (title: string, description?: string) => {
      showAlert({ type: "error", title, description })
    },
    [showAlert],
  )

  const warning = React.useCallback(
    (title: string, description?: string) => {
      showAlert({ type: "warning", title, description })
    },
    [showAlert],
  )

  const info = React.useCallback(
    (title: string, description?: string) => {
      showAlert({ type: "info", title, description })
    },
    [showAlert],
  )

  const confirm = React.useCallback(
    (
      title: string,
      options?: {
        description?: string
        confirmText?: string
        cancelText?: string
        onConfirm?: () => void | Promise<void>
        onCancel?: () => void
        type?: AlertType
      },
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        showAlert({
          type: options?.type || "question",
          title,
          description: options?.description,
          confirmText: options?.confirmText || "Ya",
          cancelText: options?.cancelText || "Batal",
          showCancelButton: true,
          onConfirm: async () => {
            if (options?.onConfirm) {
              setIsLoading(true)
              await options.onConfirm()
              setIsLoading(false)
            }
            resolve(true)
          },
          onCancel: () => {
            if (options?.onCancel) {
              options.onCancel()
            }
            resolve(false)
          },
        })
      })
    },
    [showAlert],
  )

  const AlertComponent = React.useCallback(
    () => (
      <SweetAlert
        open={state.open}
        onOpenChange={(open) => {
          if (!open) hideAlert()
        }}
        type={state.type}
        title={state.title}
        description={state.description}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        showCancelButton={state.showCancelButton}
        onConfirm={state.onConfirm}
        onCancel={state.onCancel}
        isLoading={isLoading}
      />
    ),
    [state, hideAlert, isLoading],
  )

  return {
    showAlert,
    hideAlert,
    success,
    error,
    warning,
    info,
    confirm,
    AlertComponent,
    isOpen: state.open,
  }
}
