"use client"

import { useState, useCallback } from "react"

interface UseSearchOptions {
  debounceMs?: number
}

interface UseSearchReturn {
  searchQuery: string
  isLoading: boolean
  setSearchQuery: (query: string) => void
  clearSearch: () => void
}

export function useSearch({ 
  debounceMs = 300 
}: UseSearchOptions = {}): UseSearchReturn {
  const [searchQuery, setSearchQueryState] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query)
    
    if (query.trim()) {
      setIsLoading(true)
      // Simulate search delay
      setTimeout(() => {
        setIsLoading(false)
      }, debounceMs)
    } else {
      setIsLoading(false)
    }
  }, [debounceMs])

  const clearSearch = useCallback(() => {
    setSearchQueryState("")
    setIsLoading(false)
  }, [])

  return {
    searchQuery,
    isLoading,
    setSearchQuery,
    clearSearch
  }
}
