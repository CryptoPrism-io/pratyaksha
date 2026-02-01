import {
  BarChart3,
  MessageSquare,
  CalendarDays,
  Trophy,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BackgroundNumber, UnderlineAccent } from "@/components/typography";

interface SlideFeaturePreviewProps {
  onNext: () => void;
  onBack: () => void;
}

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description: "Visualize mood distribution, energy patterns, and trends",
    preview: (
      <div className="flex items-end gap-1 h-8">
        {[40, 60, 35, 80, 55, 70, 90].map((h, i) => (
          <div
            key={i}
            className="w-3 rounded-t bg-gradient-to-t from-primary to-primary/60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: MessageSquare,
    title: "Smart Prompts",
    description: "Contextual nudges based on your mood and patterns",
    preview: (
      <div className="text-xs italic text-muted-foreground">
        "You seem reflective today..."
      </div>
    ),
  },
  {
    icon: CalendarDays,
    title: "Weekly Insights",
    description: "Track your journaling streak and consistency",
    preview: (
      <div className="flex gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div
            key={i}
            className={cn(
              "w-5 h-5 rounded text-[10px] flex items-center justify-center",
              i < 5 ? "bg-primary/80 text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Trophy,
    title: "Milestones",
    description: "Earn badges as you build your journaling habit",
    preview: (
      <div className="flex gap-2">
        {[7, 30, 100].map((days) => (
          <div
            key={days}
            className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center justify-center"
          >
            {days}d
          </div>
        ))}
      </div>
    ),
  },
];

export function SlideFeaturePreview({ onNext, onBack }: SlideFeaturePreviewProps) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-6 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="09" position="top-right" variant="rose" size="sm" />

      {/* AI-generated image */}
      <img
        src="/images/onboarding/features.png"
        alt="Dashboard dissolving into organic nature elements"
        className="w-24 h-24 object-cover rounded-2xl shadow-lg mb-4 z-10"
      />

      {/* Headline */}
      <h2 className="text-xl sm:text-2xl font-bold mb-2 z-10">
        What <UnderlineAccent>Awaits</UnderlineAccent> You
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm z-10">
        Here's a preview of your cognitive journaling experience
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8 z-10">
        {features.map((feature, idx) => (
          <div
            key={feature.title}
            className={cn(
              "p-4 rounded-xl border border-border/50 bg-muted/20 text-left",
              "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <feature.icon className="w-4 h-4 text-primary" />
            </div>

            {/* Title */}
            <p className="font-medium text-sm mb-1">{feature.title}</p>

            {/* Description */}
            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              {feature.description}
            </p>

            {/* Preview */}
            <div className="min-h-[32px] flex items-center">
              {feature.preview}
            </div>
          </div>
        ))}
      </div>

      {/* Almost done indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 py-2 px-4 rounded-full bg-muted/50 z-10">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>Just one more step!</span>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 w-full max-w-xs z-10">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="flex-1 group"
        >
          Almost there
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
