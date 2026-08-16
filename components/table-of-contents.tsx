"use client"

import { useEffect, useState } from "react"
import type { ArticleHeading } from "@/components/markdown-article"
import { cn } from "@/lib/utils"

export function TableOfContents({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "")

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) setActiveId(visible[0].target.id)
    }, { rootMargin: "-96px 0px -70% 0px" })
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="글 목차" className="rounded-xl border border-slate-200 bg-white/80 p-5 backdrop-blur">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">On this page</p>
      <ol className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} className={cn("block border-l-2 py-1.5 text-sm leading-5 transition-colors", heading.level === 3 ? "pl-6" : "pl-3", activeId === heading.id ? "border-blue-600 font-semibold text-blue-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900")}>
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
