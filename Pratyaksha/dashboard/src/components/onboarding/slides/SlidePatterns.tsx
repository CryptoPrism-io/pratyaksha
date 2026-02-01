import { TrendingUp, Brain, Lightbulb, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { BackgroundNumber, BrushUnderline } from "@/components/typography";

interface SlidePatternsProps {
  onNext: () => void;
  onBack: () => void;
}

// Animated mini chart data
const chartData = [
  { day: "Mon", mood: 3 },
  { day: "Tue", mood: 4 },
  { day: "Wed", mood: 2 },
  { day: "Thu", mood: 4 },
  { day: "Fri", mood: 5 },
  { day: "Sat", mood: 4 },
  { day: "Sun", mood: 5 },
];

export function SlidePatterns({ onNext, onBack }: SlidePatternsProps) {
  const [animatedIndex, setAnimatedIndex] = useState(0);

  // Animate chart bars sequentially
  useEffect(() => {
    if (animatedIndex < chartData.length) {
      const timer = setTimeout(() => {
        setAnimatedIndex((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [animatedIndex]);

  const benefits = [
    {
      icon: Brain,
      title: "AI analyzes mood, energy & themes",
      description: "From your natural writing",
    },
    {
      icon: TrendingUp,
      title: "Spot recurring thoughts",
      description: "Patterns emerge over time",
    },
    {
      icon: Lightbulb,
      title: "Personalized insights",
      description: "Tailored to your journey",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center px-4 py-4 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="03" position="top-right" variant="rose" size="sm" />

      {/* Top row: Image + Chart side by side */}
      <div className="flex items-center gap-4 mb-4 z-10">
        {/* AI-generated patterns image */}
        <img
          src="/images/onboarding/patterns.png"
          alt="Flowing patterns representing thoughts"
          className="w-20 h-20 object-cover rounded-xl shadow-lg"
        />

        {/* Mini chart visualization */}
        <div className="p-2 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
            Your mood patterns
          </p>
          <div className="flex items-end gap-1.5 h-14">
            {chartData.map((item, idx) => (
              <div key={item.day} className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    "w-4 rounded-t transition-all duration-500 ease-out",
                    idx < animatedIndex
                      ? "bg-gradient-to-t from-primary to-primary/60"
                      : "bg-muted"
                  )}
                  style={{
                    height: idx < animatedIndex ? `${item.mood * 10}px` : "3px",
                    transitionDelay: `${idx * 50}ms`,
                  }}
                />
                <span className="text-[8px] text-muted-foreground">{item.day[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Headline */}
      <h2 className="text-lg sm:text-xl font-bold mb-1 z-10">
        Your Thoughts Have <BrushUnderline variant="teal">Patterns</BrushUnderline>
      </h2>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm z-10">
        Every entry reveals a piece of the puzzle
      </p>

      {/* Benefits list - horizontal on larger screens */}
      <div className="grid grid-cols-3 gap-2 mb-4 w-full max-w-md z-10">
        {benefits.map((benefit, idx) => (
          <div
            key={benefit.title}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-lg bg-muted/30 text-center",
              "animate-in fade-in slide-in-from-bottom-4",
            )}
            style={{ animationDelay: `${300 + idx * 100}ms` }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <benefit.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="font-medium text-xs leading-tight">{benefit.title}</p>
          </div>
        ))}
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
