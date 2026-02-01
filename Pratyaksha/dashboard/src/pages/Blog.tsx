import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { BlogLayout } from '../components/blog'
import { getAllPosts } from '../lib/blog'
import { cn } from '../lib/utils'

export function Blog() {
  const posts = getAllPosts()

  return (
    <BlogLayout>
      <div className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-20 w-80 h-80 bg-rose-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          {/* Page Header - Bold Modern Typography */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span>Insights & Ideas</span>
            </div>
            <h1 className="font-space text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="brand-gradient">Becoming</span> Blog
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Deep dives into transformation, cognitive patterns, and the science of becoming who you want to be.
            </p>
          </div>

          {/* Posts Grid - Glassmorphism Cards */}
          <div className="grid gap-6 sm:gap-8">
            {posts.map((post, index) => (
              <article key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className={cn(
                    "block group glass-feature-card p-6 sm:p-8 card-lift hover-glow",
                    "transition-all duration-300"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium rounded-full glass-teal text-teal-600 dark:text-teal-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title - Bold Modern */}
                  <h2 className="font-space text-xl sm:text-2xl font-semibold mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Meta & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-teal-500/70" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-rose-500/70" />
                        {post.readingTime} min
                      </span>
                    </div>

                    <span className="flex items-center gap-1.5 text-sm font-medium text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-20">
              <div className="glass-feature-card p-12 inline-block">
                <p className="text-muted-foreground text-lg mb-4">No posts yet. Check back soon!</p>
                <p className="text-sm text-muted-foreground/70">
                  We're crafting insights on transformation and cognitive patterns.
                </p>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 sm:mt-20 text-center">
            <div className="glass-feature-card p-8 sm:p-10">
              <h2 className="font-space text-2xl sm:text-3xl font-semibold mb-4 tracking-tight">
                Ready to start your journey?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                See your patterns. Understand your mind. Become who you want to be.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25 transition-all"
              >
                Start Becoming
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BlogLayout>
  )
}
