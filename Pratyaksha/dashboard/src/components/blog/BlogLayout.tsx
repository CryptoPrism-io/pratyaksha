import type { ReactNode } from 'react'
import { BlogHeader } from './BlogHeader'
import { BlogFooter } from './BlogFooter'
import { BackgroundOrbs } from '../landing/BackgroundOrbs'

interface BlogLayoutProps {
  children: ReactNode
  showBackToBlog?: boolean
}

export function BlogLayout({ children, showBackToBlog = false }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background orbs for consistent styling with homepage */}
      <BackgroundOrbs intensity="normal" />

      <BlogHeader showBackToBlog={showBackToBlog} />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <BlogFooter />
    </div>
  )
}
