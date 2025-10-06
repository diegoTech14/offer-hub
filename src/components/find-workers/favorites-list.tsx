"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Filter, Grid, List, Download, Share2, MoreVertical } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { FavoritesSearchFilters } from '@/types/favorites.types'
import FavoriteButton from './favorite-button'

interface FavoritesListProps {
  userId: string
  freelancers: any[] // This would be your actual freelancer type
  className?: string
}

export default function FavoritesList({ userId, freelancers, className }: FavoritesListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchFilters, setSearchFilters] = useState<FavoritesSearchFilters>({
    query: '',
    tags: [],
    minRating: 0
  })

  const { favorites, searchFavorites, exportFavorites, isSyncing } = useFavorites(userId)

  // Get actual freelancer data for favorites
  const favoriteFreelancers = useMemo(() => {
    const favoriteIds = favorites.map(fav => fav.freelancerId)
    return freelancers.filter(freelancer => favoriteIds.includes(freelancer.id))
  }, [favorites, freelancers])

  const filteredFavorites = useMemo(() => {
    return searchFavorites(searchFilters)
  }, [searchFavorites, searchFilters])

  const displayedFreelancers = favoriteFreelancers.filter(freelancer =>
    filteredFavorites.some(fav => fav.freelancerId === freelancer.id)
  )

  const handleSearch = (query: string) => {
    setSearchFilters(prev => ({ ...prev, query }))
  }

  const handleExport = (format: 'json' | 'csv') => {
    exportFavorites(format)
  }

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500">Start saving freelancers to build your talent pool</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Favorite Freelancers
            <Badge variant="secondary" className="ml-2">
              {favorites.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={isSyncing}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search favorites..."
              value={searchFilters.query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px]">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedFreelancers.map(freelancer => (
                <FavoriteCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  userId={userId}
                  favoriteData={favorites.find(fav => fav.freelancerId === freelancer.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedFreelancers.map(freelancer => (
                <FavoriteListItem
                  key={freelancer.id}
                  freelancer={freelancer}
                  userId={userId}
                  favoriteData={favorites.find(fav => fav.freelancerId === freelancer.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Helper components for individual favorite items
function FavoriteCard({ freelancer, userId, favoriteData }: any) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold">{freelancer.name}</h4>
            <p className="text-sm text-gray-600">{freelancer.title}</p>
          </div>
          <FavoriteButton freelancerId={freelancer.id} userId={userId} size="sm" />
        </div>
        
        {favoriteData?.notes && (
          <p className="text-sm text-gray-700 mb-3">{favoriteData.notes}</p>
        )}
        
        {favoriteData?.tags && favoriteData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {favoriteData.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Added {favoriteData?.addedAt.toLocaleDateString()}</span>
          <span>${freelancer.hourlyRate}/hr</span>
        </div>
      </CardContent>
    </Card>
  )
}

function FavoriteListItem({ freelancer, userId, favoriteData }: any) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{freelancer.name}</h4>
                <Badge variant="secondary">${freelancer.hourlyRate}/hr</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{freelancer.title}</p>
              
              {favoriteData?.notes && (
                <p className="text-sm text-gray-700 mb-2">{favoriteData.notes}</p>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Added {favoriteData?.addedAt.toLocaleDateString()}</span>
                {favoriteData?.tags && favoriteData.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex gap-1">
                      {favoriteData.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FavoriteButton freelancerId={freelancer.id} userId={userId} size="sm" />
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}