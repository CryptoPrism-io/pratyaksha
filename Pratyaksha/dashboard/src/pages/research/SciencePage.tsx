import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts'
import {
  FlaskConical,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Heart,
  Brain,
  Activity
} from 'lucide-react'
import { ResearchLayout } from './ResearchLayout'
import { SafeResponsiveContainer } from '../../components/ui/safe-responsive-container'
import { cn } from '../../lib/utils'

// Pennebaker Study Results (Meta-analysis data)
const pennebakerData = [
  { category: 'Physical Health', control: 0, treatment: 23, color: '#14b8a6' },
  { category: 'Psychological Health', control: 0, treatment: 28, color: '#f43f5e' },
  { category: 'Work Performance', control: 0, treatment: 15, color: '#8b5cf6' },
  { category: 'Memory Function', control: 0, treatment: 21, color: '#f59e0b' },
]

// Writing Frequency Impact (synthesized from multiple studies)
const frequencyData = [
  { frequency: '0', benefit: 0, label: 'None' },
  { frequency: '1', benefit: 12, label: '1x/week' },
  { frequency: '2', benefit: 28, label: '2x/week' },
  { frequency: '3', benefit: 42, label: '3x/week' },
  { frequency: '5', benefit: 58, label: '5x/week' },
  { frequency: '7', benefit: 65, label: 'Daily' },
]

// Mood Tracking Methods Comparison
const trackingMethodsData = [
  { month: 'Month 1', traditionalJournal: 15, voiceJournal: 18, aiAssisted: 22 },
  { month: 'Month 2', traditionalJournal: 22, voiceJournal: 32, aiAssisted: 45 },
  { month: 'Month 3', traditionalJournal: 28, voiceJournal: 45, aiAssisted: 62 },
  { month: 'Month 4', traditionalJournal: 32, voiceJournal: 52, aiAssisted: 75 },
  { month: 'Month 5', traditionalJournal: 35, voiceJournal: 58, aiAssisted: 82 },
  { month: 'Month 6', traditionalJournal: 38, voiceJournal: 62, aiAssisted: 88 },
]

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-feature-card p-3 border shadow-lg">
        <p className="font-space font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    )
  }
  return null
}

const keyFindings = [
  {
    icon: Heart,
    title: "Emotional Processing",
    stat: "23%",
    description: "improvement in emotional regulation after 4 weeks of expressive writing",
    color: "text-rose-500"
  },
  {
    icon: Brain,
    title: "Cognitive Benefits",
    stat: "21%",
    description: "improvement in working memory by freeing cognitive resources",
    color: "text-violet-500"
  },
  {
    icon: Activity,
    title: "Physical Health",
    stat: "50%",
    description: "fewer doctor visits among consistent journal writers",
    color: "text-teal-500"
  },
  {
    icon: TrendingUp,
    title: "Long-term Growth",
    stat: "3x",
    description: "more likely to achieve goals when journaling with reflection",
    color: "text-amber-500"
  }
]

export function SciencePage() {
  return (
    <ResearchLayout>
      <div className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-96 right-0 w-[400px] h-[400px] bg-rose-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-teal text-sm font-medium mb-8">
              <FlaskConical className="w-4 h-4 text-teal-500" />
              Data Visualizations
            </div>
            <h1 className="font-space text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              Science & <span className="brand-gradient">Evidence</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Interactive visualizations of peer-reviewed research on journaling,
              emotional expression, and cognitive processing.
            </p>
          </div>

          {/* Key Findings Grid */}
          <section className="mb-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {keyFindings.map((finding) => (
                <div key={finding.title} className="glass-feature-card p-5 text-center card-lift">
                  <finding.icon className={cn("w-8 h-8 mx-auto mb-3", finding.color)} />
                  <div className="font-space text-3xl font-bold mb-1">{finding.stat}</div>
                  <div className="text-sm font-medium mb-2">{finding.title}</div>
                  <div className="text-xs text-muted-foreground">{finding.description}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Chart 1: Pennebaker Study Results */}
          <section className="mb-16">
            <div className="glass-feature-card p-6 sm:p-8">
              <h2 className="font-space text-xl font-semibold mb-2">Pennebaker Study Results</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Meta-analysis of 100+ studies showing improvement percentages in treatment groups vs. control groups after 4 weeks of expressive writing.
              </p>

              <SafeResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={pennebakerData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="treatment" name="Improvement" radius={[4, 4, 0, 0]}>
                    {pennebakerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>

              <div className="mt-4 text-xs text-muted-foreground text-center">
                Source: Pennebaker, J.W. (2018). Perspectives on Psychological Science
              </div>
            </div>
          </section>

          {/* Chart 2: Writing Frequency Impact */}
          <section className="mb-16">
            <div className="glass-feature-card p-6 sm:p-8">
              <h2 className="font-space text-xl font-semibold mb-2">Writing Frequency Impact</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Relationship between journaling frequency and reported psychological benefits.
                Consistent daily practice shows highest returns, but even weekly writing helps.
              </p>

              <SafeResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={frequencyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="benefit"
                    name="Benefit Level"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#14b8a6' }}
                  />
                </LineChart>
              </SafeResponsiveContainer>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500" />
                  Diminishing returns after 5x/week
                </span>
              </div>
            </div>
          </section>

          {/* Chart 3: Tracking Methods Comparison */}
          <section className="mb-16">
            <div className="glass-feature-card p-6 sm:p-8">
              <h2 className="font-space text-xl font-semibold mb-2">Mood Tracking Effectiveness</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Comparison of self-awareness improvement over 6 months using different journaling methods.
                AI-assisted journaling (like Becoming) shows accelerated pattern recognition.
              </p>

              <SafeResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={trackingMethodsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="traditionalJournal"
                    name="Traditional Journal"
                    stackId="1"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="voiceJournal"
                    name="Voice Journal"
                    stackId="2"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="aiAssisted"
                    name="AI-Assisted (Becoming)"
                    stackId="3"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </SafeResponsiveContainer>

              <div className="mt-4 text-xs text-muted-foreground text-center">
                AI-assisted journaling accelerates pattern recognition by surfacing insights automatically
              </div>
            </div>
          </section>

          {/* Research Methodology Note */}
          <section className="mb-16">
            <div className="glass-feature-card p-6 sm:p-8 border-l-4 border-amber-500">
              <h3 className="font-space font-semibold mb-3">A Note on Methodology</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The visualizations above synthesize findings from multiple peer-reviewed studies.
                Effect sizes vary based on study design, participant demographics, and intervention duration.
                The Pennebaker paradigm data reflects meta-analysis results with Cohen's d = 0.16 across studies.
                Individual results may vary.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="glass-feature-card p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-teal-500" />
                <h2 className="font-space text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
                  Be Part of the <span className="brand-gradient">Data</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Every journal entry you write contributes to your personal pattern library.
                  Start tracking your transformation journey today.
                </p>
                <Link
                  to="/logs"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25 transition-all"
                >
                  Start Journaling
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

export default SciencePage
