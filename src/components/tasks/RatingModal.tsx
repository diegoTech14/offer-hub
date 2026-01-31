"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  projectTitle: string;
  onSuccess?: (data: { rating: number; comment?: string }) => void;
}

export function RatingModal({
  isOpen,
  onClose,
  recordId,
  projectTitle,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating between 1 and 5.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/task-records/${recordId}/rating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      const json = (await response.json().catch(() => null)) as
        | { data?: { rating?: number; comment?: string } }
        | null;

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });

      onSuccess?.({
        rating: json?.data?.rating ?? rating,
        comment: json?.data?.comment ?? (comment.trim() || undefined),
      });
      onClose();
      // Reset state
      setRating(0);
      setComment("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Task</DialogTitle>
          <DialogDescription>
            Share your feedback for &quot;{projectTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  className={cn(
                    "w-8 h-8",
                    (hoveredRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300",
                  )}
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600">
            {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
          </span>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium">
            Comment (Optional)
          </label>
          <Textarea
            id="comment"
            placeholder="Tell us about your experience..."
            className="h-24 resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
          />
          <div className="text-xs text-gray-500 text-right">
            {comment.length}/500
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#149A9B] hover:bg-[#128889] text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
