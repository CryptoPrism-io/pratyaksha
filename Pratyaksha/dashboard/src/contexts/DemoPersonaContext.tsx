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
    color: "teal",
    bgGradient: "bg-teal-500/10",
  },
  kratos: {
    id: "kratos",
    name: "Kratos",
    subtitle: "God of War",
    icon: "Sword",
    color: "violet",
    bgGradient: "bg-violet-600/10",
  },
  sherlock: {
    id: "sherlock",
    name: "Sherlock",
    subtitle: "221B Baker Street",
    icon: "Search",
    color: "violet",
    bgGradient: "bg-violet-600/10",
  },
  nova: {
    id: "nova",
    name: "Nova",
    subtitle: "Startup Founder",
    icon: "Rocket",
    color: "teal",
    bgGradient: "bg-teal-500/10",
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
