import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { MothLogo } from "../components/brand/MothLogo"
import { Badge } from "../components/ui/badge"
import { toast } from "sonner"
import {
  Briefcase,
  Brain,
  GraduationCap,
  TreePine,
  Trash2,
  LogIn,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react"

// Static class map — avoids Tailwind JIT purging dynamic interpolation
const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  rose: { bg: "bg-rose-500/10", text: "text-rose-500" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
}

interface TestUserProfile {
  id: string
  displayName: string
  email: string
  profession: string
  ageRange: string
  stressLevel: number
  emotionalOpenness: number
  personalGoal: string
  icon: React.ReactNode
  color: string
}

const TEST_USERS: TestUserProfile[] = [
  {
    id: "test-alice",
    displayName: "Alice Chen",
    email: "test-alice@pratyaksha.dev",
    profession: "Startup Founder",
    ageRange: "25-34",
    stressLevel: 4,
    emotionalOpenness: 4,
    personalGoal: "Scale SaaS to $1M ARR",
    icon: <Briefcase className="h-5 w-5" />,
    color: "rose",
  },
  {
    id: "test-bob",
    displayName: "Dr. Bob Williams",
    email: "test-bob@pratyaksha.dev",
    profession: "Clinical Psychologist",
    ageRange: "35-44",
    stressLevel: 2,
    emotionalOpenness: 5,
    personalGoal: "Help 1000 people overcome anxiety",
    icon: <Brain className="h-5 w-5" />,
    color: "blue",
  },
  {
    id: "test-carol",
    displayName: "Carol Nguyen",
    email: "test-carol@pratyaksha.dev",
    profession: "PhD Student (Neuro)",
    ageRange: "18-24",
    stressLevel: 5,
    emotionalOpenness: 3,
    personalGoal: "Complete PhD without burnout",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "purple",
  },
  {
    id: "test-david",
    displayName: "David Thompson",
    email: "test-david@pratyaksha.dev",
    profession: "Retired Engineer",
    ageRange: "55-64",
    stressLevel: 2,
    emotionalOpenness: 3,
    personalGoal: "Find meaning in retirement",
    icon: <TreePine className="h-5 w-5" />,
    color: "emerald",
  },
]

interface ExistingTestUser {
  firebaseUid: string
  displayName: string | null
  email: string
  profession: string | null
  entryCount: number
  embeddingCount: number
  createdAt: string | null
}

export function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { signInTestUser } = useAuth()
  const from = (location.state as { from?: string })?.from || "/dashboard"

  const [adminMode, setAdminMode] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [existingUsers, setExistingUsers] = useState<ExistingTestUser[]>([])
  const [loadingUser, setLoadingUser] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [loadingList, setLoadingList] = useState(false)

  // Activate admin mode via URL param
  useEffect(() => {
    if (searchParams.get("dev") === "1") {
      setAdminMode(true)
    }
  }, [searchParams])

  // Fetch existing test users when admin mode activates
  useEffect(() => {
    if (adminMode) {
      fetchExistingUsers()
    }
  }, [adminMode])

  // Default redirect for non-admin visitors
  useEffect(() => {
    if (!adminMode && clickCount === 0) {
      const timer = setTimeout(() => {
        if (!adminMode) {
          navigate("/login", { state: { from }, replace: true })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [adminMode, navigate, from, clickCount])

  const handleLogoClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)

    if (clickTimer.current) clearTimeout(clickTimer.current)

    if (newCount >= 5) {
      setAdminMode(true)
      setClickCount(0)
      return
    }

    clickTimer.current = setTimeout(() => setClickCount(0), 2000)
  }

  async function fetchExistingUsers() {
    setLoadingList(true)
    try {
      const res = await fetch("/api/test-users")
      const data = await res.json()
      if (data.success) {
        setExistingUsers(data.users)
      }
    } catch (err) {
      console.error("Failed to fetch test users:", err)
    } finally {
      setLoadingList(false)
    }
  }

  async function handleLoginAs(profile: TestUserProfile) {
    setLoadingUser(profile.id)
    try {
      // Upsert the test user in PostgreSQL
      const res = await fetch("/api/test-users/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: profile.id,
          displayName: profile.displayName,
          email: profile.email,
          personalization: {
            ageRange: profile.ageRange,
            profession: profile.profession,
            stressLevel: profile.stressLevel,
            emotionalOpenness: profile.emotionalOpenness,
            personalGoal: profile.personalGoal,
          },
        }),
      })
      const data = await res.json()

      if (!data.success) {
        toast.error(`Failed to create test user: ${data.error}`)
        return
      }

      // Sign in on the frontend
      signInTestUser(profile.id, profile.displayName, profile.email)
      toast.success(`Logged in as ${profile.displayName}`)
      navigate("/dashboard")
    } catch (err) {
      toast.error(`Error: ${err}`)
    } finally {
      setLoadingUser(null)
    }
  }

  async function handleDeleteUser(firebaseUid: string) {
    try {
      const res = await fetch(`/api/test-users/${firebaseUid}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success(`Deleted ${firebaseUid}`)
        fetchExistingUsers()
      } else {
        toast.error(data.error)
      }
    } catch (err) {
      toast.error(`Error: ${err}`)
    }
  }

  async function handleDeleteAll() {
    setDeleting(true)
    try {
      const res = await fetch("/api/test-users/all", { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success(`Deleted ${data.deletedCount} test user(s)`)
        setExistingUsers([])
      } else {
        toast.error(data.error)
      }
    } catch (err) {
      toast.error(`Error: ${err}`)
    } finally {
      setDeleting(false)
    }
  }

  if (!adminMode) {
    // Show a minimal page with clickable moth logo while redirect happens
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={handleLogoClick} className="p-4 cursor-default">
          <MothLogo size="xl" />
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Test User Admin</h1>
          <p className="text-sm text-muted-foreground">
            Multi-user validation panel — creates synthetic users in PostgreSQL
          </p>
        </div>
      </div>

      {/* Test User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {TEST_USERS.map((profile) => {
          const existing = existingUsers.find((u) => u.firebaseUid === profile.id)
          const isLoading = loadingUser === profile.id

          return (
            <div
              key={profile.id}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              {/* Name & icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${COLOR_CLASSES[profile.color]?.bg} ${COLOR_CLASSES[profile.color]?.text}`}>
                    {profile.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{profile.displayName}</p>
                    <p className="text-xs text-muted-foreground">{profile.profession}</p>
                  </div>
                </div>
                {existing && (
                  <Badge variant="outline" className="text-xs">
                    {existing.entryCount} entries
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Age: {profile.ageRange}</span>
                <span>Stress: {profile.stressLevel}/5</span>
                <span>Openness: {profile.emotionalOpenness}/5</span>
              </div>

              {/* Goal */}
              <p className="text-sm text-muted-foreground italic">
                "{profile.personalGoal}"
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoginAs(profile)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  Login as {profile.displayName.split(" ")[0]}
                </button>
                {existing && (
                  <button
                    onClick={() => handleDeleteUser(profile.id)}
                    className="px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-sm transition-colors"
                    title="Delete this test user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Existing Test Users List */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Existing Test Users</h2>
          </div>
          <button
            onClick={fetchExistingUsers}
            className="text-sm text-primary hover:underline"
          >
            Refresh
          </button>
        </div>

        {loadingList ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : existingUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No test users found. Click "Login as" above to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {existingUsers.map((u) => (
              <div
                key={u.firebaseUid}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {u.displayName || u.firebaseUid}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.profession ? `${u.profession} · ` : ""}
                    {u.entryCount} entries · {u.embeddingCount} embeddings
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const profile = TEST_USERS.find((p) => p.id === u.firebaseUid)
                      if (profile) handleLoginAs(profile)
                      else {
                        signInTestUser(
                          u.firebaseUid,
                          u.displayName || u.firebaseUid,
                          u.email
                        )
                        toast.success(`Logged in as ${u.displayName || u.firebaseUid}`)
                        navigate("/dashboard")
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Switch
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.firebaseUid)}
                    className="text-xs px-2 py-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cleanup */}
      {existingUsers.length > 0 && (
        <button
          onClick={handleDeleteAll}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete All Test Data
        </button>
      )}
    </div>
  )
}
