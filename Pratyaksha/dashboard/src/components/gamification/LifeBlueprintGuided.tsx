// Life Blueprint Guided - Deep reflection questionnaire
import { useState, useEffect, useRef } from "react";
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  Check,
  Lightbulb,
  Target,
  AlertTriangle,
  Clock,
  Sparkles,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  LIFE_CATEGORIES,
  TIME_HORIZONS,
  OPENING_QUESTIONS,
  FEAR_QUESTIONS,
  type ReflectionQuestion,
} from "../../lib/lifeBlueprintQuestions";
import {
  loadLifeBlueprint,
  saveLifeBlueprint,
  saveQuestionResponse,
  getQuestionResponse,
  markSectionCompleted,
  isSectionCompleted,
  type LifeBlueprint,
} from "../../lib/lifeBlueprintStorage";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface LifeBlueprintGuidedProps {
  className?: string;
  onComplete?: () => void;
}

type Section =
  | { type: "opening" }
  | { type: "category"; categoryId: string }
  | { type: "fears" }
  | { type: "timeHorizon"; horizonId: string }
  | { type: "summary" };

const SECTION_ORDER: Section[] = [
  { type: "opening" },
  ...LIFE_CATEGORIES.map(c => ({ type: "category" as const, categoryId: c.id })),
  { type: "fears" },
  ...TIME_HORIZONS.map(h => ({ type: "timeHorizon" as const, horizonId: h.id })),
  { type: "summary" },
];

// Sections without the summary (index 0-12)
const ACTIVE_SECTIONS = SECTION_ORDER.slice(0, -1);

// Group definitions for the card grid
const SECTION_GROUPS = [
  {
    label: "Foundation",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    indices: [0, 7], // opening, fears
  },
  {
    label: "Life Areas",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    indices: [1, 2, 3, 4, 5, 6], // career, health, relationships, finance, growth, lifestyle
  },
  {
    label: "Time Horizons",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    indices: [8, 9, 10, 11, 12], // 6m, 1y, 3y, 5y, 10y
  },
];

export function LifeBlueprintGuided({ className }: LifeBlueprintGuidedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blueprint, setBlueprint] = useState<LifeBlueprint>(() => loadLifeBlueprint());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  // null = show the card grid, number = show questionnaire for that section
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);

  const currentSection = SECTION_ORDER[currentSectionIndex];

  // Scroll into view when expanded or section changes
  useEffect(() => {
    if (isExpanded && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [isExpanded, currentSectionIndex, currentQuestionIndex]);

  // Save blueprint changes
  useEffect(() => {
    saveLifeBlueprint(blueprint);
  }, [blueprint]);

  // Get current questions based on section
  const getCurrentQuestions = (): ReflectionQuestion[] => {
    switch (currentSection.type) {
      case "opening":
        return OPENING_QUESTIONS;
      case "category": {
        const cat = LIFE_CATEGORIES.find(c => c.id === currentSection.categoryId);
        if (!cat) return [];
        return [...cat.visionQuestions, ...cat.antiVisionQuestions, ...cat.leverQuestions];
      }
      case "fears":
        return FEAR_QUESTIONS;
      case "timeHorizon": {
        const horizon = TIME_HORIZONS.find(h => h.id === currentSection.horizonId);
        return horizon?.questions || [];
      }
      default:
        return [];
    }
  };

  const questions = getCurrentQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  // Load existing answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existing = getQuestionResponse(blueprint, currentQuestion.id);
      setAnswer(existing || "");
    }
  }, [currentQuestion?.id, blueprint]);

  const handleSaveAnswer = () => {
    if (!currentQuestion || !answer.trim()) return;
    setBlueprint(prev => saveQuestionResponse(prev, currentQuestion.id, answer.trim()));
  };

  const handleNext = () => {
    handleSaveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const sectionId = getSectionId(currentSection);
      setBlueprint(prev => markSectionCompleted(prev, sectionId));
      // Return to grid after completing a section
      setActiveSectionIndex(null);
    }
  };

  const handlePrevious = () => {
    handleSaveAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // Back to grid
      setActiveSectionIndex(null);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setActiveSectionIndex(null);
    }
  };

  const jumpToSection = (index: number) => {
    handleSaveAnswer();
    setCurrentSectionIndex(index);
    setCurrentQuestionIndex(0);
    setActiveSectionIndex(index);
  };

  // Compact collapsed view
  if (!isExpanded) {
    const completedCount = blueprint.completedSections.length;
    const totalSections = ACTIVE_SECTIONS.length;
    const answeredCount = blueprint.responses.length;

    return (
      <div ref={containerRef} className={cn("rounded-xl glass-card overflow-hidden", className)}>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-6 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <Compass className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="font-semibold">Life Blueprint</h2>
                <p className="text-sm text-muted-foreground">
                  {answeredCount === 0
                    ? "Define your vision, fears, and goals through guided reflection"
                    : `${answeredCount} reflections · ${completedCount}/${totalSections} sections`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {answeredCount > 0 && (
                <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${(completedCount / totalSections) * 100}%` }}
                  />
                </div>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ── Questionnaire view (section selected) ──
  if (activeSectionIndex !== null) {
    return (
      <div ref={containerRef} className={cn("rounded-xl glass-card", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { handleSaveAnswer(); setActiveSectionIndex(null); }}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Back to all sections"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <SectionIcon section={currentSection} />
            <div>
              <h2 className="font-semibold">{getSectionTitle(currentSection)}</h2>
              <p className="text-xs text-muted-foreground">{getSectionSubtitle(currentSection)}</p>
            </div>
          </div>
          <button
            onClick={() => { handleSaveAnswer(); setIsExpanded(false); setActiveSectionIndex(null); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="p-6">
            <QuestionCard
              question={currentQuestion}
              answer={answer}
              onAnswerChange={setAnswer}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentQuestionIndex === 0 ? "All Sections" : "Back"}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip
            </Button>
            <Button size="sm" onClick={handleNext} disabled={!answer.trim()}>
              {currentQuestionIndex === questions.length - 1 ? "Done" : "Continue"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Card grid view (default expanded view) ──
  const completedCount = blueprint.completedSections.length;
  const totalSections = ACTIVE_SECTIONS.length;

  return (
    <div ref={containerRef} className={cn("rounded-xl glass-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Compass className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="font-semibold">Life Blueprint</h2>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{totalSections} sections completed
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${(completedCount / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Section groups */}
      <div className="p-4 space-y-4">
        {SECTION_GROUPS.map(group => (
          <div key={group.label} className="space-y-2">
            {/* Group label */}
            <div className={cn("px-2 py-1 rounded-md inline-flex items-center gap-1.5", group.bgColor)}>
              <span className={cn("text-xs font-semibold", group.color)}>{group.label}</span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {group.indices.map(sectionIdx => {
                const section = ACTIVE_SECTIONS[sectionIdx];
                const sectionId = getSectionId(section);
                const isCompleted = isSectionCompleted(blueprint, sectionId);
                const sectionQuestions = getQuestionsForSection(section);
                const answeredCount = sectionQuestions.filter(q =>
                  getQuestionResponse(blueprint, q.id)
                ).length;
                const hasStarted = answeredCount > 0;

                return (
                  <button
                    key={sectionIdx}
                    onClick={() => jumpToSection(sectionIdx)}
                    className={cn(
                      "group flex flex-col gap-2 p-3 rounded-lg border text-left transition-all",
                      isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                        : hasStarted
                        ? "border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10"
                        : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <SectionIcon section={section} />
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : hasStarted ? (
                        <span className="text-[10px] font-medium text-indigo-400">
                          {answeredCount}/{sectionQuestions.length}
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "text-xs font-medium leading-tight",
                        isCompleted ? "text-emerald-600 dark:text-emerald-400" : ""
                      )}>
                        {getSectionTitle(section)}
                      </p>
                      {!isCompleted && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {sectionQuestions.length} questions
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          Tap any section to start or continue · Complete at your own pace
        </p>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function QuestionCard({
  question,
  answer,
  onAnswerChange
}: {
  question: ReflectionQuestion;
  answer: string;
  onAnswerChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Main question */}
      <h3 className="text-lg font-medium leading-relaxed">
        {question.question}
      </h3>

      {/* Follow-up probe */}
      {question.followUp && (
        <p className="text-sm text-muted-foreground italic flex items-start gap-2">
          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
          {question.followUp}
        </p>
      )}

      {/* Examples */}
      {question.examples && question.examples.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {question.examples.map((example, i) => (
            <button
              key={i}
              onClick={() => onAnswerChange(example)}
              className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {/* Answer textarea */}
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder={question.placeholder || "Take your time to reflect..."}
        className={cn(
          "w-full min-h-[150px] p-4 rounded-lg border bg-background",
          "resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          "placeholder:text-muted-foreground/50"
        )}
        autoFocus
      />

      {/* Character count */}
      <div className="flex justify-end">
        <span className={cn(
          "text-xs",
          answer.length > 0 ? "text-muted-foreground" : "text-muted-foreground/50"
        )}>
          {answer.length} characters
        </span>
      </div>
    </div>
  );
}

function SectionIcon({ section }: { section: Section }) {
  const iconClass = "h-5 w-5";

  switch (section.type) {
    case "opening":
      return <Sparkles className={cn(iconClass, "text-indigo-500")} />;
    case "fears":
      return <AlertTriangle className={cn(iconClass, "text-rose-500")} />;
    case "timeHorizon":
      return <Clock className={cn(iconClass, "text-amber-500")} />;
    case "category": {
      const cat = LIFE_CATEGORIES.find(c => c.id === section.categoryId);
      return <Target className={cn(iconClass, `text-${cat?.color || "blue"}-500`)} />;
    }
    default:
      return <Compass className={cn(iconClass, "text-indigo-500")} />;
  }
}

// ==================== HELPERS ====================

function getSectionId(section: Section): string {
  switch (section.type) {
    case "opening": return "opening";
    case "fears": return "fears";
    case "summary": return "summary";
    case "category": return `category-${section.categoryId}`;
    case "timeHorizon": return `horizon-${section.horizonId}`;
  }
}

function getSectionTitle(section: Section): string {
  switch (section.type) {
    case "opening": return "Opening Reflection";
    case "fears": return "Fears & Anti-Vision";
    case "summary": return "Summary";
    case "category": {
      const cat = LIFE_CATEGORIES.find(c => c.id === section.categoryId);
      return cat?.name || "Category";
    }
    case "timeHorizon": {
      const horizon = TIME_HORIZONS.find(h => h.id === section.horizonId);
      return horizon?.label || "Time Horizon";
    }
  }
}

function getSectionSubtitle(section: Section): string {
  switch (section.type) {
    case "opening": return "Big picture thinking";
    case "fears": return "What you want to avoid";
    case "summary": return "Review your blueprint";
    case "category": {
      const cat = LIFE_CATEGORIES.find(c => c.id === section.categoryId);
      return cat?.description || "";
    }
    case "timeHorizon": {
      const horizon = TIME_HORIZONS.find(h => h.id === section.horizonId);
      return horizon?.description || "";
    }
  }
}

function getQuestionsForSection(section: Section): ReflectionQuestion[] {
  switch (section.type) {
    case "opening":
      return OPENING_QUESTIONS;
    case "fears":
      return FEAR_QUESTIONS;
    case "category": {
      const cat = LIFE_CATEGORIES.find(c => c.id === section.categoryId);
      if (!cat) return [];
      return [...cat.visionQuestions, ...cat.antiVisionQuestions, ...cat.leverQuestions];
    }
    case "timeHorizon": {
      const horizon = TIME_HORIZONS.find(h => h.id === section.horizonId);
      return horizon?.questions || [];
    }
    default:
      return [];
  }
}
