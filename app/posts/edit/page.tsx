import { Suspense } from "react"
import { FormSkeleton } from "@/components/page-skeleton"
import EditPostPage from "./edit-post-page-client"

export default function Page() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditPostPage />
    </Suspense>
  )
}
