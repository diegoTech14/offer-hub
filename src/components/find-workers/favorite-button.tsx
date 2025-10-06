"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Check, Loader2 } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  freelancerId: string
  userId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  showLabel?: boolean
}

export default function FavoriteButton({
  freelancerId,
  userId,
  size = 'md',
  variant = 'outline',
  className,
  showLabel = false
}: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isFavorite, addToFavorites, removeFromFavorites, isSyncing } = useFavorites(userId)

  const isFav = isFavorite(freelancerId)

  const handleClick = async () => {
    if (isLoading || isSyncing) return

    setIsLoading(true)
    try {
      if (isFav) {
        await removeFromFavorites(freelancerId)
      } else {
        await addToFavorites(freelancerId)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isSyncing}
      className={cn(
        "transition-all duration-200",
        isFav 
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
          : "hover:bg-gray-50",
        className
      )}
    >
      {isLoading || isSyncing ? (
        <Loader2 className={cn("animate-spin", showLabel && "mr-2")} size={iconSizes[size]} />
      ) : isFav ? (
        <Check className={cn(showLabel && "mr-2")} size={iconSizes[size]} />
      ) : (
        <Heart className={cn(showLabel && "mr-2")} size={iconSizes[size]} />
      )}
      {showLabel && (isFav ? 'Saved' : 'Save')}
    </Button>
  )
}