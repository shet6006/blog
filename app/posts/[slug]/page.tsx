import PostPage from "./post-page-client"

export function generateStaticParams() {
  return [{ slug: "__slug__" }]
}

export default function Page() {
  return <PostPage />
}
