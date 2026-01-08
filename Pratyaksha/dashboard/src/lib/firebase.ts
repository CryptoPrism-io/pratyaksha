import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"

// Firebase configuration - these will be set via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Only initialize if config is available
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId

let app: ReturnType<typeof initializeApp> | null = null
let auth: ReturnType<typeof getAuth> | null = null

if (hasConfig) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
}

const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged }
export type { User }

// Helper functions
export async function signInWithGoogle() {
  if (!auth) {
    console.warn("Firebase not configured - running in demo mode")
    return null
  }
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Google sign-in error:", error)
    throw error
  }
}

export async function logOut() {
  if (!auth) return
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Sign-out error:", error)
    throw error
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) {
    console.warn("Firebase not configured - running in demo mode")
    return null
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error("Email sign-in error:", error)
    throw error
  }
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  if (!auth) {
    console.warn("Firebase not configured - running in demo mode")
    return null
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName })
    }
    return result.user
  } catch (error) {
    console.error("Email sign-up error:", error)
    throw error
  }
}

export async function resetPassword(email: string) {
  if (!auth) {
    console.warn("Firebase not configured - running in demo mode")
    return
  }
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Password reset error:", error)
    throw error
  }
}

export function isFirebaseConfigured(): boolean {
  return hasConfig
}

// Get user-friendly error message from Firebase error code
export function getAuthErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: string; message?: string }
  switch (firebaseError.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try signing in instead."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support."
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters."
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support."
    case "auth/user-not-found":
      return "No account found with this email. Try signing up instead."
    case "auth/wrong-password":
      return "Incorrect password. Please try again."
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed. Please try again."
    case "auth/network-request-failed":
      return "Network error. Please check your connection."
    default:
      return firebaseError.message || "An error occurred. Please try again."
  }
}
