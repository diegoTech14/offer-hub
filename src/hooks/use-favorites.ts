"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  FavoriteFreelancer, 
  CustomList, 
  FavoritesState, 
  FavoritesSearchFilters,
  ListOperation 
} from '@/types/favorites.types'
import { useFavoritesSync } from './use-favorites-sync'
import { useToast } from '@/components/ui/use-toast'

export const useFavorites = (userId: string) => {
  const [state, setState] = useState<FavoritesState>({
    favorites: [],
    customLists: [],
    searchQuery: '',
    isLoading: false,
    lastSynced: null
  })

  const { toast } = useToast()
  const { syncFavorites, isSyncing } = useFavoritesSync()

  // Load initial data
  useEffect(() => {
    loadFavoritesData()
  }, [userId])

  const loadFavoritesData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      // In a real app, this would be an API call
      const savedData = localStorage.getItem(`favorites_${userId}`)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setState({
          ...parsedData,
          favorites: parsedData.favorites.map((f: any) => ({
            ...f,
            addedAt: new Date(f.addedAt)
          })),
          customLists: parsedData.customLists.map((list: any) => ({
            ...list,
            createdAt: new Date(list.createdAt),
            updatedAt: new Date(list.updatedAt)
          })),
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [userId])

  const saveToStorage = useCallback((data: Partial<FavoritesState>) => {
    const newState = { ...state, ...data }
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(newState))
    setState(newState)
  }, [state, userId])

  // Favorite management
  const addToFavorites = useCallback(async (freelancerId: string) => {
    const newFavorite: FavoriteFreelancer = {
      id: `fav_${Date.now()}`,
      freelancerId,
      userId,
      addedAt: new Date(),
      status: 'active'
    }

    const updatedFavorites = [...state.favorites, newFavorite]
    saveToStorage({ favorites: updatedFavorites })
    
    // Sync with backend
    await syncFavorites(updatedFavorites, state.customLists)
    
    toast({
      title: "Added to favorites",
      description: "Freelancer has been added to your favorites",
    })
  }, [state.favorites, state.customLists, userId, saveToStorage, syncFavorites, toast])

  const removeFromFavorites = useCallback(async (freelancerId: string) => {
    const updatedFavorites = state.favorites.filter(fav => fav.freelancerId !== freelancerId)
    saveToStorage({ favorites: updatedFavorites })
    
    // Sync with backend
    await syncFavorites(updatedFavorites, state.customLists)
    
    toast({
      title: "Removed from favorites",
      description: "Freelancer has been removed from your favorites",
    })
  }, [state.favorites, state.customLists, saveToStorage, syncFavorites, toast])

  const isFavorite = useCallback((freelancerId: string) => {
    return state.favorites.some(fav => fav.freelancerId === freelancerId && fav.status === 'active')
  }, [state.favorites])

  // List management
  const createList = useCallback(async (name: string, description?: string) => {
    const newList: CustomList = {
      id: `list_${Date.now()}`,
      name,
      description,
      userId,
      freelancerIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isShared: false
    }

    const updatedLists = [...state.customLists, newList]
    saveToStorage({ customLists: updatedLists })
    
    await syncFavorites(state.favorites, updatedLists)
    
    toast({
      title: "List created",
      description: `"${name}" list has been created`,
    })

    return newList
  }, [state.favorites, state.customLists, userId, saveToStorage, syncFavorites, toast])

  const updateList = useCallback(async (listId: string, updates: Partial<CustomList>) => {
    const updatedLists = state.customLists.map(list =>
      list.id === listId ? { ...list, ...updates, updatedAt: new Date() } : list
    )
    saveToStorage({ customLists: updatedLists })
    await syncFavorites(state.favorites, updatedLists)
  }, [state.favorites, state.customLists, saveToStorage, syncFavorites])

  const deleteList = useCallback(async (listId: string) => {
    const updatedLists = state.customLists.filter(list => list.id !== listId)
    saveToStorage({ customLists: updatedLists })
    await syncFavorites(state.favorites, updatedLists)
    
    toast({
      title: "List deleted",
      description: "List has been deleted successfully",
    })
  }, [state.favorites, state.customLists, saveToStorage, syncFavorites, toast])

  const addToList = useCallback(async (listId: string, freelancerId: string) => {
    const updatedLists = state.customLists.map(list =>
      list.id === listId 
        ? { ...list, freelancerIds: [...list.freelancerIds, freelancerId], updatedAt: new Date() }
        : list
    )
    saveToStorage({ customLists: updatedLists })
    await syncFavorites(state.favorites, updatedLists)
  }, [state.favorites, state.customLists, saveToStorage, syncFavorites])

  const removeFromList = useCallback(async (listId: string, freelancerId: string) => {
    const updatedLists = state.customLists.map(list =>
      list.id === listId 
        ? { ...list, freelancerIds: list.freelancerIds.filter(id => id !== freelancerId), updatedAt: new Date() }
        : list
    )
    saveToStorage({ customLists: updatedLists })
    await syncFavorites(state.favorites, updatedLists)
  }, [state.favorites, state.customLists, saveToStorage, syncFavorites])

  const moveBetweenLists = useCallback(async (sourceListId: string, targetListId: string, freelancerId: string) => {
    let updatedLists = state.customLists.map(list =>
      list.id === sourceListId 
        ? { ...list, freelancerIds: list.freelancerIds.filter(id => id !== freelancerId), updatedAt: new Date() }
        : list
    )
    
    updatedLists = updatedLists.map(list =>
      list.id === targetListId 
        ? { ...list, freelancerIds: [...list.freelancerIds, freelancerId], updatedAt: new Date() }
        : list
    )
    
    saveToStorage({ customLists: updatedLists })
    await syncFavorites(state.favorites, updatedLists)
  }, [state.favorites, state.customLists, saveToStorage, syncFavorites])

  // Search and filtering
  const searchFavorites = useCallback((filters: FavoritesSearchFilters) => {
    setState(prev => ({ ...prev, searchQuery: filters.query }))
    
    let results = state.favorites.filter(fav => fav.status === 'active')
    
    if (filters.query) {
      const query = filters.query.toLowerCase()
      // This would be enhanced with actual freelancer data search
      results = results.filter(fav => 
        fav.freelancerId.toLowerCase().includes(query)
      )
    }
    
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(fav => 
        fav.tags?.some(tag => filters.tags!.includes(tag))
      )
    }
    
    if (filters.minRating) {
      results = results.filter(fav => (fav.rating || 0) >= filters.minRating!)
    }
    
    return results
  }, [state.favorites])

  // Export functionality
  const exportFavorites = useCallback(async (format: 'json' | 'csv' = 'json') => {
    const data = {
      favorites: state.favorites,
      customLists: state.customLists,
      exportedAt: new Date().toISOString()
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `favorites-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Basic CSV implementation
      const csvContent = [
        ['Freelancer ID', 'Added Date', 'Notes', 'Tags'].join(','),
        ...state.favorites.map(fav => [
          fav.freelancerId,
          fav.addedAt.toISOString(),
          `"${fav.notes || ''}"`,
          `"${fav.tags?.join(';') || ''}"`
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `favorites-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    toast({
      title: "Export completed",
      description: `Favorites exported as ${format.toUpperCase()}`,
    })
  }, [state.favorites, state.customLists, toast])

  return {
    ...state,
    isSyncing,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    createList,
    updateList,
    deleteList,
    addToList,
    removeFromList,
    moveBetweenLists,
    searchFavorites,
    exportFavorites,
    setSelectedList: (listId?: string) => setState(prev => ({ ...prev, selectedListId: listId }))
  }
}