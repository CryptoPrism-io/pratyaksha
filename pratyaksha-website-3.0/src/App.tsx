import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Stats } from './components/Stats'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { CTA } from './components/CTA'
import { Footer } from './components/Footer'
import { BackgroundOrbs } from './components/BackgroundOrbs'

export default function App() {
  return (
    <div className="relative min-h-screen bg-paper text-ink">
      {/* Static atmospheric blooms (no animation) */}
      <BackgroundOrbs />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="space-y-20 sm:space-y-28 lg:space-y-36">
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
