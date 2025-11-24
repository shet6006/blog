import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Heart, MessageCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Post {
  id: number
  title: string
  content: string
  category_name?: string
  slug: string
  created_at: string
  likes_count: number
  comments_count: number
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  // HTML 태그 제거 및 내용 요약
  const excerpt = post.content
    .replace(/<[^>]*>/g, "")
    .replace(/\n/g, " ")
    .trim()
    .slice(0, 150) + (post.content.length > 150 ? "..." : "")

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            {post.category_name || "미분류"}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>

        <div className="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {excerpt}
          </ReactMarkdown>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{post.likes_count}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments_count}</span>
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href={`/posts/${post.slug}`}>읽어보기</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
