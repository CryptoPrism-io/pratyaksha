import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useDemoPersona, type DemoPersona } from "../../contexts/DemoPersonaContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Gamepad2, Sword, Search, Rocket } from "lucide-react"

// Icon map for personas
const PERSONA_ICONS: Record<DemoPersona, React.ReactNode> = {
  mario: <Gamepad2 className="h-4 w-4" />,
  kratos: <Sword className="h-4 w-4" />,
  sherlock: <Search className="h-4 w-4" />,
  nova: <Rocket className="h-4 w-4" />,
}

interface DemoBannerProps {
  /** Show persona selector (default: true) */
  showPersonaSelector?: boolean
  /** Compact mode for smaller displays */
  compact?: boolean
}

export function DemoBanner({ showPersonaSelector = true, compact = false }: DemoBannerProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { persona, personaConfig, changePersona, allPersonas } = useDemoPersona()

  // Only show in demo mode (no user)
  if (user) return null

  if (compact) {
    return (
      <div className={`bg-gradient-to-r ${personaConfig.bgGradient} border-b border-${personaConfig.color}-500/20 px-3 py-2`}>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={`text-${personaConfig.color}-500`}>
            {PERSONA_ICONS[persona]}
          </span>
          <span className="text-muted-foreground">Demo mode</span>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:underline font-medium"
          >
            Sign in to start your journal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r ${personaConfig.bgGradient} border-b border-${personaConfig.color}-500/20 px-4 py-2.5 text-center`}>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className={`text-${personaConfig.color}-500`}>
          {PERSONA_ICONS[persona]}
        </span>
        <span className="text-sm text-muted-foreground">Viewing demo journal of</span>
        {showPersonaSelector ? (
          <Select value={persona} onValueChange={(value) => changePersona(value as DemoPersona)}>
            <SelectTrigger className="w-auto h-7 px-2 py-1 text-sm font-bold border-0 bg-transparent hover:bg-muted/50 focus:ring-0 gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allPersonas.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    {PERSONA_ICONS[p.id]}
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground text-xs">- {p.subtitle}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm font-bold">{personaConfig.name}</span>
        )}
        <span className="text-sm text-muted-foreground hidden sm:inline">from {personaConfig.subtitle}</span>
        <span className="text-muted-foreground">•</span>
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-primary hover:underline font-medium"
        >
          Sign in to start your journal
        </button>
      </div>
    </div>
  )
}
