"use client";
import SearchLoading from "./search-loading"
import SearchHighlight from "../common/search-highlight"
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface SearchResultsProps {
  results: { id: string; title: string; description?: string; link?: string }[]
  searchQuery: string
  isLoading?: boolean
  showLoading?: boolean
}

export default function SearchResults({ 
  results,
  isLoading = false,
  showLoading = true,
  searchQuery = "",
}: SearchResultsProps) {
  const router = useRouter();

  const handleResultClick = (result: { id: string; title: string; description?: string; link?: string }) => {
    // Navigate to the result link or to find-workers page with search query
    if (result.link) {
      router.push(result.link);
    } else {
      router.push(`/find-workers?search=${encodeURIComponent(result.title)}`);
    }
  };

  if (isLoading && showLoading) {
    return <SearchLoading />
  }

  return (
    <div className="search-results">
      {results.map((result) => (
        <div 
          key={result.id} 
          onClick={() => handleResultClick(result)}
          className="
            p-3 border-b last:border-b-0 
            hover:bg-gray-50 dark:hover:bg-gray-800 
            cursor-pointer 
            transition-colors duration-200
            rounded-md
            group
          "
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-[#15949C] transition-colors">
                <SearchHighlight text={result.title} highlight={searchQuery} />
              </h3>
              {result.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {result.description}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#15949C] transition-colors flex-shrink-0 mt-1" />
          </div>
        </div>
      ))}
    </div>
  )
}