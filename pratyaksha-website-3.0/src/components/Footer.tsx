import { Github, Twitter, Mail } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Demo', href: '/demo' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Blog', href: '/blog' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
}

const SOCIALS = [
  { icon: Github, href: 'https://github.com/pratyaksha', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/pratyaksha', label: 'Twitter' },
  { icon: Mail, href: 'mailto:hello@pratyaksha.io', label: 'Email' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand column - takes 2 columns on lg */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white text-sm font-bold" style={{ fontFamily: 'serif' }}>प्र</span>
              </div>
              <span className="text-white font-semibold text-lg">Pratyaksha</span>
            </div>
            <p className="text-sm text-white/50 mb-5 max-w-xs leading-relaxed">
              Transform your journal entries into insights with 4 AI agents. Understand your mind through beautiful visualizations.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Pratyaksha. All rights reserved.
          </p>
          <p className="text-sm text-white/30">
            Made with <span className="text-pink-400">♥</span> for self-understanding
          </p>
        </div>
      </div>
    </footer>
  )
}
