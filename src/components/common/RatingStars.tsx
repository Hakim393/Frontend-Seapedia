import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  max?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

export default function RatingStars({
  rating,
  max = 5,
  onRatingChange,
  size = 4,
}: RatingStarsProps) {
  const starsArray = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <div className="flex items-center gap-1" id="rating-stars">
      {starsArray.map((num) => {
        const isFilled = num <= rating;
        const widthHeight = `w-${size} h-${size}`;
        return (
          <button
            key={num}
            type="button"
            disabled={!onRatingChange}
            onClick={() => onRatingChange?.(num)}
            className={`${onRatingChange ? "cursor-pointer hover:scale-110 transition" : "cursor-default"} focus:outline-none`}
          >
            <Star
              className={`${widthHeight} ${
                isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
