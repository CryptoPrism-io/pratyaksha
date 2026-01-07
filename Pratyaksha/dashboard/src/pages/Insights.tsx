import { Lightbulb, TrendingUp, Brain, Calendar, ArrowRight } from "lucide-react"

export function Insights() {
  return (
    <div className="min-h-screen dashboard-glass-bg">

      <div className="container mx-auto px-4 py-8 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of your journaling patterns and personalized recommendations
          </p>
        </div>

        {/* Coming Soon Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Weekly Summary Card */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Weekly Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get automated weekly digests of your mood trends, top themes, and personalized suggestions.
            </p>
            <div className="flex items-center text-sm text-primary">
              <span>Coming soon</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>

          {/* Pattern Detection Card */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="font-semibold">Pattern Detection</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI identifies recurring patterns in your thoughts, emotions, and behaviors over time.
            </p>
            <div className="flex items-center text-sm text-primary">
              <span>Coming soon</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>

          {/* Cognitive Analysis Card */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-semibold">Cognitive Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Deep analysis of your cognitive modes and contradictions with actionable recommendations.
            </p>
            <div className="flex items-center text-sm text-primary">
              <span>Coming soon</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-12 rounded-xl glass-card p-8 text-center">
          <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Insights Coming Soon</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We're building powerful AI-driven insights to help you understand your patterns better.
            Keep journaling to unlock personalized recommendations!
          </p>
        </div>
      </div>
    </div>
  )
}
