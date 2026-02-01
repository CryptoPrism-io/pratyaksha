import { useParams, Navigate } from 'react-router-dom'
import { BlogLayout, BlogPost } from '../components/blog'
import { getPostBySlug } from '../lib/blog'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  return (
    <BlogLayout showBackToBlog>
      <BlogPost post={post} />
    </BlogLayout>
  )
}
