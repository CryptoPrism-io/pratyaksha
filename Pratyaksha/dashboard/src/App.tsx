import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "./components/layout/AppLayout"
import { Landing } from "./pages/Landing"
import { Toaster } from "./components/ui/sonner"
import { ThemeProvider } from "./components/theme-provider"
import { DateFilterProvider } from "./contexts/DateFilterContext"
import { DemoPersonaProvider } from "./contexts/DemoPersonaContext"
import { InstallPrompt } from "./components/pwa/InstallPrompt"
import { OfflineProvider } from "./contexts/OfflineContext"
import { OfflineIndicator } from "./components/offline/OfflineIndicator"
import { AuthProvider } from "./contexts/AuthContext"
import { KarmaProvider } from "./contexts/KarmaContext"
import { ProfileSyncProvider } from "./contexts/ProfileSyncContext"
import { PublicOnlyRoute } from "./components/auth/ProtectedRoute"
import { FirstTimeOnboarding } from "./components/onboarding/FirstTimeOnboarding"
import { MothCursor } from "./components/ui/MothCursor"
import { PageFallback } from "./components/ui/PageFallback"

// Route-level code splitting: only the landing page loads in the initial bundle.
const MarketingHome = lazy(() => import("./pages/MarketingHome"))
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })))
const Logs = lazy(() => import("./pages/Logs").then((m) => ({ default: m.Logs })))
const Insights = lazy(() => import("./pages/Insights").then((m) => ({ default: m.Insights })))
const Compare = lazy(() => import("./pages/Compare").then((m) => ({ default: m.Compare })))
const Chat = lazy(() => import("./pages/Chat").then((m) => ({ default: m.Chat })))
const Profile = lazy(() => import("./pages/Profile").then((m) => ({ default: m.Profile })))
const Blog = lazy(() => import("./pages/Blog").then((m) => ({ default: m.Blog })))
const BlogPostPage = lazy(() => import("./pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage })))
const ResearchIndex = lazy(() => import("./pages/research").then((m) => ({ default: m.ResearchIndex })))
const SciencePage = lazy(() => import("./pages/research/SciencePage").then((m) => ({ default: m.SciencePage })))
const AgentPipelinePage = lazy(() => import("./pages/research/AgentPipelinePage").then((m) => ({ default: m.AgentPipelinePage })))
const MethodologyPage = lazy(() => import("./pages/research/MethodologyPage").then((m) => ({ default: m.MethodologyPage })))
const BrandKit = lazy(() => import("./pages/BrandKit").then((m) => ({ default: m.BrandKit })))
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })))
const Signup = lazy(() => import("./pages/Signup").then((m) => ({ default: m.Signup })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileSyncProvider>
          <DemoPersonaProvider>
          <OfflineProvider>
            <DateFilterProvider defaultPreset="30">
            <KarmaProvider>
            <BrowserRouter>
              <AppLayout>
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/home-old" element={<MarketingHome />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/research" element={<ResearchIndex />} />
                    <Route path="/research/science" element={<SciencePage />} />
                    <Route path="/research/agents" element={<AgentPipelinePage />} />
                    <Route path="/research/methodology" element={<MethodologyPage />} />
                    <Route path="/brand" element={<BrandKit />} />
                    <Route
                      path="/login"
                      element={
                        <PublicOnlyRoute>
                          <Login />
                        </PublicOnlyRoute>
                      }
                    />
                    <Route path="/signup" element={<Signup />} />
                  </Routes>
                </Suspense>
              </AppLayout>
              <MothCursor />
              <Toaster position="bottom-right" richColors closeButton />
              <FirstTimeOnboarding />
              <InstallPrompt />
              <OfflineIndicator />
            </BrowserRouter>
            </KarmaProvider>
          </DateFilterProvider>
          </OfflineProvider>
          </DemoPersonaProvider>
          </ProfileSyncProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
