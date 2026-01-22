"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  freelancerId: number;
  userId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  freelancerId,
  userId,
  size = "default",
  variant = "outline",
  className = "",
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if this freelancer is already favorited
  useEffect(() => {
    // TODO: Replace with actual API call to check favorite status
    const checkFavoriteStatus = async () => {
      try {
        // Mock implementation - replace with actual API call
        const favoriteStatus = false; // This would come from your API
        setIsFavorite(favoriteStatus);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [freelancerId, userId]);

  const handleToggleFavorite = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to toggle favorite
      // await toggleFavorite(freelancerId, userId);
      
      // For now, just toggle the local state
      setIsFavorite(!isFavorite);
      
      // You can add API call here later:
      // const response = await fetch('/api/favorites', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ freelancerId, userId, action: isFavorite ? 'remove' : 'add' })
      // });
      
      console.log(`Toggled favorite for freelancer ${freelancerId}`);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${
        isFavorite ? "bg-[#15949C] text-white" : "bg-white/80 text-[#002333]"
      }`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      <Heart 
        className="h-4 w-4" 
        fill={isFavorite ? "currentColor" : "none"}
      />
    </Button>
  );
};

export default FavoriteButton;
