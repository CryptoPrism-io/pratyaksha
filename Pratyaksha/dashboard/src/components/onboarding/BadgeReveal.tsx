import { useEffect, useState } from "react";
import { BADGES, type BadgeId } from "@/lib/onboardingStorage";
import { cn } from "@/lib/utils";
import { Compass, BookOpen, Anchor, Search } from "lucide-react";

interface BadgeRevealProps {
  badge: BadgeId;
  onComplete?: () => void;
}

// Map badge IDs to icons
const badgeIcons: Record<BadgeId, React.ComponentType<{ className?: string }>> = {
  early_explorer: Compass,
  open_book: BookOpen,
  deep_diver: Anchor,
  seeker: Search,
};

export function BadgeReveal({ badge, onComplete }: BadgeRevealProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const badgeInfo = BADGES[badge];
  const Icon = badgeIcons[badge];

  useEffect(() => {
    // Animation sequence
    const enterTimer = setTimeout(() => setPhase("show"), 100);
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      setTimeout(() => onComplete?.(), 500);
    }, 3000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        phase === "enter" && "opacity-0",
        phase === "show" && "opacity-100 transition-opacity duration-500",
        phase === "exit" && "opacity-0 transition-opacity duration-500"
      )}
    >
      {/* Confetti overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-2 h-2 rounded-full",
              i % 5 === 0 && "bg-amber-500",
              i % 5 === 1 && "bg-primary",
              i % 5 === 2 && "bg-green-500",
              i % 5 === 3 && "bg-rose-500",
              i % 5 === 4 && "bg-blue-500"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              animation: phase === "show"
                ? `confetti-fall ${1.5 + Math.random()}s ease-out forwards`
                : "none",
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Badge card */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-amber-500/20 via-background to-background",
          "border-2 border-amber-500/50 rounded-2xl p-8 text-center",
          "shadow-2xl shadow-amber-500/20",
          "transform transition-all duration-700",
          phase === "enter" && "scale-50 opacity-0",
          phase === "show" && "scale-100 opacity-100",
          phase === "exit" && "scale-110 opacity-0"
        )}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />

        {/* Content */}
        <div className="relative">
          {/* Badge icon */}
          <div
            className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full",
              "bg-gradient-to-br from-amber-400 to-amber-600",
              "flex items-center justify-center shadow-lg shadow-amber-500/30",
              phase === "show" && "animate-bounce"
            )}
          >
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Badge title */}
          <p className="text-xs uppercase tracking-wider text-amber-500 mb-1">
            Badge Unlocked
          </p>
          <h3 className="text-2xl font-bold mb-2 text-foreground">
            {badgeInfo.name}
          </h3>
          <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
            {badgeInfo.description}
          </p>
        </div>
      </div>

      {/* Keyframes for confetti */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

interface BadgeRevealQueueProps {
  badges: BadgeId[];
  onComplete?: () => void;
}

export function BadgeRevealQueue({ badges, onComplete }: BadgeRevealQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (badges.length === 0 || currentIndex >= badges.length) {
    return null;
  }

  const handleBadgeComplete = () => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete?.();
    }
  };

  return (
    <BadgeReveal
      badge={badges[currentIndex]}
      onComplete={handleBadgeComplete}
    />
  );
}
