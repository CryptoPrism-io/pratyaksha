export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  excerpt: string
  tags: string[]
  content: string
  readingTime: number
}

// Import all markdown files from content/blog
const blogModules = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Simple frontmatter parser (no external dependencies)
function parseFrontmatter(rawContent: string): { data: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = rawContent.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content: rawContent }
  }

  const [, frontmatterStr, content] = match
  const data: Record<string, unknown> = {}

  // Parse simple YAML-like frontmatter
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) return

    const key = line.slice(0, colonIndex).trim()
    let value: unknown = line.slice(colonIndex + 1).trim()

    // Remove quotes
    if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
      value = (value as string).slice(1, -1)
    }

    // Parse arrays like ["tag1", "tag2"]
    if ((value as string).startsWith('[') && (value as string).endsWith(']')) {
      const arrayContent = (value as string).slice(1, -1)
      value = arrayContent
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    }

    if (key) {
      data[key] = value
    }
  })

  return { data, content: content.trim() }
}

function parsePost(filename: string, rawContent: string): BlogPost {
  const { data, content } = parseFrontmatter(rawContent)

  return {
    slug: (data.slug as string) || filename.replace('../content/blog/', '').replace('.md', ''),
    title: (data.title as string) || 'Untitled',
    date: (data.date as string) || new Date().toISOString().split('T')[0],
    author: (data.author as string) || 'Becoming Team',
    excerpt: (data.excerpt as string) || content.slice(0, 150) + '...',
    tags: (data.tags as string[]) || [],
    content,
    readingTime: calculateReadingTime(content),
  }
}

export function getAllPosts(): BlogPost[] {
  const posts = Object.entries(blogModules).map(([path, content]) => {
    return parsePost(path, content)
  })

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts()
  return posts.find(post => post.slug === slug)
}

export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllPosts()
  return posts.filter(post => post.tags.includes(tag))
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tagsSet = new Set<string>()
  posts.forEach(post => post.tags.forEach(tag => tagsSet.add(tag)))
  return Array.from(tagsSet).sort()
}
