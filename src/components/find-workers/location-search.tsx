"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Search, X, Globe, Clock, Target } from "lucide-react"
import { useLocationSearch } from "@/hooks/use-location-search"
import { LocationData } from "@/types/location.types"

interface LocationSearchProps {
  onLocationSelect?: (location: LocationData | undefined) => void
  onRadiusChange?: (radius: number) => void
  currentLocation?: LocationData | null
  currentRadius?: number
}

export default function LocationSearch({
  onLocationSelect,
  onRadiusChange,
  currentLocation,
  currentRadius = 50
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedRadius, setSelectedRadius] = useState(currentRadius)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const {
    suggestions,
    isLoading,
    searchLocations,
    clearSearch,
    recentLocations,
    popularLocations
  } = useLocationSearch()

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchLocations(searchQuery)
        setShowSuggestions(true)
      }, 300)

      return () => clearTimeout(debounceTimer)
    } else {
      setShowSuggestions(false)
    }
  }, [searchQuery, searchLocations])

  const handleLocationSelect = (location: LocationData) => {
    setSearchQuery(location.displayName)
    setShowSuggestions(false)
    onLocationSelect?.(location)
  }

  const handleClearLocation = () => {
    setSearchQuery("")
    clearSearch()
    onLocationSelect?.(undefined)
  }

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius)
    onRadiusChange?.(radius)
  }

  const radiusOptions = [10, 25, 50, 100, 250, 500]

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-2 space-y-1">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-[#002333] dark:text-white flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-[#15949C]" />
            Location
          </Label>
          
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="City, state, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length >= 2 || recentLocations.length > 0)}
                className="pl-10 pr-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#15949C] focus:ring-2 focus:ring-[#15949C]/20"
              />
              {searchQuery && (
                <button
                  onClick={handleClearLocation}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60">
                <ScrollArea className="max-h-60">
                  {isLoading ? (
                    <div className="p-3 text-center">
                      <div className="animate-spin h-4 w-4 border-2 border-[#15949C] border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-xs text-[#002333] dark:text-gray-300 mt-2">Searching...</p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {/* Current search results */}
                      {suggestions.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-medium text-[#002333]/70 dark:text-gray-400 uppercase tracking-wide">
                            Results
                          </div>
                          {suggestions.slice(0, 5).map((location) => (
                            <button
                              key={location.id}
                              onClick={() => handleLocationSelect(location)}
                              className="w-full px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center group transition-colors"
                            >
                              <MapPin className="h-3 w-3 mr-2 text-[#15949C] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#002333] dark:text-white truncate">{location.name}</p>
                                <p className="text-xs text-[#002333]/60 dark:text-gray-400 truncate">{location.displayName}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Recent locations */}
                      {recentLocations.length > 0 && searchQuery.length < 2 && (
                        <>
                          <Separator className="my-1" />
                          <div className="px-2 py-1 text-xs font-medium text-[#002333]/70 dark:text-gray-400 uppercase tracking-wide">
                            Recent
                          </div>
                          {recentLocations.slice(0, 3).map((location) => (
                            <button
                              key={`recent-${location.id}`}
                              onClick={() => handleLocationSelect(location)}
                              className="w-full px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center transition-colors"
                            >
                              <Clock className="h-3 w-3 mr-2 text-[#002333]/50 dark:text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#002333] dark:text-white truncate">{location.name}</p>
                                <p className="text-xs text-[#002333]/60 dark:text-gray-400 truncate">{location.displayName}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Popular locations */}
                      {popularLocations.length > 0 && searchQuery.length < 2 && (
                        <>
                          <Separator className="my-2" />
                          <div className="px-3 py-2 text-xs font-medium text-[#002333]/70 uppercase tracking-wide">
                            Popular Locations
                          </div>
                          {popularLocations.map((location) => (
                            <button
                              key={`popular-${location.id}`}
                              onClick={() => handleLocationSelect(location)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center"
                            >
                              <Globe className="h-4 w-4 mr-3 text-[#15949C] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#002333] truncate">{location.name}</p>
                                <p className="text-xs text-[#002333]/70 truncate">{location.fullName}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* No results */}
                      {suggestions.length === 0 && searchQuery.length >= 2 && !isLoading && (
                        <div className="p-4 text-center">
                          <MapPin className="h-8 w-8 text-[#002333]/30 mx-auto mb-2" />
                          <p className="text-sm text-[#002333]/70">No locations found</p>
                          <p className="text-xs text-[#002333]/50">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Current Location Display */}
        {currentLocation && (
          <div className="p-3 bg-[#DEEFE7]/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-[#15949C]" />
                <div>
                  <p className="text-sm font-medium text-[#002333]">{currentLocation.name}</p>
                  <p className="text-xs text-[#002333]/70">{currentLocation.fullName}</p>
                </div>
              </div>
              {currentLocation.timezone && (
                <Badge className="bg-[#15949C]/10 text-[#15949C] border-[#15949C]/20">
                  {currentLocation.timezone}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Distance Radius */}
        {currentLocation && (
          <div className="space-y-4">
            <Separator />
            <div>
              <Label className="text-sm font-medium text-[#002333] mb-2 block">
                Search Radius
              </Label>
              <div className="flex flex-wrap gap-2">
                {radiusOptions.map((radius) => (
                  <Button
                    key={radius}
                    variant={selectedRadius === radius ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRadiusChange(radius)}
                    className={selectedRadius === radius ? "bg-[#15949C] hover:bg-[#15949C]/90" : ""}
                  >
                    {radius} km
                  </Button>
                ))}
              </div>
              <p className="text-xs text-[#002333]/70 mt-2">
                Find freelancers within {selectedRadius} km of {currentLocation.name}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}