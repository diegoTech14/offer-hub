"use client"

import { Progress } from "@/components/ui/progress"

interface UploadProgressProps {
  progress: number
  fileName?: string
  className?: string
}

export function UploadProgress({ 
  progress, 
  fileName = "Uploading...", 
  className = "" 
}: UploadProgressProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{fileName}</span>
        <span className="text-gray-500">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
