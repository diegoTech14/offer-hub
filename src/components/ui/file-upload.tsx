"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileUp } from "lucide-react"

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export function FileUpload({
  onFilesSelected,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  multiple = true,
  disabled = false,
  className = ""
}: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return

    setIsLoading(true)
    
    // Simulate upload progress
    setTimeout(() => {
      onFilesSelected?.(files)
      setIsLoading(false)
      if (inputRef.current) inputRef.current.value = ""
    }, 1000)
  }

  return (
    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${className}`}>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isLoading}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Uploading files...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-gray-600">Drag files here or</p>
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  )
}
