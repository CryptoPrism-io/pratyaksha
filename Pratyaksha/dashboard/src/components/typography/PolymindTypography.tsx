import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// =====================================================
// POLYMIND TYPOGRAPHY COMPONENTS
// Giant numbers, brush underlines, stagger animations
// =====================================================

interface BackgroundNumberProps {
  number: string | number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  variant?: "teal" | "rose" | "amber" | "default";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Giant semi-transparent background number for visual impact
 */
export function BackgroundNumber({
  number,
  position = "top-right",
  variant = "default",
  size = "md",
  className,
}: BackgroundNumberProps) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  const variantClasses = {
    default: "bg-number",
    teal: "bg-number bg-number-teal",
    rose: "bg-number bg-number-rose",
    amber: "bg-number bg-number-amber",
  };

  const sizeClasses = {
    sm: "bg-number-sm",
    md: "bg-number-md",
    lg: "bg-number-lg",
    xl: "bg-number-xl",
  };

  return (
    <span
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        positionClasses[position],
        className
      )}
      aria-hidden="true"
    >
      {number}
    </span>
  );
}

interface TextHighlightProps {
  children: React.ReactNode;
  variant?: "teal" | "rose" | "amber" | "gradient";
  className?: string;
}

/**
 * Text with marker pen highlight effect
 */
export function TextHighlight({
  children,
  variant = "teal",
  className,
}: TextHighlightProps) {
  const variantClasses = {
    teal: "text-highlight",
    rose: "text-highlight text-highlight-rose",
    amber: "text-highlight text-highlight-amber",
    gradient: "text-highlight text-highlight-gradient",
  };

  return (
    <span className={cn(variantClasses[variant], className)}>{children}</span>
  );
}

// Alias for backwards compatibility
export const BrushUnderline = TextHighlight;

interface StaggerTextProps {
  text: string;
  delay?: number; // Base delay in ms
  staggerDelay?: number; // Delay between each letter in ms
  className?: string;
  letterClassName?: string;
  triggerOnView?: boolean;
}

/**
 * Letter-by-letter stagger animation text
 */
export function StaggerText({
  text,
  delay = 0,
  staggerDelay = 30,
  className,
  letterClassName,
  triggerOnView = true,
}: StaggerTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(!triggerOnView);

  useEffect(() => {
    if (!triggerOnView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnView]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={cn(
            isVisible ? "stagger-letter" : "opacity-0",
            letterClassName
          )}
          style={{
            animationDelay: isVisible ? `${delay + index * staggerDelay}ms` : "0ms",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

interface StrikeThroughTransformProps {
  oldText: string;
  newText: string;
  separator?: string;
  className?: string;
  animate?: boolean;
}

/**
 * "Stop X. Start Y." strikethrough transformation pattern
 */
export function StrikeThroughTransform({
  oldText,
  newText,
  separator = " ",
  className,
  animate = true,
}: StrikeThroughTransformProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span className={cn("strike-old", animate && "strike-animate")}>
        {oldText}
      </span>
      <span>{separator}</span>
      <span className="strike-new">{newText}</span>
    </span>
  );
}

interface VerticalTextProps {
  children: React.ReactNode;
  upright?: boolean;
  className?: string;
}

/**
 * Japanese-inspired vertical text accent
 */
export function VerticalText({
  children,
  upright = false,
  className,
}: VerticalTextProps) {
  return (
    <span
      className={cn(
        upright ? "text-vertical-upright" : "text-vertical",
        "text-xs font-medium tracking-widest text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

interface WeightContrastProps {
  lightText: string;
  boldText: string;
  separator?: string;
  className?: string;
}

/**
 * Light + bold weight contrast in same headline
 */
export function WeightContrast({
  lightText,
  boldText,
  separator = " ",
  className,
}: WeightContrastProps) {
  return (
    <span className={className}>
      <span className="weight-light">{lightText}</span>
      {separator}
      <span className="weight-bold">{boldText}</span>
    </span>
  );
}

interface DotSeparatorProps {
  items: string[];
  className?: string;
  itemClassName?: string;
}

/**
 * Elegant dot-separated phrase list
 */
export function DotSeparator({
  items,
  className,
  itemClassName,
}: DotSeparatorProps) {
  return (
    <span className={cn("inline-flex items-center flex-wrap", className)}>
      {items.map((item, index) => (
        <span key={index} className={cn(index > 0 && "dot-separator", itemClassName)}>
          {item}
        </span>
      ))}
    </span>
  );
}

interface UnderlineAccentProps {
  children: React.ReactNode;
  variant?: "gradient" | "teal" | "rose";
  className?: string;
}

/**
 * Text with centered underline accent below
 */
export function UnderlineAccent({
  children,
  variant = "gradient",
  className,
}: UnderlineAccentProps) {
  const variantClasses = {
    gradient: "underline-accent",
    teal: "underline-accent underline-accent-teal",
    rose: "underline-accent underline-accent-rose",
  };

  return (
    <span className={cn(variantClasses[variant], className)}>{children}</span>
  );
}

interface NumberHighlightProps {
  number: string | number;
  variant?: "teal" | "rose" | "amber";
  label?: string;
  className?: string;
}

/**
 * Large highlighted number with optional label
 */
export function NumberHighlight({
  number,
  variant = "teal",
  label,
  className,
}: NumberHighlightProps) {
  const variantClasses = {
    teal: "number-highlight",
    rose: "number-highlight number-highlight-rose",
    amber: "number-highlight number-highlight-amber",
  };

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <span className={variantClasses[variant]}>{number}</span>
      {label && (
        <span className="text-sm text-muted-foreground mt-1">{label}</span>
      )}
    </div>
  );
}

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Content that reveals with animation when scrolled into view
 */
export function RevealOnScroll({
  children,
  delay = 0,
  className,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(isVisible ? "reveal-up" : "opacity-0", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
