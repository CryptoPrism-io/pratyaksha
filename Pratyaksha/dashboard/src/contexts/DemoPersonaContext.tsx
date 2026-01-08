import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export type DemoPersona = "mario" | "kratos" | "sherlock" | "nova"

export interface PersonaConfig {
  id: DemoPersona
  name: string
  subtitle: string
  icon: string
  color: string
  bgGradient: string
}

export const DEMO_PERSONAS: Record<DemoPersona, PersonaConfig> = {
  mario: {
    id: "mario",
    name: "Mario",
    subtitle: "Mushroom Kingdom",
    icon: "Gamepad2",
    color: "red",
    bgGradient: "from-red-500/10 via-yellow-500/10 to-green-500/10",
  },
  kratos: {
    id: "kratos",
    name: "Kratos",
    subtitle: "God of War",
    icon: "Sword",
    color: "amber",
    bgGradient: "from-amber-500/10 via-orange-500/10 to-red-500/10",
  },
  sherlock: {
    id: "sherlock",
    name: "Sherlock",
    subtitle: "221B Baker Street",
    icon: "Search",
    color: "purple",
    bgGradient: "from-purple-500/10 via-indigo-500/10 to-blue-500/10",
  },
  nova: {
    id: "nova",
    name: "Nova",
    subtitle: "Startup Founder",
    icon: "Rocket",
    color: "blue",
    bgGradient: "from-blue-500/10 via-cyan-500/10 to-teal-500/10",
  },
}

const STORAGE_KEY = "pratyaksha-demo-persona"

interface DemoPersonaContextValue {
  persona: DemoPersona
  personaConfig: PersonaConfig
  changePersona: (newPersona: DemoPersona) => void
  allPersonas: PersonaConfig[]
}

const DemoPersonaContext = createContext<DemoPersonaContextValue | null>(null)

export function DemoPersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<DemoPersona>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as DemoPersona | null
      if (stored && stored in DEMO_PERSONAS) {
        return stored
      }
    }
    return "mario" // Default persona
  })

  // Persist to localStorage when persona changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, persona)
    }
  }, [persona])

  const changePersona = useCallback((newPersona: DemoPersona) => {
    setPersona(newPersona)
  }, [])

  const personaConfig = DEMO_PERSONAS[persona]
  const allPersonas = Object.values(DEMO_PERSONAS)

  return (
    <DemoPersonaContext.Provider value={{ persona, personaConfig, changePersona, allPersonas }}>
      {children}
    </DemoPersonaContext.Provider>
  )
}

export function useDemoPersona() {
  const context = useContext(DemoPersonaContext)
  if (!context) {
    throw new Error("useDemoPersona must be used within a DemoPersonaProvider")
  }
  return context
}
