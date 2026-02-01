import ReactMarkdown from 'react-markdown'
import type { BlogPost as BlogPostType } from '../../lib/blog'

interface BlogPostProps {
  post: BlogPostType
}

export function BlogPost({ post }: BlogPostProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <header className="mb-8 sm:mb-12">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{post.author}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{post.readingTime} min read</span>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none
        prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:border-border
        prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:not-italic
        prose-ul:text-muted-foreground prose-ol:text-muted-foreground
        prose-li:marker:text-primary
        prose-hr:border-border
      ">
        <ReactMarkdown>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
