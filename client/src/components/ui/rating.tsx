import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function Rating({
  value = 0,
  max = 5,
  readOnly = true,
  onChange,
  className,
}: RatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const handleClick = (rating: number) => {
    if (readOnly) return;
    onChange?.(rating);
  };

  return (
    <div className={cn("flex", className)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "cursor-default text-yellow-500 transition-colors",
            !readOnly && "cursor-pointer hover:text-yellow-400"
          )}
          disabled={readOnly}
          onClick={() => handleClick(star)}
        >
          <Star
            className={cn("h-4 w-4", {
              "fill-yellow-500": star <= value,
              "fill-none": star > value,
            })}
          />
        </button>
      ))}
    </div>
  );
}