import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentSlide: number;
  totalSlides: number;
  lastCompletedSlide: number;
  onSlideClick?: (slide: number) => void;
}

export function OnboardingProgress({
  currentSlide,
  totalSlides,
  lastCompletedSlide,
  onSlideClick,
}: OnboardingProgressProps) {
  const progressPercent = ((currentSlide - 1) / (totalSlides - 1)) * 100;

  return (
    <div className="w-full px-4 py-3">
      {/* Progress bar background */}
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        {/* Animated progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Slide dots */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSlides }, (_, i) => {
          const slideNum = i + 1;
          const isActive = slideNum === currentSlide;
          const isCompleted = slideNum <= lastCompletedSlide;
          const isClickable = slideNum <= lastCompletedSlide + 1;
          const isOdd = slideNum % 2 === 1; // WHY slides

          return (
            <button
              key={slideNum}
              onClick={() => isClickable && onSlideClick?.(slideNum)}
              disabled={!isClickable}
              className={cn(
                "relative flex items-center justify-center transition-all duration-300",
                isClickable ? "cursor-pointer" : "cursor-not-allowed",
                // Size based on active state
                isActive ? "w-8 h-8" : "w-5 h-5"
              )}
              aria-label={`Slide ${slideNum}${isActive ? " (current)" : ""}${isCompleted ? " (completed)" : ""}`}
            >
              {/* Dot */}
              <div
                className={cn(
                  "rounded-full transition-all duration-300 flex items-center justify-center",
                  // Size
                  isActive ? "w-8 h-8" : "w-5 h-5",
                  // Colors
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : isCompleted
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  // Hover
                  isClickable && !isActive && "hover:bg-primary/60 hover:text-primary-foreground"
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className={cn("text-xs font-medium", isActive ? "text-sm" : "text-[10px]")}>
                    {slideNum}
                  </span>
                )}
              </div>

              {/* WHY/ACTION indicator (shown below on larger screens) */}
              <span
                className={cn(
                  "absolute -bottom-5 text-[9px] font-medium uppercase tracking-wider hidden sm:block transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                {isOdd ? "Why" : "Do"}
              </span>

              {/* Pulse animation for current slide */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Slide counter text */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        Step {currentSlide} of {totalSlides}
      </div>
    </div>
  );
}
