import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Dashboard', href: '/dashboard' },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 top-4 z-20 flex justify-center px-4">
      <div className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper/80 py-2 pl-4 pr-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
            <span className="font-sanskrit text-xs font-bold text-accent-ink">प्र</span>
          </div>
          <span className="hidden text-sm font-semibold text-ink sm:block">Pratyaksha</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden items-center md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/dashboard"
          className="ml-1 hidden items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:brightness-110 md:inline-flex"
        >
          Start free
        </a>

        {/* Mobile menu button */}
        <button
          className="p-2 text-ink-2 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-4 top-full mt-2 rounded-2xl border border-rule bg-paper/90 p-2 shadow-xl backdrop-blur-xl md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/dashboard"
              className="mt-1 block rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-ink"
            >
              Start free
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
