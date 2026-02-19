import { useState, useMemo } from "react"
import { Baby, Smile, Heart, Flame, Users, User, Moon, CloudRain, Target, Sparkles, X, ArrowRight, Pencil } from "lucide-react"
import { cn } from "../../lib/utils"
import { useKarma } from "../../contexts/KarmaContext"
import { loadLifeBlueprint } from "../../lib/lifeBlueprintStorage"

interface DiveItem {
  id: string
  type: "soul-mapping" | "goal"
  label: string
  badge: string
  prompt: string
  icon: React.ReactNode
  color: string
  bgColor: string
  tier?: "surface" | "deep" | "core"
}

// Minimal soul mapping topic data (mirrors PROFILE_CATEGORIES in GuidedEntryForm)
const SOUL_TOPICS: Omit<DiveItem, "type" | "badge">[] = [
  { id: "childhood",       label: "Childhood Memories",  prompt: "What's your earliest happy memory?",                   icon: <Baby className="h-5 w-5" />,       color: "text-sky-400",     bgColor: "bg-sky-500/10",     tier: "surface" },
  { id: "joys",            label: "Peak Joys",            prompt: "The happiest day of your life...",                     icon: <Sparkles className="h-5 w-5" />,    color: "text-yellow-400",  bgColor: "bg-yellow-500/10",  tier: "surface" },
  { id: "friendships",     label: "Friendships",          prompt: "Who was your first best friend?",                      icon: <Smile className="h-5 w-5" />,       color: "text-pink-400",    bgColor: "bg-pink-500/10",    tier: "surface" },
  { id: "interests",       label: "Passions & Hobbies",   prompt: "What activity makes you lose track of time?",          icon: <Heart className="h-5 w-5" />,       color: "text-rose-400",    bgColor: "bg-rose-500/10",    tier: "surface" },
  { id: "parents",         label: "Parental Bond",        prompt: "How would you describe your mother?",                  icon: <Users className="h-5 w-5" />,       color: "text-orange-400",  bgColor: "bg-orange-500/10",  tier: "deep" },
  { id: "siblings",        label: "Siblings & Family",    prompt: "Describe your sibling relationships...",               icon: <Users className="h-5 w-5" />,       color: "text-teal-400",    bgColor: "bg-teal-500/10",    tier: "deep" },
  { id: "love",            label: "Love & Romance",       prompt: "Your first love — what was it like?",                  icon: <Heart className="h-5 w-5" />,       color: "text-red-400",     bgColor: "bg-red-500/10",     tier: "deep" },
  { id: "career",          label: "Work & Purpose",       prompt: "What work makes you feel meaningful?",                 icon: <Target className="h-5 w-5" />,      color: "text-emerald-400", bgColor: "bg-emerald-500/10", tier: "deep" },
  { id: "turning-points",  label: "Turning Points",       prompt: "A decision that altered your life path...",            icon: <Flame className="h-5 w-5" />,       color: "text-amber-400",   bgColor: "bg-amber-500/10",   tier: "deep" },
  { id: "body",            label: "Body & Health",        prompt: "How do you feel about your body?",                     icon: <User className="h-5 w-5" />,        color: "text-lime-400",    bgColor: "bg-lime-500/10",    tier: "deep" },
  { id: "wounds",          label: "Emotional Wounds",     prompt: "A pain you've carried for years...",                   icon: <Flame className="h-5 w-5" />,       color: "text-red-500",     bgColor: "bg-red-500/10",     tier: "core" },
  { id: "fears",           label: "Deepest Fears",        prompt: "What fear controls your decisions?",                   icon: <CloudRain className="h-5 w-5" />,   color: "text-slate-400",   bgColor: "bg-slate-500/10",   tier: "core" },
  { id: "regrets",         label: "Regrets & What-Ifs",   prompt: "Your biggest regret in life...",                       icon: <Moon className="h-5 w-5" />,        color: "text-indigo-400",  bgColor: "bg-indigo-500/10",  tier: "core" },
  { id: "shadow",          label: "Shadow Self",          prompt: "A part of yourself you're ashamed of...",              icon: <Moon className="h-5 w-5" />,        color: "text-zinc-400",    bgColor: "bg-zinc-500/10",    tier: "core" },
  { id: "identity",        label: "Core Identity",        prompt: "What values define you at your core?",                 icon: <User className="h-5 w-5" />,        color: "text-violet-400",  bgColor: "bg-violet-500/10",  tier: "core" },
  { id: "beliefs",         label: "Beliefs & Spirituality", prompt: "How has your spirituality evolved?",                 icon: <Sparkles className="h-5 w-5" />,    color: "text-purple-400",  bgColor: "bg-purple-500/10",  tier: "core" },
  { id: "mortality",       label: "Death & Legacy",       prompt: "What do you want your legacy to be?",                  icon: <Moon className="h-5 w-5" />,        color: "text-gray-400",    bgColor: "bg-gray-500/10",    tier: "core" },
]

const SKIP_KEY = "pratyaksha-daily-dive-skip"

function getTodaySkippedId(): string | null {
  try {
    const raw = localStorage.getItem(SKIP_KEY)
    if (!raw) return null
    const { date, id } = JSON.parse(raw)
    return date === new Date().toDateString() ? (id as string) : null
  } catch {
    return null
  }
}

interface DailyReflectionCardProps {
  onSelectItem: (prompt: string, soulMappingTopicId?: string) => void
}

export function DailyReflectionCard({ onSelectItem }: DailyReflectionCardProps) {
  const { isTierUnlocked, isTopicCompleted } = useKarma()
  const [skippedId, setSkippedId] = useState<string | null>(getTodaySkippedId)
  const blueprint = useMemo(() => loadLifeBlueprint(), [])

  const { todayItem, upcomingItems } = useMemo(() => {
    const items: DiveItem[] = []

    // 1. Uncompleted soul mapping topics (tier order: surface → deep → core)
    for (const topic of SOUL_TOPICS) {
      if (!isTierUnlocked(topic.tier!)) continue
      if (isTopicCompleted(topic.id)) continue
      items.push({ ...topic, type: "soul-mapping", badge: "Soul Mapping" })
    }

    // 2. Active short-term goals
    const activeGoals = blueprint?.shortTermGoals?.filter(g => !g.completed) ?? []
    for (const goal of activeGoals.slice(0, 3)) {
      const label = goal.text.length > 45 ? goal.text.slice(0, 45) + "…" : goal.text
      items.push({
        id: `goal-${goal.id}`,
        type: "goal",
        label,
        badge: "Goal Check",
        prompt: `Reflect on your goal: "${goal.text}"\n\nWhat's your current progress? What obstacles are you facing? What's your next step?`,
        icon: <Target className="h-5 w-5" />,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
      })
    }

    // 3. Near-term time horizon goals (6 months, 1 year)
    const nearGoals = blueprint?.timeHorizonGoals?.filter(
      g => !g.completed && (g.horizon === "6months" || g.horizon === "1year")
    ) ?? []
    for (const goal of nearGoals.slice(0, 2)) {
      const horizonLabel = goal.horizon === "6months" ? "6-Month Vision" : "1-Year Vision"
      const label = goal.text.length > 45 ? goal.text.slice(0, 45) + "…" : goal.text
      items.push({
        id: `vision-${goal.id}`,
        type: "goal",
        label,
        badge: horizonLabel,
        prompt: `Reflect on your ${horizonLabel.toLowerCase()}: "${goal.text}"\n\nHow close are you to making this a reality? What's holding you back?`,
        icon: <Sparkles className="h-5 w-5" />,
        color: "text-violet-400",
        bgColor: "bg-violet-500/10",
      })
    }

    if (items.length === 0) return { todayItem: null, upcomingItems: [] }

    // Today = first non-skipped item; skipped = shown next
    const nonSkipped = items.filter(i => i.id !== skippedId)
    const skipped = items.filter(i => i.id === skippedId)
    const ordered = [...nonSkipped, ...skipped]

    return {
      todayItem: ordered[0] ?? null,
      upcomingItems: ordered.slice(1, 4),
    }
  }, [isTierUnlocked, isTopicCompleted, blueprint, skippedId])

  if (!todayItem) return null

  const handleSkip = () => {
    localStorage.setItem(SKIP_KEY, JSON.stringify({ date: new Date().toDateString(), id: todayItem.id }))
    setSkippedId(todayItem.id)
  }

  const handleWrite = () => {
    onSelectItem(
      todayItem.prompt,
      todayItem.type === "soul-mapping" ? todayItem.id : undefined
    )
  }

  return (
    <div className="rounded-xl glass-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Today's Deep Dive</span>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Skip for today"
        >
          <span>Skip</span>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Featured item */}
      <div className={cn("p-4", todayItem.bgColor)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn("mt-0.5 shrink-0", todayItem.color)}>
              {todayItem.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn("text-xs font-medium", todayItem.color)}>{todayItem.badge}</span>
              </div>
              <p className="font-medium text-sm leading-snug">{todayItem.label}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {todayItem.prompt}
              </p>
            </div>
          </div>
          <button
            onClick={handleWrite}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              "bg-background/80 hover:bg-background border border-border/60 hover:border-border",
              "shadow-sm hover:shadow"
            )}
          >
            Write this
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Upcoming queue */}
      {upcomingItems.length > 0 && (
        <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground shrink-0">Coming up:</span>
          {upcomingItems.map((item) => (
            <span
              key={item.id}
              className={cn(
                "inline-flex items-center gap-1 text-xs text-muted-foreground",
                "rounded-full border border-border/40 px-2 py-0.5"
              )}
            >
              <span className={cn("flex [&_svg]:h-3 [&_svg]:w-3", item.color)}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
