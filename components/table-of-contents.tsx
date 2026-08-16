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
    <nav aria-label="글 목차">
      <p className="mb-3 text-sm font-semibold tracking-tight text-slate-950">목차</p>
      <ol className="border-t border-slate-200">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} className={cn("block border-b border-slate-100 py-3 text-sm leading-5 transition-colors", heading.level === 3 ? "pl-4" : "pl-0", activeId === heading.id ? "font-semibold text-blue-600" : "text-slate-500 hover:text-slate-900")}>
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
