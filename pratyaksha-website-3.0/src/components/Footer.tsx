import { Github, Twitter, Mail } from 'lucide-react'

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Dashboard', href: '/dashboard' },
]

const SOCIALS = [
  { icon: Github, href: 'https://github.com/pratyaksha', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/pratyaksha', label: 'Twitter' },
  { icon: Mail, href: 'mailto:hello@pratyaksha.io', label: 'Email' },
]

export function Footer() {
  return (
    <footer className="px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Statement line */}
        <p className="max-w-md font-display text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
          See yourself clearly.
        </p>

        {/* Meta row */}
        <div className="mt-10 flex flex-col gap-6 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
              <span className="font-sanskrit text-xs font-bold text-accent-ink">प्र</span>
            </div>
            <span className="text-sm font-semibold text-ink">Pratyaksha</span>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-muted transition-colors hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-ink"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted">
          © {new Date().getFullYear()} Pratyaksha. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
