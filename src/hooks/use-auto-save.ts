"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseAutoSaveOptions {
  delay?: number
  onSave?: (data: any) => void | Promise<void>
}

interface UseAutoSaveReturn {
  saveData: (data: any) => void
  isSaving: boolean
  lastSaved: Date | null
}

export function useAutoSave({
  delay = 2000,
  onSave
}: UseAutoSaveOptions = {}): UseAutoSaveReturn {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const saveData = useCallback((data: any) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (onSave && !isSaving) {
        setIsSaving(true)
        try {
          await onSave(data)
          setLastSaved(new Date())
        } catch (error) {
          console.error("Auto-save failed:", error)
        } finally {
          setIsSaving(false)
        }
      }
    }, delay)
  }, [delay, onSave, isSaving])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    saveData,
    isSaving,
    lastSaved
  }
}
