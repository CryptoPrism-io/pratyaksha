import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, FileText, GitCompare, MessageCircle } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Logs', href: '/logs', icon: FileText },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Compare', href: '/compare', icon: GitCompare },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'serif' }}>प्र</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">Pratyaksha</span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <link.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.a
              href="/dashboard"
              className="px-5 py-2 rounded-full bg-purple-500 text-white text-sm font-medium hover:bg-purple-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter Dashboard
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </a>
              ))}
              <div className="pt-2 border-t border-white/10">
                <a
                  href="/dashboard"
                  className="block w-full px-4 py-3 rounded-lg bg-purple-500 text-white text-center font-medium"
                >
                  Enter Dashboard
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
