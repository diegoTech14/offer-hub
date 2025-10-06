"use client"

import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, CloudOff } from 'lucide-react'

interface SyncLoaderProps {
  isSyncing: boolean
  lastSynced: Date | null
}

export function SyncLoader({ isSyncing, lastSynced }: SyncLoaderProps) {
  return (
    <div className="flex items-center gap-2">
      {isSyncing ? (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing...
        </Badge>
      ) : lastSynced ? (
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Synced {lastSynced.toLocaleTimeString()}
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1">
          <CloudOff className="h-3 w-3 text-yellow-500" />
          Offline
        </Badge>
      )}
    </div>
  )
}