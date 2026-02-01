import { ArrowRight, ArrowLeft, FileText, Heart, Tags, Lightbulb, Calendar, CalendarDays, CalendarRange, Puzzle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { BackgroundNumber, UnderlineAccent } from "@/components/typography";

interface SlideAIPipelineProps {
  onNext: () => void;
  onBack: () => void;
}

// Muted, pastel colors - not vibrant
const agents = [
  { id: 1, name: "Intent", icon: FileText, color: "text-teal-700 dark:text-teal-400", bgActive: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-200 dark:border-teal-800" },
  { id: 2, name: "Emotion", icon: Heart, color: "text-rose-700 dark:text-rose-400", bgActive: "bg-rose-100 dark:bg-rose-900/30", border: "border-rose-200 dark:border-rose-800" },
  { id: 3, name: "Theme", icon: Tags, color: "text-amber-700 dark:text-amber-400", bgActive: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800" },
  { id: 4, name: "Insight", icon: Lightbulb, color: "text-teal-700 dark:text-teal-400", bgActive: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-200 dark:border-teal-800" },
  { id: 5, name: "Decompose", icon: Puzzle, color: "text-stone-600 dark:text-stone-400", bgActive: "bg-stone-100 dark:bg-stone-800/30", border: "border-stone-200 dark:border-stone-700" },
  { id: 6, name: "Daily", icon: Calendar, color: "text-teal-700 dark:text-teal-400", bgActive: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-200 dark:border-teal-800" },
  { id: 7, name: "Weekly", icon: CalendarDays, color: "text-amber-700 dark:text-amber-400", bgActive: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800" },
  { id: 8, name: "Monthly", icon: CalendarRange, color: "text-rose-700 dark:text-rose-400", bgActive: "bg-rose-100 dark:bg-rose-900/30", border: "border-rose-200 dark:border-rose-800" },
  { id: 9, name: "Personal", icon: User, color: "text-teal-700 dark:text-teal-400", bgActive: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-200 dark:border-teal-800" },
];

export function SlideAIPipeline({ onNext, onBack }: SlideAIPipelineProps) {
  const [activeAgent, setActiveAgent] = useState(0);

  // Animate through agents - faster speed
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center text-center px-4 py-4 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="07" position="top-right" variant="amber" size="sm" />

      {/* AI-generated image */}
      <img
        src="/images/onboarding/ai-pipeline.png"
        alt="Four luminous orbs connected by gossamer threads"
        className="w-20 h-20 object-cover rounded-2xl shadow-lg mb-3 z-10"
      />

      {/* Headline */}
      <h2 className="text-lg sm:text-xl font-bold mb-1 z-10">
        Meet Your <UnderlineAccent>Cognitive Companion</UnderlineAccent>
      </h2>
      <p className="text-muted-foreground mb-4 max-w-sm text-sm z-10">
        9 specialized AI agents analyze your entries
      </p>

      {/* AI Pipeline visualization - 3x3 grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-4 z-10">
        {agents.map((agent, idx) => {
          const isActive = idx === activeAgent;

          return (
            <div
              key={agent.id}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200",
                isActive
                  ? `${agent.bgActive} ${agent.border} scale-105 shadow-sm`
                  : "bg-muted/20 border-transparent"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                  isActive ? agent.bgActive : "bg-muted/50"
                )}
              >
                <agent.icon
                  className={cn(
                    "w-4 h-4 transition-all duration-200",
                    isActive ? agent.color : "text-muted-foreground"
                  )}
                />
              </div>
              <p
                className={cn(
                  "font-medium text-xs transition-colors duration-200",
                  isActive ? agent.color : "text-foreground/70"
                )}
              >
                {agent.name}
              </p>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 py-1.5 px-3 rounded-full bg-muted/50 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span>All processing happens in seconds</span>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 w-full max-w-xs z-10">
        <Button
          onClick={onBack}
          variant="outline"
          size="default"
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="default"
          className="flex-1 group"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
