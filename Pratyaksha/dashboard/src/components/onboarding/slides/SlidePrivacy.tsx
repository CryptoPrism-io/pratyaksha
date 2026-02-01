import { Lock, Trash2, Heart, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BackgroundNumber, BrushUnderline } from "@/components/typography";

interface SlidePrivacyProps {
  onNext: () => void;
  onBack: () => void;
}

export function SlidePrivacy({ onNext, onBack }: SlidePrivacyProps) {
  const promises = [
    {
      icon: Lock,
      text: "Your entries are never shared or sold",
      detail: "End-to-end privacy",
    },
    {
      icon: Trash2,
      text: "Export or delete anytime",
      detail: "You own your data",
    },
    {
      icon: Heart,
      text: "No judgment—just understanding",
      detail: "AI provides insights, not opinions",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center px-4 py-6 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="05" position="top-right" variant="rose" size="sm" />

      {/* AI-generated privacy image */}
      <div className="mb-6 z-10">
        <img
          src="/images/onboarding/privacy.png"
          alt="Protected glowing moth under glass dome"
          className="w-28 h-28 object-cover rounded-2xl shadow-lg mx-auto"
        />
      </div>

      {/* Headline */}
      <h2 className="text-xl sm:text-2xl font-bold mb-2 z-10">
        Your Thoughts Are <BrushUnderline variant="teal">Sacred</BrushUnderline>
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm z-10">
        We built Becoming with your privacy at the core
      </p>

      {/* Privacy promises */}
      <div className="space-y-4 mb-8 w-full max-w-sm z-10">
        {promises.map((promise, idx) => (
          <div
            key={promise.text}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-left",
              "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{ animationDelay: `${200 + idx * 100}ms` }}
          >
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <promise.icon className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{promise.text}</p>
              <p className="text-xs text-muted-foreground">{promise.detail}</p>
            </div>
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 py-2 px-4 rounded-full bg-muted/50 z-10">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span>Your safe space for self-discovery</span>
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
          I understand
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
