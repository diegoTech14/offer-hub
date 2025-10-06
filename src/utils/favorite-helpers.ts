import { FavoriteFreelancer, CustomList } from '@/types/favorites.types'

export const favoritesHelpers = {
  // Drag and drop functionality
  handleDragStart: (e: React.DragEvent, freelancerId: string, listId?: string) => {
    e.dataTransfer.setData('application/freelancer-id', freelancerId)
    if (listId) {
      e.dataTransfer.setData('application/source-list-id', listId)
    }
  },

  handleDragOver: (e: React.DragEvent) => {
    e.preventDefault()
  },

  handleDrop: (
    e: React.DragEvent, 
    targetListId: string, 
    onMoveFreelancer: (sourceListId: string, targetListId: string, freelancerId: string) => void
  ) => {
    e.preventDefault()
    const freelancerId = e.dataTransfer.getData('application/freelancer-id')
    const sourceListId = e.dataTransfer.getData('application/source-list-id')
    
    if (freelancerId) {
      onMoveFreelancer(sourceListId || 'favorites', targetListId, freelancerId)
    }
  },

  // Search and filter helpers
  filterFavorites: (favorites: FavoriteFreelancer[], query: string, filters: any) => {
    return favorites.filter(favorite => {
      const matchesQuery = !query || favorite.freelancerId.toLowerCase().includes(query.toLowerCase())
      const matchesTags = !filters.tags?.length || filters.tags.some((tag: string) => 
        favorite.tags?.includes(tag)
      )
      const matchesRating = !filters.minRating || (favorite.rating || 0) >= filters.minRating
      
      return matchesQuery && matchesTags && matchesRating
    })
  },

  // Export helpers
  formatForExport: (favorites: FavoriteFreelancer[], lists: CustomList[]) => {
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalFavorites: favorites.length,
        totalLists: lists.length
      },
      favorites: favorites.map(fav => ({
        ...fav,
        addedAt: fav.addedAt.toISOString()
      })),
      lists: lists.map(list => ({
        ...list,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString()
      }))
    }
  }
}