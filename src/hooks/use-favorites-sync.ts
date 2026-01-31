import { useCallback, useState } from 'react'
import { FavoriteFreelancer, CustomList } from '@/types/favorites.types'
import { favoritesSync } from '@/utils/favorites-sync'

export const useFavoritesSync = () => {
  const [isSyncing, setIsSyncing] = useState(false)

  const syncFavorites = useCallback(async (favorites: FavoriteFreelancer[], lists: CustomList[]) => {
    setIsSyncing(true)
    try {
      const success = await favoritesSync.syncWithBackend(favorites, lists)
      return success
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return {
    syncFavorites,
    isSyncing
  }
}