import { Suspense } from "react"
import PostPage from "./post-page-client"

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PostPage />
    </Suspense>
  )
}
