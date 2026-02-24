"use client"

import * as React from "react"
import { LoadingOverlay } from "@/components/ui/progress"
import { SweetAlert } from "@/components/ui/sweet-alert"

/**
 * useAsyncAction — iOS 26 Liquid Glass async action hook
 *
 * Wraps any async operation (edit, create, delete, login, upload, etc.)
 * with:
 * 1. A LoadingOverlay (glass progress indicator from ion-loading.scss)
 * 2. A success dialog (glass alert from ion-alert.scss)
 * 3. An error dialog on failure
 *
 * Usage:
 *   const { execute, ActionFeedback } = useAsyncAction()
 *
 *   const handleSubmit = () => execute(
 *     async () => { await fetch(...) },
 *     { loadingMessage: "Menyimpan...", successTitle: "Berhasil!", successDescription: "Data tersimpan." }
 *   )
 *
 *   return <><ActionFeedback />...</>
 */

interface AsyncActionOptions {
  /** Message shown during loading overlay */
  loadingMessage?: string
  /** Title for success dialog */
  successTitle?: string
  /** Description for success dialog */
  successDescription?: string
  /** Title for error dialog */
  errorTitle?: string
  /** Auto-close success dialog after ms (0 = manual close) */
  autoCloseMs?: number
  /** Callback after success dialog closes */
  onSuccess?: () => void
  /** Callback after error dialog closes */
  onError?: (error: Error) => void
  /** Skip success dialog */
  skipSuccessDialog?: boolean
}

interface ActionState {
  isLoading: boolean
  loadingMessage: string
  showSuccess: boolean
  showError: boolean
  successTitle: string
  successDescription: string
  errorTitle: string
  errorDescription: string
}

const initialState: ActionState = {
  isLoading: false,
  loadingMessage: "",
  showSuccess: false,
  showError: false,
  successTitle: "",
  successDescription: "",
  errorTitle: "",
  errorDescription: "",
}

export function useAsyncAction() {
  const [state, setState] = React.useState<ActionState>(initialState)
  const onSuccessRef = React.useRef<(() => void) | undefined>(undefined)
  const onErrorRef = React.useRef<((error: Error) => void) | undefined>(undefined)
  const autoCloseTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
    }
  }, [])

  const execute = React.useCallback(
    async <T,>(
      action: () => Promise<T>,
      options: AsyncActionOptions = {}
    ): Promise<T | undefined> => {
      const {
        loadingMessage = "Memproses...",
        successTitle = "Berhasil!",
        successDescription = "",
        errorTitle = "Gagal",
        autoCloseMs = 2000,
        onSuccess,
        onError,
        skipSuccessDialog = false,
      } = options

      onSuccessRef.current = onSuccess
      onErrorRef.current = onError

      // Show loading overlay
      setState({
        ...initialState,
        isLoading: true,
        loadingMessage,
      })

      try {
        const result = await action()

        // Hide loading, show success
        if (skipSuccessDialog) {
          setState(initialState)
          onSuccess?.()
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            showSuccess: true,
            successTitle,
            successDescription,
          }))

          // Auto-close success dialog
          if (autoCloseMs > 0) {
            autoCloseTimerRef.current = setTimeout(() => {
              setState(initialState)
              onSuccess?.()
            }, autoCloseMs)
          }
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setState((prev) => ({
          ...prev,
          isLoading: false,
          showError: true,
          errorTitle,
          errorDescription: error.message || "Terjadi kesalahan",
        }))
        onError?.(error)
        return undefined
      }
    },
    []
  )

  const closeSuccess = React.useCallback(() => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
    setState(initialState)
    onSuccessRef.current?.()
  }, [])

  const closeError = React.useCallback(() => {
    setState(initialState)
  }, [])

  /**
   * ActionFeedback — renders the LoadingOverlay + success/error dialogs.
   * Must be placed in the component tree.
   */
  const ActionFeedback = React.useCallback(() => {
    return (
      <>
        {/* Glass Loading Overlay from ion-loading.scss */}
        {state.isLoading && (
          <LoadingOverlay message={state.loadingMessage} />
        )}

        {/* Glass Success Dialog from ion-alert.scss */}
        <SweetAlert
          open={state.showSuccess}
          onOpenChange={(open) => { if (!open) closeSuccess() }}
          type="success"
          title={state.successTitle}
          description={state.successDescription}
          confirmText="OK"
        />

        {/* Glass Error Dialog */}
        <SweetAlert
          open={state.showError}
          onOpenChange={(open) => { if (!open) closeError() }}
          type="error"
          title={state.errorTitle}
          description={state.errorDescription}
          confirmText="OK"
        />
      </>
    )
  }, [state, closeSuccess, closeError])

  return {
    execute,
    isLoading: state.isLoading,
    ActionFeedback,
  }
}
