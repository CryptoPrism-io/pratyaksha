import { Component, type ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./button"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chart error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg bg-muted/30 p-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "Failed to load this component"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper for chart components
export function ChartErrorBoundary({
  children,
  chartName
}: {
  children: ReactNode
  chartName?: string
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">Failed to load {chartName || "chart"}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
