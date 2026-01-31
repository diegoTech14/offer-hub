"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, Menu, User, Filter, Grid, List, Map, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import TalentFilters from "@/components/find-workers/talent-filters"
import TalentGridView from "@/components/find-workers/talent-grid-view"
import TalentListView from "@/components/find-workers/talent-list-view"
import TalentMapView from "@/components/find-workers/talent-map-view"
import TalentCompare from "@/components/find-workers/talent-compare"
import TalentMarketInsights from "@/components/find-workers/talent-market-insights"
import TalentCategories from "@/components/find-workers/talent-categories"
import TalentDetailDialog from "@/components/find-workers/talent-detail-dialog"
import Pagination from "@/components/find-workers/pagination"
import Link from "next/link"
import { useServicesApi } from "@/hooks/api-connections/use-services-api"
import { ServiceFilters, FreelancerDisplay } from "@/types/service.types"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"

export default function FindWorkersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerDisplay | null>(null)
  
  // Get URL parameters for initial state
  const searchParams = useSearchParams()
  const initialSearchQuery = searchParams.get('q') || ""
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  
  const [currentFilters, setCurrentFilters] = useState<ServiceFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 10,
    keyword: initialSearchQuery || undefined,
    category: searchParams.get('category') || undefined,
    min_price: searchParams.get('min') ? parseFloat(searchParams.get('min')!) : undefined,
    max_price: searchParams.get('max') ? parseFloat(searchParams.get('max')!) : undefined,
  })

  // Use the services API hook
  const { services, isLoading, error, pagination, searchServices, clearError } = useServicesApi()

  // Handle search query changes with debouncing
  useEffect(() => {
    const filters = { ...currentFilters }
    if (searchQuery.trim()) {
      filters.keyword = searchQuery.trim()
    } else {
      delete filters.keyword
    }
    setCurrentFilters(filters)
    searchServices(filters)
  }, [searchQuery])

  // Handle filter changes
  const handleFiltersChange = (filters: ServiceFilters) => {
    setCurrentFilters(filters)
    searchServices(filters)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...currentFilters, page }
    setCurrentFilters(newFilters)
    searchServices(newFilters)
  }

  const toggleFreelancerSelection = (id: string) => {
    if (selectedFreelancers.includes(id)) {
      setSelectedFreelancers(selectedFreelancers.filter((freelancerId) => freelancerId !== id))
    } else {
      if (selectedFreelancers.length < 3) {
        setSelectedFreelancers([...selectedFreelancers, id])
      }
    }
  }

  const clearSelectedFreelancers = () => {
    setSelectedFreelancers([])
    setShowCompare(false)
  }

  const toggleCompare = () => {
    if (selectedFreelancers.length > 1) {
      setShowCompare(!showCompare)
    }
  }

  const openFreelancerDetail = (freelancer: FreelancerDisplay) => {
    setSelectedFreelancer(freelancer)
  }

  const closeFreelancerDetail = () => {
    setSelectedFreelancer(null)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#002333] via-[#003d4d] to-[#15949C] dark:from-gray-900 dark:to-gray-800 text-white py-16 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-48 -translate-x-48"></div>
          </div>
          
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Find the perfect talent for your project</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Find Expert
                <span className="block bg-gradient-to-r from-white to-[#DEEFE7] bg-clip-text text-transparent">
                  Freelancers
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Connect with skilled professionals ready to bring your ideas to life
              </p>
              
              <div className="relative max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for skills, expertise, or job titles..."
                    className="pl-12 pr-32 py-6 rounded-2xl text-gray-900 dark:text-white text-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-white/20 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 shadow-2xl focus:shadow-3xl transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
                  <Button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-gradient-to-r from-[#15949C] to-[#117a81] hover:from-[#117a81] hover:to-[#0d5f65] px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      // Trigger search when button is clicked
                      const filters = { ...currentFilters }
                      if (searchQuery.trim()) {
                        filters.keyword = searchQuery.trim()
                      } else {
                        delete filters.keyword
                      }
                      setCurrentFilters(filters)
                      searchServices(filters)
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {["Web Development", "UI/UX Design", "Mobile Development", "Content Writing", "Digital Marketing", "Data Science"].map((skill) => (
                  <Badge 
                    key={skill}
                    className="bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-700/70 cursor-pointer px-4 py-2 text-sm font-medium border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      setSearchQuery(skill)
                      // Trigger immediate search
                      const filters = { ...currentFilters, keyword: skill }
                      setCurrentFilters(filters)
                      searchServices(filters)
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
          {/* Compare bar */}
          {selectedFreelancers.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-[#15949C]/20 dark:border-gray-600 shadow-2xl z-50 py-4 px-6 backdrop-blur-sm"
            >
              <div className="container mx-auto max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#15949C] rounded-full animate-pulse"></div>
                    <span className="font-semibold text-[#002333] dark:text-white">
                      {selectedFreelancers.length} freelancer{selectedFreelancers.length > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {selectedFreelancers.map((id) => (
                      <div
                        key={id}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-[#15949C] to-[#117a81] border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-lg"
                      >
                        <span className="font-semibold text-white text-sm">{id.charAt(0).toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearSelectedFreelancers}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={toggleCompare}
                    disabled={selectedFreelancers.length < 2}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      selectedFreelancers.length < 2 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-gradient-to-r from-[#15949C] to-[#117a81] hover:from-[#117a81] hover:to-[#0d5f65] text-white shadow-lg hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    Compare Freelancers
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main content */}
          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* Filters sidebar */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:w-80 shrink-0"
                >
                  <TalentFilters 
                    onFiltersChange={handleFiltersChange}
                    currentFilters={currentFilters}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content area */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 p-6 bg-gradient-to-r from-gray-50 to-[#DEEFE7]/30 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsFilterOpen(!isFilterOpen)} 
                    className="flex items-center gap-2 bg-white dark:bg-gray-700 border-2 border-[#15949C] text-[#15949C] hover:bg-[#15949C] hover:text-white transition-all duration-200"
                  >
                    {isFilterOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                    {isFilterOpen ? "Hide Filters" : "Show Filters"}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#15949C] rounded-full"></div>
                    <span className="text-sm font-medium text-[#002333] dark:text-white">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#15949C] border-t-transparent rounded-full animate-spin"></div>
                          Finding talent...
                        </span>
                      ) : (
                        <span className="text-[#15949C] font-semibold">
                          {pagination?.total_services || services.length} freelancers found
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Error loading data
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-[#002333] dark:text-white hover:border-[#15949C] transition-colors">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <SelectItem value="relevance" className="text-[#002333] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600">Relevance</SelectItem>
                      <SelectItem value="rating" className="text-[#002333] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600">Highest Rating</SelectItem>
                      <SelectItem value="reviews" className="text-[#002333] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600">Most Reviews</SelectItem>
                      <SelectItem value="newest" className="text-[#002333] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600">Newest</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-1 flex shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-lg transition-all duration-200 ${
                        viewMode === "grid" 
                          ? "bg-[#15949C] text-white shadow-md" 
                          : "text-gray-500 dark:text-gray-400 hover:text-[#15949C] hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-lg transition-all duration-200 ${
                        viewMode === "list" 
                          ? "bg-[#15949C] text-white shadow-md" 
                          : "text-gray-500 dark:text-gray-400 hover:text-[#15949C] hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-lg transition-all duration-200 ${
                        viewMode === "map" 
                          ? "bg-[#15949C] text-white shadow-md" 
                          : "text-gray-500 dark:text-gray-400 hover:text-[#15949C] hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setViewMode("map")}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* View content based on selected view mode */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <div className="w-16 h-16 border-4 border-[#DEEFE7] border-t-[#15949C] rounded-full animate-spin mb-4"></div>
                    <p className="text-[#002333] font-medium">Finding the best talent for you...</p>
                  </motion.div>
                ) : (
                  <>
                    {viewMode === "grid" && (
                      <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TalentGridView
                          services={services}
                          selectedFreelancers={selectedFreelancers}
                          toggleFreelancerSelection={toggleFreelancerSelection}
                          openFreelancerDetail={openFreelancerDetail}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    )}

                    {viewMode === "list" && (
                      <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TalentListView
                          services={services}
                          selectedFreelancers={selectedFreelancers}
                          toggleFreelancerSelection={toggleFreelancerSelection}
                          openFreelancerDetail={openFreelancerDetail}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    )}

                    {viewMode === "map" && (
                      <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TalentMapView
                          services={services}
                          selectedFreelancers={selectedFreelancers}
                          toggleFreelancerSelection={toggleFreelancerSelection}
                          openFreelancerDetail={openFreelancerDetail}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.total_pages}
                  totalItems={pagination.total_services}
                  itemsPerPage={pagination.per_page}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>

          {/* Market Insights Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#15949C]/10 border border-[#15949C]/20 rounded-full px-4 py-2 mb-4">
                <div className="w-2 h-2 bg-[#15949C] rounded-full"></div>
                <span className="text-sm font-medium text-[#15949C]">Market Intelligence</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#002333] dark:text-white mb-4">
                Talent Market Insights
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Stay ahead with real-time market trends and pricing insights
              </p>
            </div>
            <TalentMarketInsights services={services} isLoading={isLoading} />
          </div>

          {/* Popular Categories */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#15949C]/10 border border-[#15949C]/20 rounded-full px-4 py-2 mb-4">
                <div className="w-2 h-2 bg-[#15949C] rounded-full"></div>
                <span className="text-sm font-medium text-[#15949C]">Browse by Category</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#002333] dark:text-white mb-4">
                Explore Talent by Category
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Find specialized professionals across different industries and skill sets
              </p>
            </div>
            <TalentCategories 
              services={services} 
              onCategoryClick={(category) => {
                const filters = { ...currentFilters, category, page: 1 }
                setCurrentFilters(filters)
                searchServices(filters)
                // Scroll to results
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Compare Dialog */}
      {showCompare && (
        <TalentCompare
          selectedFreelancers={selectedFreelancers}
          onClose={() => setShowCompare(false)}
          clearSelection={clearSelectedFreelancers}
        />
      )}

      {/* Freelancer Detail Dialog */}
      {selectedFreelancer && (
        <TalentDetailDialog
          freelancer={selectedFreelancer}
          onClose={closeFreelancerDetail}
          isSelected={selectedFreelancers.includes(String(selectedFreelancer.id))}
          onToggleSelect={() => toggleFreelancerSelection(String(selectedFreelancer.id))}
        />
      )}
    </div>
  )
}

