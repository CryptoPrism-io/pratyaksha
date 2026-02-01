import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "./components/layout/AppLayout"
import MarketingHome from "./pages/MarketingHome"
import { Landing } from "./pages/Landing"
import { Dashboard } from "./pages/Dashboard"
import { Logs } from "./pages/Logs"
// Insights page removed - functionality merged into Compare
import { Compare } from "./pages/Compare"
import { Chat } from "./pages/Chat"
import { Profile } from "./pages/Profile"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Blog } from "./pages/Blog"
import { BlogPostPage } from "./pages/BlogPostPage"
import { Research } from "./pages/Research"
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
      {/* Global moth cursor */}
      <MothCursor />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileSyncProvider>
          <DemoPersonaProvider>
          <OfflineProvider>
            <DateFilterProvider defaultPreset="30">
            <KarmaProvider>
            <BrowserRouter>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/home-old" element={<MarketingHome />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/logs" element={<Logs />} />
                  {/* Insights route removed - use Compare instead */}
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/research" element={<Research />} />
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <Login />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicOnlyRoute>
                        <Signup />
                      </PublicOnlyRoute>
                    }
                  />
                </Routes>
              </AppLayout>
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
