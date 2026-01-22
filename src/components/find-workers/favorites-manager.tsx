"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFavorites } from '@/hooks/use-favorites'
import FavoritesList from './favorites-list'
import CustomLists from './custom-lists'
import { SyncLoader } from '@/components/ui/sync-loader'

interface FavoritesManagerProps {
  userId: string
  freelancers: any[]
  className?: string
}

export default function FavoritesManager({ userId, freelancers, className }: FavoritesManagerProps) {
  const [activeTab, setActiveTab] = useState('favorites')
  const { isSyncing, lastSynced } = useFavorites(userId)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Talent Management</h1>
          <p className="text-gray-600">Manage your favorite freelancers and create custom lists</p>
        </div>
        
        <SyncLoader isSyncing={isSyncing} lastSynced={lastSynced} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          <TabsTrigger value="lists">Custom Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-6">
          <FavoritesList userId={userId} freelancers={freelancers} />
        </TabsContent>

        <TabsContent value="lists" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CustomLists userId={userId} />
            </div>
            <div className="lg:col-span-2">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a list to view</h3>
                <p className="text-gray-500">Choose a list from the sidebar to see its contents</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}