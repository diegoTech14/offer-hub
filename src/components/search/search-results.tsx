"use client"

import { useSearch } from "@/hooks/use-search"
import SearchLoading from "./search-loading"
import SearchHighlight from "../common/search-highlight"

interface SearchResultsProps {
  results: { id: string; title: string; description?: string }[]
  searchQuery: string
  showLoading?: boolean
}



export default function SearchResults({ 
  results,
  showLoading = true,
  searchQuery = "", // ✅ This line is what you asked about
}: SearchResultsProps) {
  const { isLoading } = useSearch() // ✅ Don't extract searchQuery from the hook anymore



  if (isLoading && showLoading) {
    return <SearchLoading />
  }

  return (
    <div className="search-results text-black dark:bg-gray-700 dark:text-white">
      {results.map((result) => (
        <div key={result.id} className="p-2 border-b">
          <h3>
            <SearchHighlight text={result.title} highlight={searchQuery} />
          </h3>
          {result.description && <p>{result.description}</p>}
        </div>
      ))}
    </div>
  )
}