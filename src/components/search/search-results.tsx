"use client";
import SearchLoading from "./search-loading"
import SearchHighlight from "../common/search-highlight"

interface SearchResultsProps {
  results: { id: string; title: string; description?: string }[]
  searchQuery: string
  isLoading?: boolean
  showLoading?: boolean
}



export default function SearchResults({ 
  results,
  isLoading = false,
  showLoading = true,
  searchQuery = "", // ✅ This line is what you asked about
}: SearchResultsProps) {



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