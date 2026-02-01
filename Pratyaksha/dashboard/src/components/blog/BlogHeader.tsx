import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MothLogo } from '../brand/MothLogo'
import { BrandWordmark } from '../brand/BrandWordmark'

interface BlogHeaderProps {
  showBackToBlog?: boolean
}

export function BlogHeader({ showBackToBlog = false }: BlogHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <MothLogo size="md" animated />
          <BrandWordmark size="md" variant="default" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {showBackToBlog ? (
            <Link
              to="/blog"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Posts</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
          <Link
            to="/blog"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Blog
          </Link>
          <Link
            to="/research"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Research
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}
