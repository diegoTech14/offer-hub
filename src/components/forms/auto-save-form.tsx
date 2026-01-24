"use client"

import { ReactNode, useCallback } from "react"
import { useAutoSave } from "@/hooks/use-auto-save"

interface AutoSaveFormProps {
  children: ReactNode
  onAutoSave?: (data: any) => void | Promise<void>
  delay?: number
  className?: string
}

export function AutoSaveForm({
  children,
  onAutoSave,
  delay = 2000,
  className = ""
}: AutoSaveFormProps) {
  const { saveData, isSaving, lastSaved } = useAutoSave({
    delay,
    onSave: onAutoSave
  })

  const handleFormChange = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    saveData(data)
  }, [saveData])

  return (
    <form onChange={handleFormChange} className={className}>
      {children}
      {/* Auto-save indicator */}
      {isSaving && (
        <div className="text-xs text-gray-500 mt-2">
          Guardando...
        </div>
      )}
      {lastSaved && !isSaving && (
        <div className="text-xs text-green-600 mt-2">
          Guardado automáticamente {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </form>
  )
}
