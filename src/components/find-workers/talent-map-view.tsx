"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, MessageSquare, Heart, Check, Maximize2, Minimize2, Filter, Users } from "lucide-react"
import { LocationData } from "@/types/location.types"
import { FreelancerDisplay } from "@/types/service.types"

interface TalentMapViewProps {
  services: FreelancerDisplay[]
  selectedFreelancers: string[]
  toggleFreelancerSelection: (id: string) => void
  openFreelancerDetail: (freelancer: FreelancerDisplay) => void
  isLoading?: boolean
}

export default function TalentMapView({
  services,
  selectedFreelancers,
  toggleFreelancerSelection,
  openFreelancerDetail,
  isLoading = false,
}: TalentMapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [clusteredView, setClusteredView] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))
  }

  // Function to generate coordinates based on location string
  const getLocationCoordinates = (location: string, index: number) => {
    // Common city coordinates for demo purposes
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'madrid': { lat: 40.4168, lng: -3.7038 },
      'toronto': { lat: 43.6532, lng: -79.3832 },
      'seoul': { lat: 37.5665, lng: 126.978 },
      'mumbai': { lat: 19.076, lng: 72.8777 },
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'sydney': { lat: -33.8688, lng: 151.2093 },
      'singapore': { lat: 1.3521, lng: 103.8198 },
      'dubai': { lat: 25.2048, lng: 55.2708 },
      'mexico city': { lat: 19.4326, lng: -99.1332 },
      'sao paulo': { lat: -23.5505, lng: -46.6333 },
      'lagos': { lat: 6.5244, lng: 3.3792 },
      'cairo': { lat: 30.0444, lng: 31.2357 },
      'jakarta': { lat: -6.2088, lng: 106.8456 },
      'manila': { lat: 14.5995, lng: 120.9842 },
      'bangkok': { lat: 13.7563, lng: 100.5018 }
    }

    // Try to find coordinates by city name
    const locationLower = location.toLowerCase()
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (locationLower.includes(city)) {
        // Add some random variation to avoid exact overlap
        const variation = 0.05 // ~5km variation
        return {
          lat: coords.lat + (Math.random() - 0.5) * variation,
          lng: coords.lng + (Math.random() - 0.5) * variation
        }
      }
    }

    // Fallback: generate coordinates based on index for unknown locations
    const baseLat = 40.7128 // NYC as base
    const baseLng = -74.0060
    const spread = 10 // degrees spread
    
    return {
      lat: baseLat + (Math.random() - 0.5) * spread,
      lng: baseLng + (Math.random() - 0.5) * spread
    }
  }

  // Convert coordinates to map position (simple projection)
  const coordinatesToMapPosition = (lat: number, lng: number, index: number) => {
    // Simple equirectangular projection for demo
    // In a real app, you'd use proper map projection
    const worldWidth = 360
    const worldHeight = 180
    
    // Normalize coordinates
    const x = ((lng + 180) / worldWidth) * 100
    const y = ((90 - lat) / worldHeight) * 100
    
    // Add some padding from edges
    const padding = 5
    const clampedX = Math.max(padding, Math.min(100 - padding, x))
    const clampedY = Math.max(padding, Math.min(100 - padding, y))
    
    return { x: `${clampedX}%`, y: `${clampedY}%` }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#DEEFE7] border-t-[#15949C] rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-[#002333] dark:text-white font-medium">Loading map...</p>
        </div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No freelancers found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
      </div>
    )
  }

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* Map Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-50 to-[#DEEFE7]/30 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#15949C] rounded-full"></div>
            <h3 className="text-lg font-semibold text-[#002333] dark:text-white">Map View</h3>
          </div>
          <Badge variant="secondary" className="bg-[#15949C]/10 text-[#15949C] border-[#15949C]/20">
            <Users className="w-3 h-3 mr-1" />
            {services.length} freelancers
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-200 dark:border-gray-600"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="border-gray-200 dark:border-gray-600"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4 mr-1" /> : <Maximize2 className="w-4 h-4 mr-1" />}
            {isFullScreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className={`relative rounded-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden ${
          isFullScreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'
        }`}
        style={{
          backgroundColor: '#e8f4f8',
          backgroundImage: `
            linear-gradient(180deg, #e8f4f8 0%, #d4e9f0 50%, #c1dfe8 100%)
          `
        }}
      >
        {/* Continents/Land masses simulation */}
        <div className="absolute inset-0">
          {/* North America */}
          <div className="absolute top-[20%] left-[15%] w-32 h-40 bg-[#c5e1a5]/40 rounded-[50%] blur-sm"></div>
          <div className="absolute top-[25%] left-[18%] w-28 h-35 bg-[#b8d99f]/30 rounded-[45%] blur-md"></div>
          
          {/* Europe */}
          <div className="absolute top-[15%] left-[48%] w-24 h-28 bg-[#c5e1a5]/40 rounded-[55%] blur-sm"></div>
          
          {/* Asia */}
          <div className="absolute top-[18%] left-[60%] w-40 h-44 bg-[#c5e1a5]/40 rounded-[50%] blur-sm"></div>
          <div className="absolute top-[20%] left-[65%] w-36 h-40 bg-[#b8d99f]/30 rounded-[48%] blur-md"></div>
          
          {/* South America */}
          <div className="absolute top-[55%] left-[25%] w-20 h-32 bg-[#c5e1a5]/40 rounded-[60%] blur-sm"></div>
          
          {/* Africa */}
          <div className="absolute top-[40%] left-[48%] w-24 h-36 bg-[#c5e1a5]/40 rounded-[50%] blur-sm"></div>
          
          {/* Australia */}
          <div className="absolute top-[60%] left-[75%] w-20 h-16 bg-[#c5e1a5]/40 rounded-[55%] blur-sm"></div>
        </div>

        {/* World Map Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#006d77" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Latitude lines */}
        <div className="absolute inset-0 opacity-[0.12]">
          <div className="absolute w-full h-[1px] bg-[#006d77] top-[25%]"></div>
          <div className="absolute w-full h-[1px] bg-[#006d77] top-[50%]"></div>
          <div className="absolute w-full h-[1px] bg-[#006d77] top-[75%]"></div>
        </div>

        {/* Longitude lines */}
        <div className="absolute inset-0 opacity-[0.12]">
          <div className="absolute h-full w-[1px] bg-[#006d77] left-[25%]"></div>
          <div className="absolute h-full w-[1px] bg-[#006d77] left-[50%]"></div>
          <div className="absolute h-full w-[1px] bg-[#006d77] left-[75%]"></div>
        </div>

        {/* Map Markers */}
        {services.map((service, index) => {
          // Get coordinates for the service
          const coords = service.coordinates || getLocationCoordinates(service.location, index)
          const position = coordinatesToMapPosition(coords.lat, coords.lng, index)
          const isSelected = selectedFreelancers.includes(service.id)
          const isActive = selectedMarker === service.id

          return (
            <motion.div
              key={service.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: position.x, top: position.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {/* Marker */}
              <div
                className={`relative cursor-pointer transition-all duration-200 ${
                  isActive ? 'z-20' : 'z-10'
                }`}
                onClick={() => setSelectedMarker(isActive ? null : service.id)}
              >
                {/* Marker Pin */}
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#15949C] border-white shadow-lg scale-110'
                      : isActive
                      ? 'bg-[#15949C] border-white shadow-lg scale-110'
                      : service.rating >= 4.5
                      ? 'bg-yellow-400 border-white shadow-md hover:scale-110'
                      : 'bg-white dark:bg-gray-700 border-[#15949C] hover:scale-110'
                  }`}
                >
                  <div className="flex items-center justify-center h-full">
                    <div className={`w-2 h-2 rounded-full ${
                      isSelected || isActive ? 'bg-white' : 
                      service.rating >= 4.5 ? 'bg-yellow-900' : 'bg-[#15949C]'
                    }`}></div>
                  </div>
                </div>

                {/* Pulse Animation */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-[#15949C] animate-ping opacity-20"></div>
                )}
              </div>

              {/* Info Card */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-10 left-1/2 transform -translate-x-1/2 z-30"
                  >
                    <Card className="w-80 bg-white dark:bg-gray-800 shadow-2xl border-2 border-gray-200 dark:border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#15949C]/10 text-[#15949C] font-semibold">
                              {service.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-[#002333] dark:text-white text-sm truncate">
                                {service.name}
                              </h4>
                              {service.rating >= 4.5 && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5">
                                  Top Rated
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 truncate">
                              {service.title}
                            </p>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {renderStars(service.rating)}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {service.rating} ({service.reviewCount})
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-[#15949C]">
                                ${service.hourlyRate}/hr
                              </span>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFreelancerSelection(service.id)
                                  }}
                                  className={`h-6 px-2 text-xs ${
                                    isSelected
                                      ? 'bg-[#15949C] text-white border-[#15949C]'
                                      : 'border-gray-200 dark:border-gray-600'
                                  }`}
                                >
                                  {isSelected ? <Check className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openFreelancerDetail(service)
                                  }}
                                  className="h-6 px-2 text-xs border-gray-200 dark:border-gray-600"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3">
          <div className="text-xs font-semibold text-[#002333] dark:text-white mb-2">Legend</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-[#15949C] rounded-full shadow-sm"></div>
            <span className="text-xs text-[#002333] dark:text-white">Selected</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-white dark:bg-gray-700 border-2 border-[#15949C] rounded-full shadow-sm"></div>
            <span className="text-xs text-[#002333] dark:text-white">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
            <span className="text-xs text-[#002333] dark:text-white">Top Rated</span>
          </div>
        </div>

        {/* Map Stats */}
        <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3">
          <div className="text-xs font-semibold text-[#002333] dark:text-white mb-2">Stats</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            <div>{services.length} freelancers</div>
            <div>{selectedFreelancers.length} selected</div>
            <div>Click markers for details</div>
          </div>
        </div>

        {/* Top Countries/Cities Indicator */}
        <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3 max-w-xs">
          <div className="text-xs font-semibold text-[#002333] dark:text-white mb-2">Top Locations</div>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            {(() => {
              // Count freelancers by location
              const locationCounts = services.reduce((acc, service) => {
                const city = service.location.split(',')[0].trim()
                acc[city] = (acc[city] || 0) + 1
                return acc
              }, {} as Record<string, number>)
              
              // Get top 3 locations
              const topLocations = Object.entries(locationCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
              
              return topLocations.map(([location, count]) => (
                <div key={location} className="flex justify-between">
                  <span>{location}</span>
                  <span className="font-medium text-[#15949C]">{count}</span>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      {/* Selected Freelancers Summary */}
      {selectedFreelancers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-[#15949C]/10 to-[#DEEFE7]/30 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-[#15949C]/20 dark:border-gray-600"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#15949C] rounded-full"></div>
              <span className="font-medium text-[#002333] dark:text-white">
                {selectedFreelancers.length} freelancer{selectedFreelancers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex -space-x-2">
                {selectedFreelancers.slice(0, 3).map((id) => {
                  const service = services.find(s => s.id === id)
                  return (
                    <div
                      key={id}
                      className="h-8 w-8 rounded-full bg-[#15949C] border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-medium">
                        {service?.name.charAt(0) || '?'}
                      </span>
                    </div>
                  )
                })}
                {selectedFreelancers.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      +{selectedFreelancers.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={() => {
                // Clear all selections
                selectedFreelancers.forEach(id => toggleFreelancerSelection(id))
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              variant="outline"
            >
              Clear All
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}