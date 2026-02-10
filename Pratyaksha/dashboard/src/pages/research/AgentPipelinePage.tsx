import { Link } from 'react-router-dom'
import {
  Target,
  Heart,
  Tags,
  Lightbulb,
  Scissors,
  Sun,
  Calendar,
  TrendingUp,
  ArrowRight,
  ArrowDown,
  Bot,
  Sparkles,
  Zap
} from 'lucide-react'
import { ResearchLayout } from './ResearchLayout'
import { AgentCard } from '../../components/research/AgentCard'
import { cn } from '../../lib/utils'

const agents = [
  {
    name: "Intent Agent",
    icon: Target,
    color: "bg-gradient-to-br from-teal-500 to-cyan-500",
    tagline: "Classifies entry type, generates name & snapshot",
    what: "Analyzes the raw journal text to determine its type (Emotional, Cognitive, Work, etc.) and creates a concise name and snapshot summary.",
    why: "Proper classification enables downstream agents to process with context. The snapshot provides a quick reference without re-reading.",
    how: "Uses GPT-4o-mini to extract intent signals, detect topic patterns, and generate a 3-5 word title plus one-sentence snapshot.",
    inputExample: "I had a really frustrating meeting at work today. My manager dismissed all my ideas...",
    outputExample: "Type: Work\nName: Dismissed in Meeting\nSnapshot: Frustration over manager dismissing ideas",
    order: 1
  },
  {
    name: "Emotion Agent",
    icon: Heart,
    color: "bg-gradient-to-br from-rose-500 to-pink-500",
    tagline: "Analyzes mode, energy level, energy shape, sentiment",
    what: "Detects the psychological state, energy patterns, and overall sentiment from the entry text.",
    why: "Understanding emotional states enables pattern tracking over time and correlating moods with life events.",
    how: "Maps text to 15 psychological modes (Hopeful, Anxious, etc.), 10 energy levels, 12 energy shapes, and 3 sentiments.",
    inputExample: "I had a really frustrating meeting at work today...",
    outputExample: "Mode: Agitated\nEnergy: Drained\nShape: Collapsing\nSentiment: Negative",
    order: 2
  },
  {
    name: "Theme Agent",
    icon: Tags,
    color: "bg-gradient-to-br from-violet-500 to-purple-500",
    tagline: "Extracts theme tags, contradictions, and cognitive loops",
    what: "Identifies recurring themes, internal conflicts, and thought patterns that may be limiting growth.",
    why: "Themes reveal what matters to you. Contradictions show where you're stuck. Loops identify unhelpful patterns.",
    how: "Extracts 3-5 theme tags, maps to 12 core contradictions, and detects circular thinking patterns.",
    inputExample: "I know I should speak up but I'm afraid of being judged...",
    outputExample: "Themes: self-advocacy, workplace, confidence\nContradiction: Action vs. Fear\nLoops: Anticipating rejection before action",
    order: 3
  },
  {
    name: "Insight Agent",
    icon: Lightbulb,
    color: "bg-gradient-to-br from-amber-500 to-orange-500",
    tagline: "Generates summary, actionable insights, next action",
    what: "Synthesizes all prior agent outputs into a coherent summary with practical next steps.",
    why: "Turns reflection into action. Ensures every entry ends with something concrete to try.",
    how: "Combines intent, emotion, and theme analysis to generate personalized, actionable guidance.",
    inputExample: "[Full processing context from agents 1-3]",
    outputExample: "Summary: Feeling dismissed at work is triggering self-doubt.\nInsight: Your ideas have value; silence equals agreement.\nNext Action: Write one key point before your next meeting.",
    order: 4
  },
  {
    name: "Decomposition Agent",
    icon: Scissors,
    color: "bg-gradient-to-br from-cyan-500 to-blue-500",
    tagline: "Breaks complex entries into atomic thoughts",
    what: "Detects when a single entry contains multiple distinct events and splits them for separate processing.",
    why: "End-of-day entries often bundle many moments. Decomposition enables accurate per-event analysis.",
    how: "Analyzes entry structure, detects time markers and topic shifts, extracts individual events.",
    inputExample: "Today I had coffee with Sarah (great!), then a stressful meeting, followed by a peaceful evening walk.",
    outputExample: "Event 1: Coffee with Sarah (Social, Positive)\nEvent 2: Stressful meeting (Work, Negative)\nEvent 3: Evening walk (Health, Positive)",
    order: 5
  },
  {
    name: "Daily Agent",
    icon: Sun,
    color: "bg-gradient-to-br from-yellow-500 to-amber-500",
    tagline: "Synthesizes daily patterns and recommendations",
    what: "Aggregates all entries from a single day to identify patterns, dominant moods, and key takeaways.",
    why: "Individual entries miss the forest for the trees. Daily synthesis reveals how your day actually went.",
    how: "Analyzes all entries for a date, generates narrative, mood summary, energy pattern, and evening reflection.",
    inputExample: "[All 4 entries from 2025-01-15]",
    outputExample: "Narrative: A day of contrasts...\nMood: Started anxious, ended calm\nKey Takeaway: Small wins compound",
    order: 6
  },
  {
    name: "Weekly Agent",
    icon: Calendar,
    color: "bg-gradient-to-br from-green-500 to-emerald-500",
    tagline: "Identifies weekly trends and recurring themes",
    what: "Analyzes a full week of entries to find patterns, mood trends, and recurring themes.",
    why: "Weekly perspective reveals patterns invisible day-to-day: trigger days, recovery patterns, theme clusters.",
    how: "Processes 7 days of data, calculates sentiment ratios, identifies top themes and contradictions.",
    inputExample: "[28 entries from week of Jan 13-19]",
    outputExample: "Trend: Improving\nDominant Mode: Reflective\nTop Theme: work-life balance\nFocus: Protect morning routines",
    order: 7
  },
  {
    name: "Monthly Agent",
    icon: TrendingUp,
    color: "bg-gradient-to-br from-indigo-500 to-violet-500",
    tagline: "Long-term pattern analysis and growth tracking",
    what: "Analyzes a month of entries to track progress, identify growth areas, and set intentions.",
    why: "Monthly perspective shows transformation over time. Are you actually becoming who you want to be?",
    how: "Aggregates weekly summaries, tracks mood trends, measures theme evolution, generates growth report.",
    inputExample: "[4 weekly summaries from January 2025]",
    outputExample: "Growth: Confidence +15%\nChallenge: Work boundaries\nWin: Morning routine consistency\nFocus: Address recurring 'Control vs. Surrender' tension",
    order: 8
  }
]

export function AgentPipelinePage() {
  return (
    <ResearchLayout>
      <div className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-96 right-0 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-violet text-sm font-medium mb-8">
              <Bot className="w-4 h-4 text-violet-500" />
              AI Architecture
            </div>
            <h1 className="font-space text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              The 8-Agent <span className="brand-gradient">Pipeline</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every journal entry flows through a sophisticated multi-agent AI system.
              Each agent specializes in one aspect of analysis, working together to extract meaning.
            </p>
          </div>

          {/* Pipeline Flow Diagram */}
          <section className="mb-16">
            <div className="glass-feature-card p-6 sm:p-8 lg:p-10">
              <h2 className="font-space text-xl font-semibold mb-2 text-center">Processing Flow</h2>
              <p className="text-sm text-muted-foreground text-center mb-8">How your journal entry transforms into insights</p>

              {/* Input */}
              <div className="flex justify-center mb-6">
                <div className="px-6 py-3 rounded-full glass-light border border-border text-sm font-medium">
                  Journal Entry
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-gradient-to-b from-border to-teal-500/50" />
              </div>

              {/* Stage 1: Per-Entry Processing */}
              <div className="relative mb-8">
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-teal-500 to-amber-500 hidden sm:block" />

                <div className="sm:pl-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-teal text-xs font-semibold uppercase tracking-wider mb-4">
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    Per-Entry Processing
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {agents.slice(0, 4).map((agent, i) => (
                      <div key={agent.name} className="relative">
                        <div className="flex flex-col items-center p-4 rounded-xl glass-light border border-border/50 hover:border-teal-500/30 transition-colors">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg",
                            agent.color
                          )}>
                            <agent.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-center">{agent.name.replace(' Agent', '')}</span>
                          <span className="text-[10px] text-muted-foreground text-center mt-1 line-clamp-2">{agent.tagline.split(',')[0]}</span>
                        </div>
                        {/* Arrow to next */}
                        {i < 3 && (
                          <div className="absolute top-1/2 -right-2 sm:-right-3 transform -translate-y-1/2 z-10 hidden sm:block">
                            <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gradient-to-b from-amber-500/50 to-cyan-500/50" />
                  <ArrowDown className="w-5 h-5 text-cyan-500/70" />
                </div>
              </div>

              {/* Stage 2: Decomposition */}
              <div className="relative mb-8">
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-cyan-500 hidden sm:block" />

                <div className="sm:pl-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    Optional Decomposition
                  </div>

                  <div className="flex justify-center sm:justify-start">
                    <div className="flex items-center gap-4 p-4 rounded-xl glass-light border border-cyan-500/20 max-w-sm">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0", agents[4].color)}>
                        <Scissors className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold block">Decomposition</span>
                        <span className="text-xs text-muted-foreground">Splits multi-event entries into atomic thoughts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gradient-to-b from-cyan-500/50 to-green-500/50" />
                  <ArrowDown className="w-5 h-5 text-green-500/70" />
                </div>
              </div>

              {/* Stage 3: Time-Based Aggregation */}
              <div className="relative mb-8">
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-yellow-500 via-green-500 to-indigo-500 hidden sm:block" />

                <div className="sm:pl-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    Time-Based Aggregation
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
                    {agents.slice(5).map((agent, i) => (
                      <div key={agent.name} className="relative">
                        <div className="flex flex-col items-center p-4 rounded-xl glass-light border border-border/50 hover:border-green-500/30 transition-colors">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg",
                            agent.color
                          )}>
                            <agent.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-center">{agent.name.replace(' Agent', '')}</span>
                          <span className="text-[10px] text-muted-foreground text-center mt-1">{['1 day', '7 days', '30 days'][i]}</span>
                        </div>
                        {i < 2 && (
                          <div className="absolute top-1/2 -right-2 sm:-right-3 transform -translate-y-1/2 z-10 hidden sm:block">
                            <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gradient-to-b from-indigo-500/50 to-violet-500/50" />
                  <ArrowDown className="w-5 h-5 text-violet-500/70" />
                </div>
              </div>

              {/* Output */}
              <div className="flex justify-center">
                <div className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-violet-500/25">
                  Patterns, Insights & Growth Tracking
                </div>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Agents", value: "8", icon: Bot },
                { label: "Entry Types", value: "15", icon: Target },
                { label: "Mood States", value: "15", icon: Heart },
                { label: "Contradictions", value: "12", icon: Zap },
              ].map((stat) => (
                <div key={stat.label} className="glass-feature-card p-4 text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-teal-500" />
                  <div className="font-space text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Agent Cards */}
          <section className="mb-16">
            <h2 className="font-space text-2xl font-bold mb-8 tracking-tight">
              Agent Deep Dives
            </h2>
            <p className="text-muted-foreground mb-8">
              Click on any agent to see detailed documentation including what it does, why it exists, how it works, and example input/output.
            </p>
            <div className="space-y-4">
              {agents.map((agent) => (
                <AgentCard key={agent.name} {...agent} />
              ))}
            </div>
          </section>

          {/* Technical Details */}
          <section className="mb-16">
            <h2 className="font-space text-2xl font-bold mb-8 tracking-tight">
              Technical Implementation
            </h2>
            <div className="glass-feature-card p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-space font-semibold mb-3">Models Used</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      GPT-4o-mini for fast classification (Agents 1-5)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      GPT-4o for complex synthesis (Agents 6-8)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-space font-semibold mb-3">Processing Time</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Single entry: 2-4 seconds
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Daily summary: 3-5 seconds
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Weekly summary: 5-8 seconds
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="font-space font-semibold mb-3">Data Types</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Emotional", "Cognitive", "Family", "Work", "Relationship",
                    "Health", "Creativity", "Social", "Reflection", "Decision"
                  ].map((type) => (
                    <span key={type} className="px-2 py-1 text-xs rounded-full glass-teal">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="glass-feature-card p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-violet-500" />
                <h2 className="font-space text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
                  See the Pipeline in Action
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Write a journal entry and watch as 8 specialized AI agents work together
                  to understand your thoughts, detect patterns, and generate insights.
                </p>
                <Link
                  to="/logs"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:scale-105 hover:shadow-xl hover:shadow-violet-500/25 transition-all"
                >
                  Try It Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </ResearchLayout>
  )
}

export default AgentPipelinePage
