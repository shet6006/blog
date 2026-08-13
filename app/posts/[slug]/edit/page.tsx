import EditPostPage from "./edit-post-page-client"

export function generateStaticParams() {
  return [{ slug: "__slug__" }]
}

export default function Page() {
  return <EditPostPage />
}
