import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Header } from "./components/layout/Header"
import { Landing } from "./pages/Landing"
import { Dashboard } from "./pages/Dashboard"
import { Logs } from "./pages/Logs"
import { Insights } from "./pages/Insights"
import { Profile } from "./pages/Profile"
import { Toaster } from "./components/ui/sonner"
import { ThemeProvider } from "./components/theme-provider"
import { DateFilterProvider } from "./contexts/DateFilterContext"
import { DemoPersonaProvider } from "./contexts/DemoPersonaContext"
import { InstallPrompt } from "./components/pwa/InstallPrompt"
import { OfflineProvider } from "./contexts/OfflineContext"
import { OfflineIndicator } from "./components/offline/OfflineIndicator"
import { AuthProvider } from "./contexts/AuthContext"

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
          <DemoPersonaProvider>
          <OfflineProvider>
            <DateFilterProvider defaultPreset="30">
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
              <Toaster position="bottom-right" richColors closeButton />
              <InstallPrompt />
              <OfflineIndicator />
            </BrowserRouter>
          </DateFilterProvider>
          </OfflineProvider>
          </DemoPersonaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
