import { FavoriteFreelancer, CustomList, FavoritesSyncData } from '@/types/favorites.types'

class FavoritesSync {
  private syncQueue: Array<() => Promise<void>> = []
  private isSyncing = false
  private lastSyncTime: Date | null = null

  async syncWithBackend(favorites: FavoriteFreelancer[], lists: CustomList[]): Promise<boolean> {
    try {
      this.isSyncing = true
      
      // Simulate API call to backend
      const syncData: FavoritesSyncData = {
        favorites,
        customLists: lists,
        lastSync: new Date()
      }

      // In a real implementation, this would be:
      // const response = await fetch('/api/favorites/sync', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(syncData)
      // })

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Simulate successful sync
      this.lastSyncTime = new Date()
      
      // Store last sync data for conflict resolution
      localStorage.setItem('favorites_last_sync', JSON.stringify(syncData))
      
      return true
    } catch (error) {
      console.error('Sync failed:', error)
      this.queueSync(favorites, lists)
      return false
    } finally {
      this.isSyncing = false
      this.processQueue()
    }
  }

  private queueSync(favorites: FavoriteFreelancer[], lists: CustomList[]) {
    this.syncQueue.push(() => this.syncWithBackend(favorites, lists))
  }

  private async processQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return
    
    const nextSync = this.syncQueue.shift()
    if (nextSync) {
      await nextSync()
    }
  }

  async resolveConflicts(localData: FavoritesSyncData, remoteData: FavoritesSyncData): Promise<FavoritesSyncData> {
    // Simple conflict resolution: prefer local changes if they're newer
    const localIsNewer = localData.lastSync > remoteData.lastSync
    
    if (localIsNewer) {
      return localData
    } else {
      // Merge strategy: combine both datasets
      return {
        favorites: this.mergeArrays(localData.favorites, remoteData.favorites, 'id'),
        customLists: this.mergeArrays(localData.customLists, remoteData.customLists, 'id'),
        lastSync: new Date()
      }
    }
  }

  private mergeArrays<T extends { id: string }>(local: T[], remote: T[], key: keyof T): T[] {
    const merged = [...remote]
    const remoteIds = new Set(remote.map(item => item.id))

    local.forEach(localItem => {
      if (!remoteIds.has(localItem.id)) {
        merged.push(localItem)
      }
    })

    return merged
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime
  }

  isCurrentlySyncing(): boolean {
    return this.isSyncing
  }
}

export const favoritesSync = new FavoritesSync()