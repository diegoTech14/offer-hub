"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, MoreVertical, Users, Lock, Folder } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'

interface CustomListsProps {
  userId: string
  className?: string
}

export default function CustomLists({ userId, className }: CustomListsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  
  const { customLists, createList, deleteList, selectedListId, setSelectedList } = useFavorites(userId)

  const handleCreateList = async () => {
    if (!newListName.trim()) return

    await createList(newListName.trim(), newListDescription.trim())
    setNewListName('')
    setNewListDescription('')
    setIsCreateDialogOpen(false)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            My Lists
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">List Name</label>
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Top React Developers"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Describe this list..."
                  />
                </div>
                <Button onClick={handleCreateList} className="w-full">
                  Create List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px]">
          {customLists.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No lists created yet</p>
              <p className="text-sm text-gray-400">Create your first list to organize favorites</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customLists.map(list => (
                <ListCard
                  key={list.id}
                  list={list}
                  isSelected={selectedListId === list.id}
                  onSelect={() => setSelectedList(list.id)}
                  onDelete={() => deleteList(list.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function ListCard({ list, isSelected, onSelect, onDelete }: any) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <Folder className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{list.name}</h4>
                {list.isShared && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Shared
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 truncate">
                {list.freelancerIds.length} freelancers
                {list.description && ` • ${list.description}`}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  Updated {list.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}