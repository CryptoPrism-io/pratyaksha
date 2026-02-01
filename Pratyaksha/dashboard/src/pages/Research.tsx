import { Link } from 'react-router-dom'
import { Brain, ArrowRight, ExternalLink, Beaker, Activity, Waves, Sparkles, GitCompare, Target } from 'lucide-react'
import { BlogLayout } from '../components/blog'
import { cn } from '../lib/utils'

const studies = [
  {
    title: "Expressive Writing in Psychological Science",
    authors: "Pennebaker, J. W.",
    journal: "Perspectives on Psychological Science",
    year: "2018",
    finding: "Over 100 studies show expressive writing yields health benefits with effect size d = 0.16",
    url: "https://journals.sagepub.com/doi/full/10.1177/1745691617707315"
  },
  {
    title: "Vocal Biomarker-Based Mental Health Tracking",
    authors: "Frontiers in Psychiatry Research Team",
    journal: "Frontiers in Psychiatry",
    year: "2024",
    finding: "Voice-based journaling apps provide objective mental wellbeing data calibrated against validated assessments",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10948552/"
  },
  {
    title: "AI Voice Analysis for Cognitive Assessment",
    authors: "PLOS One Research Team",
    journal: "PLOS One",
    year: "2025",
    finding: "AI models can detect cognitive decline from short conversational voice samples",
    url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0325177"
  },
  {
    title: "Working Memory & Expressive Writing",
    authors: "Klein, K., & Boals, A.",
    journal: "British Journal of Health Psychology",
    year: "2001",
    finding: "Expressive writing improved working memory by freeing resources from intrusive thoughts",
    url: "https://sparq.stanford.edu/sites/g/files/sbiybj19021/files/media/file/baikie_wilhelm_2005_-_emotional_and_physical_health_benefits_of_expressive_writing.pdf"
  }
]

const statistics = [
  { value: "20-45%", label: "Reduction in depression & anxiety", icon: Activity, color: "text-teal-500" },
  { value: "25%", label: "Improved attention span", icon: Brain, color: "text-rose-500" },
  { value: "20%", label: "Better task concentration", icon: Target, color: "text-violet-500" },
  { value: "0.16", label: "Cohen's d across 100+ studies", icon: Beaker, color: "text-amber-500" }
]

const contradictions = [
  { left: "Action", right: "Fear", desc: "Knowing what to do vs. not doing it" },
  { left: "Growth", right: "Comfort", desc: "Aspirational self vs. protective self" },
  { left: "Independence", right: "Connection", desc: "Self-reliance vs. belonging needs" },
  { left: "Control", right: "Surrender", desc: "Agency vs. acceptance" },
  { left: "Present", right: "Future", desc: "Immediate vs. delayed reward" },
  { left: "Authenticity", right: "Belonging", desc: "True self vs. social acceptance" }
]

export function Research() {
  return (
    <BlogLayout>
      <div className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-96 right-0 w-[400px] h-[400px] bg-rose-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 left-1/3 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">

          {/* Hero Section - Bold Modern Typography */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-teal text-sm font-medium mb-8">
              <Beaker className="w-4 h-4 text-teal-500" />
              Peer-Reviewed Research
            </div>
            <h1 className="font-space text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
              The Science of<br />
              <span className="brand-gradient">Becoming</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built on decades of psychological research. Here's the evidence
              supporting voice journaling, pattern recognition, and the transformation process.
            </p>
          </div>

          {/* Statistics Grid - Glassmorphism */}
          <section className="mb-24">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statistics.map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass-feature-card p-6 text-center card-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className={cn("w-8 h-8 mx-auto mb-3", stat.color)} />
                  <div className="font-space text-3xl sm:text-4xl font-bold mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Pennebaker's Foundation - Glass Panel */}
          <section className="mb-24">
            <h2 className="font-space text-3xl sm:text-4xl font-bold mb-8 tracking-tight">
              The Pennebaker Paradigm
            </h2>
            <div className="glass-feature-card p-6 sm:p-10">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                In 1986, Dr. James Pennebaker at the University of Texas conducted a landmark study
                that would reshape our understanding of therapeutic writing. Participants wrote for
                just 15-20 minutes over four days about their deepest thoughts and feelings.
              </p>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-space font-semibold text-lg">Key Findings</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    {[
                      "Fewer visits to health centers",
                      "Improved immune function markers",
                      "Better academic performance",
                      "Reduced depression and anxiety"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="inline-flex w-6 h-6 rounded-full glass-teal items-center justify-center flex-shrink-0 mt-0.5">
                          <ArrowRight className="w-3 h-3 text-teal-500" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-space font-semibold text-lg">Cognitive Markers</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    LIWC analysis revealed that participants who improved showed increased use of{" "}
                    <span className="text-teal-600 dark:text-teal-400 font-medium">causal words</span> ("because", "reason")
                    and <span className="text-rose-500 font-medium">insight words</span> ("realize", "understand").
                    This shift from emotional expression to cognitive processing is what
                    <span className="brand-gradient font-semibold"> Becoming</span>'s AI explicitly tracks.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Voice Journaling Science */}
          <section className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="glass-rose p-3 rounded-xl">
                <Waves className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="font-space text-3xl sm:text-4xl font-bold tracking-tight">
                Voice as a Biomarker
              </h2>
            </div>
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Recent advances in AI have revealed that voice contains rich signals about mental
                and cognitive states. A 2024 study in <em>Frontiers in Psychiatry</em> demonstrated
                that vocal biomarker-based journaling applications can provide objective mental
                wellbeing information calibrated against validated clinical assessments.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { title: "Pitch Variability", desc: "Correlates with emotional arousal and engagement", color: "from-teal-500 to-cyan-500" },
                  { title: "Speech Rate", desc: "Indicates cognitive load and processing speed", color: "from-rose-500 to-pink-500" },
                  { title: "Pause Patterns", desc: "Reflects thinking depth and emotional processing", color: "from-violet-500 to-purple-500" }
                ].map((item) => (
                  <div key={item.title} className="glass-feature-card p-6 text-center card-lift">
                    <div className={cn("font-space text-xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent", item.color)}>
                      {item.title}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pattern Recognition */}
          <section className="mb-24">
            <h2 className="font-space text-3xl sm:text-4xl font-bold mb-8 tracking-tight">
              Why Pattern Recognition Matters
            </h2>
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The therapeutic benefit of journaling isn't just expression—it's{" "}
                <strong className="text-foreground">cognitive reorganization</strong>. Research shows
                that simply venting emotions doesn't help; what helps is constructing narrative and
                finding meaning in experiences.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-feature-card p-6 card-scale-glow">
                  <h3 className="font-space font-semibold text-lg mb-3">Habituation Theory</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Repeated exposure to emotional content through writing reduces its psychological
                    intensity over time. By identifying recurring themes and contradictions,
                    <span className="brand-gradient font-semibold"> Becoming</span> helps accelerate this habituation process.
                  </p>
                </div>
                <div className="glass-feature-card p-6 card-scale-glow">
                  <h3 className="font-space font-semibold text-lg mb-3">Cognitive Processing Theory</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The shift from emotional to cognitive language—using more "because" and
                    "realize" words—predicts psychological improvement. Our 9-agent AI tracks
                    this cognitive evolution across your entries.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contradictions Science */}
          <section className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-r from-teal-500/20 to-rose-500/20 backdrop-blur-sm border border-white/10 p-3 rounded-xl">
                <GitCompare className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="font-space text-3xl sm:text-4xl font-bold tracking-tight">
                The Mathematics of Inner Conflict
              </h2>
            </div>
            <div className="glass-feature-card p-6 sm:p-10">
              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                <span className="brand-gradient font-semibold">Becoming</span> identifies 12 core contradictions that appear in human thinking. These
                aren't arbitrary categories—they emerge from cognitive science research on
                approach-avoidance conflicts and self-discrepancy theory.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contradictions.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl glass-light dark:bg-white/5 border border-border/50 hover:border-teal-500/30 transition-colors">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-teal-600 dark:text-teal-400 font-space font-semibold">{c.left}</span>
                      <span className="text-muted-foreground text-sm">vs.</span>
                      <span className="text-rose-500 font-space font-semibold">{c.right}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Cited Studies */}
          <section className="mb-24">
            <h2 className="font-space text-3xl sm:text-4xl font-bold mb-8 tracking-tight">
              Key Research Citations
            </h2>
            <div className="space-y-4">
              {studies.map((study, index) => (
                <a
                  key={study.title}
                  href={study.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block glass-feature-card p-5 sm:p-6 card-lift hover-glow group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-space font-semibold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-1">
                        {study.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {study.authors} &bull; <em>{study.journal}</em> ({study.year})
                      </p>
                      <p className="text-sm text-muted-foreground/80">
                        <strong className="text-foreground/80">Key finding:</strong> {study.finding}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-teal-500 transition-colors flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="glass-feature-card p-8 sm:p-12 relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-teal-500" />
                <h2 className="font-space text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                  Experience Evidence-Based <span className="brand-gradient">Transformation</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                  <span className="brand-gradient font-semibold">Becoming</span> translates decades of psychological research into a practical tool.
                  See your patterns, track your cognitive evolution, and become who you want to be.
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
    </BlogLayout>
  )
}
