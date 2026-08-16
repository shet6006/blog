export interface Post {
  id: number
  title: string
  content: string
  excerpt: string
  category_id: number
  category_name?: string
  slug: string
  github_commit_url?: string | null
  is_public: boolean
  author_id: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
}
