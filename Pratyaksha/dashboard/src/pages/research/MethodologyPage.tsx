import { Link } from 'react-router-dom'
import {
  Brain,
  ArrowRight,
  Sparkles,
  ArrowDownRight,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Target,
  Heart,
  MessageCircle
} from 'lucide-react'
import { ResearchLayout } from './ResearchLayout'
import { cn } from '../../lib/utils'

// Styled formula component
function Formula({
  left,
  operator,
  right,
  equals,
  result,
  description
}: {
  left: string
  operator?: string
  right?: string
  equals?: boolean
  result: string
  description: string
}) {
  return (
    <div className="glass-feature-card p-6 text-center">
      <div className="font-mono text-lg sm:text-xl mb-3 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-teal-600 dark:text-teal-400 font-semibold">{left}</span>
        {operator && <span className="text-muted-foreground">{operator}</span>}
        {right && <span className="text-rose-500 font-semibold">{right}</span>}
        {equals && <span className="text-muted-foreground">=</span>}
        <span className="text-violet-500 font-bold">{result}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

const cognitiveDistortions = [
  {
    name: "All-or-Nothing Thinking",
    description: "Seeing things in black and white categories",
    example: "If I'm not perfect, I'm a total failure",
    reframe: "I can acknowledge partial success and growth",
    icon: Target
  },
  {
    name: "Catastrophizing",
    description: "Expecting the worst possible outcome",
    example: "This mistake will ruin everything",
    reframe: "What's the most likely outcome? How would I cope?",
    icon: AlertTriangle
  },
  {
    name: "Mind Reading",
    description: "Assuming you know what others think",
    example: "They think I'm incompetent",
    reframe: "What evidence do I have? Have I asked them?",
    icon: Brain
  },
  {
    name: "Should Statements",
    description: "Rigid rules about how things must be",
    example: "I should always be productive",
    reframe: "It's okay to rest. Productivity isn't my worth",
    icon: MessageCircle
  },
  {
    name: "Emotional Reasoning",
    description: "Assuming feelings reflect reality",
    example: "I feel like a failure, so I must be one",
    reframe: "Feelings are data, not facts",
    icon: Heart
  },
  {
    name: "Discounting the Positive",
    description: "Dismissing accomplishments as luck or trivial",
    example: "Anyone could have done that",
    reframe: "I can accept credit for my achievements",
    icon: Lightbulb
  }
]

const abcSteps = [
  {
    letter: "A",
    name: "Activating Event",
    description: "The situation or trigger that started the emotional response",
    example: "My manager gave feedback on my project",
    color: "bg-teal-500"
  },
  {
    letter: "B",
    name: "Belief",
    description: "Your interpretation or thought about the event",
    example: "She thinks my work isn't good enough",
    color: "bg-rose-500"
  },
  {
    letter: "C",
    name: "Consequence",
    description: "The emotional and behavioral result",
    example: "Felt anxious, avoided asking questions",
    color: "bg-violet-500"
  }
]

export function MethodologyPage() {
  return (
    <ResearchLayout>
      <div className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-96 right-0 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-rose text-sm font-medium mb-8">
              <Brain className="w-4 h-4 text-rose-500" />
              Cognitive Behavioral Therapy
            </div>
            <h1 className="font-space text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              CBT <span className="brand-gradient">Methodology</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The psychological frameworks and techniques that power Becoming's
              pattern recognition and insight generation.
            </p>
          </div>

          {/* Core Formulas */}
          <section className="mb-16">
            <h2 className="font-space text-2xl font-semibold mb-8 tracking-tight">
              The Mathematics of Mind
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Formula
                left="Distress"
                operator="="
                right=""
                equals={false}
                result="Event × Interpretation"
                description="Your suffering isn't from events, but from how you interpret them"
              />
              <Formula
                left="Resilience"
                operator="="
                right=""
                equals={false}
                result="Awareness + Reframing + Action"
                description="Building mental flexibility through conscious practice"
              />
              <Formula
                left="Insight"
                operator="="
                right=""
                equals={false}
                result="Pattern + Context + Reflection"
                description="Understanding emerges from seeing patterns in context"
              />
              <Formula
                left="Growth"
                operator="="
                right=""
                equals={false}
                result="Discomfort + Support + Time"
                description="Transformation requires facing challenges with resources"
              />
            </div>
          </section>

          {/* Cognitive Triangle */}
          <section className="mb-16">
            <h2 className="font-space text-2xl font-semibold mb-4 tracking-tight">
              The Cognitive Triangle
            </h2>
            <p className="text-muted-foreground mb-8">
              The foundation of CBT: thoughts, feelings, and behaviors are interconnected.
              Change one, and the others shift too.
            </p>

            <div className="glass-feature-card p-8 sm:p-12">
              {/* Triangle Visualization */}
              <div className="relative max-w-md mx-auto">
                {/* Thoughts (Top) */}
                <div className="text-center mb-8">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-3">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <span className="font-space font-semibold text-lg">Thoughts</span>
                    <span className="text-xs text-muted-foreground mt-1">What you think</span>
                  </div>
                </div>

                {/* Connecting Lines (CSS) */}
                <div className="flex justify-between items-start px-4 sm:px-8 relative">
                  {/* Left arrow */}
                  <div className="absolute top-0 left-1/4 -translate-x-1/2">
                    <ArrowDownRight className="w-8 h-8 text-muted-foreground/50 rotate-[-45deg]" />
                  </div>
                  {/* Right arrow */}
                  <div className="absolute top-0 right-1/4 translate-x-1/2">
                    <ArrowDownRight className="w-8 h-8 text-muted-foreground/50 rotate-[45deg] scale-x-[-1]" />
                  </div>
                </div>

                {/* Feelings (Left) & Behaviors (Right) */}
                <div className="flex justify-between items-start mt-8">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-3">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <span className="font-space font-semibold text-lg">Feelings</span>
                    <span className="text-xs text-muted-foreground mt-1">What you feel</span>
                  </div>

                  {/* Bottom connecting line */}
                  <div className="flex-1 flex items-center justify-center pt-8">
                    <RefreshCw className="w-6 h-6 text-muted-foreground/50" />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-3">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <span className="font-space font-semibold text-lg">Behaviors</span>
                    <span className="text-xs text-muted-foreground mt-1">What you do</span>
                  </div>
                </div>

                {/* Center explanation */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="brand-gradient font-semibold">Becoming</span> tracks all three:
                    your cognitive patterns (themes), emotional states (modes),
                    and suggested actions (next steps).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ABC Model */}
          <section className="mb-16">
            <h2 className="font-space text-2xl font-semibold mb-4 tracking-tight">
              The ABC Model
            </h2>
            <p className="text-muted-foreground mb-8">
              Albert Ellis's Rational Emotive Behavior Therapy (REBT) model shows that
              it's not events that upset us, but our beliefs about them.
            </p>

            <div className="space-y-4">
              {abcSteps.map((step, index) => (
                <div key={step.letter} className="glass-feature-card p-6 flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    step.color
                  )}>
                    <span className="font-space font-bold text-xl text-white">{step.letter}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-space font-semibold text-lg mb-1">{step.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    <div className="text-sm italic text-foreground/70">"{step.example}"</div>
                  </div>
                  {index < abcSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl glass-light border border-teal-500/20">
              <p className="text-sm text-center">
                <strong className="text-teal-600 dark:text-teal-400">Key insight:</strong> By identifying and challenging the <strong>Belief (B)</strong>,
                you can change the <strong>Consequence (C)</strong> without changing the event.
              </p>
            </div>
          </section>

          {/* Cognitive Distortions */}
          <section className="mb-16">
            <h2 className="font-space text-2xl font-semibold mb-4 tracking-tight">
              Common Cognitive Distortions
            </h2>
            <p className="text-muted-foreground mb-8">
              Becoming's Theme Agent detects these thinking patterns and helps you recognize
              when your mind is playing tricks on you.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {cognitiveDistortions.map((distortion) => (
                <div key={distortion.name} className="glass-feature-card p-5 card-lift">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg glass-rose flex items-center justify-center flex-shrink-0">
                      <distortion.icon className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-space font-semibold">{distortion.name}</h3>
                      <p className="text-xs text-muted-foreground">{distortion.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Distorted:</span>
                      <p className="text-foreground/80 italic">"{distortion.example}"</p>
                    </div>
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Reframe:</span>
                      <p className="text-foreground/80">"{distortion.reframe}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How Becoming Uses CBT */}
          <section className="mb-16">
            <h2 className="font-space text-2xl font-semibold mb-4 tracking-tight">
              How Becoming Applies CBT
            </h2>

            <div className="glass-feature-card p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-space font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <span className="text-teal-500 font-bold">1</span>
                    </span>
                    Pattern Detection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our Theme Agent identifies recurring thought patterns and contradictions
                    in your entries, surfacing cognitive distortions you might not notice.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-space font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                      <span className="text-rose-500 font-bold">2</span>
                    </span>
                    Emotional Mapping
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The Emotion Agent tracks your mood states over time, revealing
                    the feeling component of the cognitive triangle.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-space font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <span className="text-violet-500 font-bold">3</span>
                    </span>
                    Insight Generation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The Insight Agent generates personalized reframes and actionable
                    next steps based on CBT principles.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-space font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-500 font-bold">4</span>
                    </span>
                    Progress Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Weekly and Monthly agents measure your cognitive evolution,
                    showing how your thinking patterns change over time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="glass-feature-card p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-rose-500" />
                <h2 className="font-space text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
                  Practice CBT Through <span className="brand-gradient">Journaling</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Every entry is an opportunity to examine your thoughts, understand your feelings,
                  and choose your behaviors more consciously.
                </p>
                <Link
                  to="/logs"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold hover:scale-105 hover:shadow-xl hover:shadow-rose-500/25 transition-all"
                >
                  Start Practicing
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

export default MethodologyPage
