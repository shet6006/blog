import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-sm text-gray-500">
        <span>© {new Date().getFullYear()} DDONG&apos;s Blog</span>
        <div className="flex gap-4"><Link href="/">홈</Link><Link href="/about">소개</Link></div>
      </div>
    </footer>
  )
}
