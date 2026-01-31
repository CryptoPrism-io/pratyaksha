import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  logOut,
  isFirebaseConfigured,
  type User,
} from "../lib/firebase"
import { syncOnboardingFromServer } from "../lib/onboardingStorage"

interface AuthContextValue {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signIn: () => Promise<User | null>
  signInEmail: (email: string, password: string) => Promise<User | null>
  signUp: (email: string, password: string, displayName?: string) => Promise<User | null>
  forgotPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isConfigured = isFirebaseConfigured()

  useEffect(() => {
    if (!auth) {
      // No Firebase config - run in demo mode
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      // Sync onboarding status from server when user logs in
      // This ensures cross-device consistency
      if (firebaseUser) {
        await syncOnboardingFromServer(firebaseUser.uid)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      const user = await signInWithGoogle()
      return user
    } catch (error) {
      console.error("Sign in failed:", error)
      throw error
    }
  }

  const signInEmail = async (email: string, password: string) => {
    try {
      const user = await signInWithEmail(email, password)
      return user
    } catch (error) {
      console.error("Email sign in failed:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const user = await signUpWithEmail(email, password, displayName)
      return user
    } catch (error) {
      console.error("Sign up failed:", error)
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      await resetPassword(email)
    } catch (error) {
      console.error("Password reset failed:", error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await logOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        signIn,
        signInEmail,
        signUp,
        forgotPassword,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
