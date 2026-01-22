export interface FavoriteFreelancer {
  id: string
  freelancerId: string
  userId: string
  addedAt: Date
  notes?: string
  tags?: string[]
  rating?: number
  status: 'active' | 'archived'
}

export interface CustomList {
  id: string
  name: string
  description?: string
  userId: string
  freelancerIds: string[]
  createdAt: Date
  updatedAt: Date
  color?: string
  icon?: string
  isShared: boolean
  sharedWith?: string[]
  tags?: string[]
}

export interface FavoritesState {
  favorites: FavoriteFreelancer[]
  customLists: CustomList[]
  selectedListId?: string
  searchQuery: string
  isLoading: boolean
  lastSynced: Date | null
}

export interface FavoritesSyncData {
  favorites: FavoriteFreelancer[]
  customLists: CustomList[]
  lastSync: Date
}

export interface ListOperation {
  type: 'add' | 'remove' | 'update'
  listId: string
  freelancerId: string
  timestamp: Date
}

export interface FavoritesSearchFilters {
  query: string
  tags?: string[]
  minRating?: number
  availability?: string[]
  skills?: string[]
  location?: string
}