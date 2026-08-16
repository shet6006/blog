import Link from "next/link"
import { postViewHref } from "@/lib/post-routes"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Heart, MessageCircle } from "lucide-react"
import { resolvePostThumbnail } from "@/lib/post-images"

interface Post {
  id: number
  title: string
  content: string
  category_name?: string
  slug: string
  created_at: string
  likes_count: number
  comments_count: number
  thumbnail_url?: string | null
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const thumbnailUrl = resolvePostThumbnail(post.content, post.thumbnail_url)
  // 마크다운에서 첫 번째 H1 제목 제거 (제목은 이미 카드에 표시됨)
  const contentWithoutTitle = post.content
    .replace(/^#\s+.*?\n\n?/m, '') // 첫 번째 H1 제목 제거
    .replace(/```[\s\S]*?```/g, " 코드 예제 ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  return (
    <article className="group border border-gray-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.035)] transition-all hover:border-gray-400 hover:shadow-[0_12px_34px_rgba(15,23,42,0.065)]">
      <div className={thumbnailUrl ? "md:grid md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]" : ""}>
        {thumbnailUrl && (
          <Link
            href={postViewHref(post.slug)}
            className="block min-h-56 overflow-hidden bg-gray-100 md:min-h-full"
          >
            <img
              src={thumbnailUrl}
              alt={`${post.title} 썸네일`}
              className="h-full max-h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] md:max-h-none"
              loading="lazy"
            />
          </Link>
        )}

        <div className="flex min-h-[300px] min-w-0 flex-col p-7 md:min-h-[340px] md:p-10">
          <div className="mb-7 flex items-start justify-between gap-4">
            <Badge variant="secondary" className="rounded-none bg-transparent px-0 text-sm font-semibold text-blue-600 hover:bg-transparent">
              {post.category_name || "미분류"}
            </Badge>
            <div className="flex shrink-0 items-center text-base text-gray-400">
              <Calendar className="mr-1.5 h-[18px] w-[18px]" />
              {new Date(post.created_at).toLocaleDateString("ko-KR")}
            </div>
          </div>

          <h3 className="mb-5 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-gray-950 md:text-[2rem]">
            <Link href={postViewHref(post.slug)}>{post.title}</Link>
          </h3>

          <p className="mb-8 text-lg leading-8 text-gray-600" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {contentWithoutTitle || "내용이 없습니다."}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <Heart className="h-[18px] w-[18px]" />
                <span className="text-base">{post.likes_count}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-500">
                <MessageCircle className="h-[18px] w-[18px]" />
                <span className="text-base">{post.comments_count}</span>
              </div>
            </div>
            <Link href={postViewHref(post.slug)} className="inline-flex items-center gap-2 text-base font-medium text-blue-600 transition-colors group-hover:text-blue-700">
              계속 읽기 <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
