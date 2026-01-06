import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import type { LucideIcon } from "lucide-react"

interface ActionConfig {
  label: string
  href?: string
  onClick?: () => void
}

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ActionConfig
  secondaryAction?: ActionConfig
  className?: string
  height?: string
}

function ActionButton({ action, variant = "outline" }: { action: ActionConfig; variant?: "outline" | "ghost" }) {
  if (action.href) {
    return (
      <Button asChild variant={variant} size="sm">
        <Link to={action.href}>{action.label}</Link>
      </Button>
    )
  }
  return (
    <Button variant={variant} size="sm" onClick={action.onClick}>
      {action.label}
    </Button>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  height = "h-[400px]",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        height,
        className
      )}
    >
      {Icon && (
        <div className="rounded-full bg-muted/50 p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {secondaryAction && <ActionButton action={secondaryAction} variant="ghost" />}
          {action && <ActionButton action={action} />}
        </div>
      )}
    </div>
  )
}
