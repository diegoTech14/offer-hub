"use client"

import { Loader2 } from "lucide-react"

interface SearchLoadingProps {
  message?: string
}

export default function SearchLoading({ 
  message = "Searching..." 
}: SearchLoadingProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}
