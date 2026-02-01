import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { Stats } from './components/Stats'
import { CTA } from './components/CTA'
import { Footer } from './components/Footer'
import { BackgroundOrbs } from './components/BackgroundOrbs'

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      {/* Ambient background */}
      <BackgroundOrbs />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Main content */}
        <main className="space-y-16 sm:space-y-24 lg:space-y-32">
          <Hero />
          <Stats />
          <Features />
          <HowItWorks />
          <CTA />
        </main>

        <Footer />
      </div>
    </div>
  )
}
