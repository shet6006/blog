import Link from "next/link"
import { postViewHref } from "@/lib/post-routes"
import type { Post } from "@/lib/models/post"

interface BlogRightRailProps {
  popularPosts: Post[]
  stats: {
    totalPosts?: number
    totalLikes?: number
    totalComments?: number
    totalVisitors?: number
  }
}

export function BlogRightRail({ popularPosts, stats }: BlogRightRailProps) {
  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-tight text-gray-950">인기 글</h3>
        <ol className="border-t border-gray-200">
          {popularPosts.slice(0, 4).map((post, index) => (
            <li key={post.id} className="border-b border-gray-100 py-4">
              <Link href={postViewHref(post.slug)} className="group flex gap-3">
                <span className="text-xs font-semibold tabular-nums text-gray-300">{String(index + 1).padStart(2, "0")}</span>
                <span className="line-clamp-2 text-sm font-medium leading-6 text-gray-700 group-hover:text-gray-950">{post.title}</span>
              </Link>
            </li>
          ))}
          {popularPosts.length === 0 && <li className="py-4 text-sm text-gray-400">표시할 게시글이 없습니다.</li>}
        </ol>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-tight text-gray-950">블로그 통계</h3>
        <dl className="border-t border-gray-200 text-sm">
          {[
            ["게시글", stats.totalPosts],
            ["좋아요", stats.totalLikes],
            ["댓글", stats.totalComments],
            ["방문자", stats.totalVisitors || 0],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-gray-100 py-3">
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-medium tabular-nums text-gray-900">{value ?? 0}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
