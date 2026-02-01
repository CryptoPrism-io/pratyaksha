import { Sparkles, ArrowRight } from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BackgroundNumber, BrushUnderline, StaggerText } from "@/components/typography";

interface SlideWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export function SlideWelcome({ onNext, onSkip }: SlideWelcomeProps) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="01" position="top-right" variant="teal" size="sm" />

      {/* AI-generated welcome image */}
      <div className="relative mb-6 z-10">
        <img
          src="/images/onboarding/welcome.png"
          alt="Moth emerging from cocoon at dawn"
          className="w-32 h-32 object-cover rounded-2xl shadow-lg"
        />
        {/* Floating sparkles */}
        <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-400 animate-bounce" />
        <Sparkles className="absolute -bottom-1 -left-3 w-4 h-4 text-teal-500/60 animate-bounce delay-150" />
      </div>

      {/* Headline */}
      <h1 className="mb-3 flex flex-col items-center gap-1 z-10">
        <span className="text-lg text-muted-foreground font-light tracking-wider">Welcome to</span>
        <BrandWordmark size="2xl" variant="default" animated />
      </h1>

      {/* Tagline with stagger animation */}
      <p className="text-base text-muted-foreground font-light mb-6 tracking-wide z-10">
        Your journey of <BrushUnderline variant="gradient">transformation</BrushUnderline> begins here
      </p>

      {/* Philosophy */}
      <div className="max-w-md mb-8 space-y-4 z-10">
        <p className="text-muted-foreground text-base leading-relaxed font-light">
          Your mind is a vast landscape of thoughts, emotions, and patterns.
          <span className="font-space font-medium text-foreground/80"> Becoming </span>
          helps you see them clearly.
        </p>
        <div className={cn(
          "flex items-center justify-center gap-2 text-sm text-muted-foreground/80",
          "py-2 px-4 rounded-full bg-muted/50 mx-auto w-fit"
        )}>
          <span className="inline-flex w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Takes about 2 minutes</span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs z-10">
        <Button
          onClick={onNext}
          size="lg"
          className="w-full group"
        >
          Let's Begin
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
