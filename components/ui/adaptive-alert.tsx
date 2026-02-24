"use client"

import { useSweetAlert } from "./sweet-alert"
import { useMobileAlert } from "./mobile-alert"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * Hook gabungan yang otomatis menggunakan MobileAlert untuk mobile 
 * dan SweetAlert untuk desktop
 */
export function useAdaptiveAlert() {
  const isMobile = useIsMobile()
  const sweetAlert = useSweetAlert()
  const mobileAlert = useMobileAlert()

  // Gunakan mobile alert jika di mobile, sweet alert jika desktop
  const activeAlert = isMobile ? mobileAlert : sweetAlert

  return {
    ...activeAlert,
    isMobile,
    // Komponen yang hanya render alert yang sesuai
    AlertComponent: () => {
      if (isMobile) {
        return mobileAlert.AlertComponent()
      } else {
        return sweetAlert.AlertComponent()
      }
    },
  }
}
