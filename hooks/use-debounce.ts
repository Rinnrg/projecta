import { useEffect, useState } from 'react'

/**
 * Custom hook untuk debouncing values
 * Berguna untuk search input agar tidak terlalu sering fetching data
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timeout untuk update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup timeout jika value berubah sebelum delay selesai
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
