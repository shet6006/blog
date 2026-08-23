import { Suspense } from "react"
import { PageSkeleton } from "@/components/page-skeleton"
import PostPage from "./post-page-client"

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PostPage />
    </Suspense>
  )
}
