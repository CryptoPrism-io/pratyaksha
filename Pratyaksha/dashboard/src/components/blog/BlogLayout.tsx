import type { ReactNode } from 'react'
import { BlogHeader } from './BlogHeader'
import { BlogFooter } from './BlogFooter'

interface BlogLayoutProps {
  children: ReactNode
  showBackToBlog?: boolean
}

export function BlogLayout({ children, showBackToBlog = false }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BlogHeader showBackToBlog={showBackToBlog} />
      <main className="flex-1">
        {children}
      </main>
      <BlogFooter />
    </div>
  )
}
