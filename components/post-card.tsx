import Link from "next/link"
import { Calendar, Heart, MessageCircle } from "lucide-react"
import { postViewHref } from "@/lib/post-routes"
import { normalizePostBody } from "@/lib/post-content"

interface Post { id: number; title: string; content: string; category_name?: string; slug: string; created_at: string; likes_count: number; comments_count: number }

function plainText(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, " ").replace(/!\[[^\]]*]\([^)]*\)/g, " ").replace(/\[([^\]]+)]\([^)]*\)/g, "$1").replace(/^#{1,6}\s+/gm, "").replace(/[*_`~>|]/g, "").replace(/\s+/g, " ").trim()
}

export function PostCard({ post }: { post: Post }) {
  const excerpt = plainText(normalizePostBody(post.content, post.title))
  return (
    <article className="border-b border-gray-200 bg-white px-1 py-7 first:border-t">
      <div className="mb-2 flex items-center gap-3 text-sm text-gray-500"><span className="font-medium text-blue-600">{post.category_name || "미분류"}</span><span className="text-gray-300">|</span><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(post.created_at).toLocaleDateString("ko-KR")}</span></div>
      <h3 className="text-xl font-bold text-gray-900"><Link href={postViewHref(post.slug)} className="hover:text-blue-600">{post.title}</Link></h3>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{excerpt || "내용이 없습니다."}</p>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500"><div className="flex gap-4"><span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" />{post.likes_count}</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" />{post.comments_count}</span></div><Link href={postViewHref(post.slug)} className="font-medium hover:text-blue-600">계속 읽기 →</Link></div>
    </article>
  )
}
