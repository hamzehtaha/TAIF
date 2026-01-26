import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface RatingComponentProps {
  onSubmit: (rating: number, review?: string) => void;
  isLoading?: boolean;
}

export function RatingComponent({
  onSubmit,
  isLoading = false,
}: RatingComponentProps) {
  const t = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review || undefined);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <div>
        <h3 className="font-semibold mb-4">{t.courses.rating}</h3>

        {/* Star Rating */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  "w-10 h-10 transition-colors",
                  hoveredRating >= star || rating >= star
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-sm text-muted-foreground">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="review" className="block text-sm font-medium mb-2">
          {t.courses.reviews}
        </label>
        <textarea
          id="review"
          placeholder="Share your experience with this course..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full min-h-[120px] p-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {review.length}/500
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isLoading}
        className="w-full"
      >
        {isLoading ? t.common.loading : "Submit Rating"}
      </Button>
    </div>
  );
}
