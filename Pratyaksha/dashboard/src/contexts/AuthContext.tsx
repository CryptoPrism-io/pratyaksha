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

const TEST_USER_KEY = "pratyaksha-test-user"

interface AuthContextValue {
  user: User | null
  loading: boolean
  isConfigured: boolean
  isTestUser: boolean
  signIn: () => Promise<User | null>
  signInEmail: (email: string, password: string) => Promise<User | null>
  signUp: (email: string, password: string, displayName?: string) => Promise<User | null>
  signInTestUser: (uid: string, displayName: string, email: string) => void
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
  const [isTestUser, setIsTestUser] = useState(false)
  const isConfigured = isFirebaseConfigured()

  useEffect(() => {
    // Restore test user from localStorage on mount
    const stored = localStorage.getItem(TEST_USER_KEY)
    if (stored) {
      try {
        const testUser = JSON.parse(stored)
        setUser(testUser as User)
        setIsTestUser(true)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem(TEST_USER_KEY)
      }
    }

    if (!auth) {
      // No Firebase config - run in demo mode
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Don't override test user with Firebase auth state
      const currentTestUser = localStorage.getItem(TEST_USER_KEY)
      if (currentTestUser) return

      setUser(firebaseUser)
      setIsTestUser(false)

      // Sync onboarding status from server when user logs in
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

  const signInTestUser = (uid: string, displayName: string, email: string) => {
    const syntheticUser = {
      uid,
      email,
      displayName,
      photoURL: null,
      emailVerified: true,
    } as unknown as User

    localStorage.setItem(TEST_USER_KEY, JSON.stringify(syntheticUser))
    setUser(syntheticUser)
    setIsTestUser(true)
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
      // Clear test user state
      if (isTestUser) {
        localStorage.removeItem(TEST_USER_KEY)
        setIsTestUser(false)
        setUser(null)
        return
      }

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
        isTestUser,
        signIn,
        signInEmail,
        signUp,
        signInTestUser,
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
