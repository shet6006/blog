import { Suspense } from "react"
import EditPostPage from "./edit-post-page-client"

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <EditPostPage />
    </Suspense>
  )
}
