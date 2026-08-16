"use client"

import { Children, isValidElement, useMemo, useState } from "react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ArticleHeading {
  id: string
  text: string
  level: 2 | 3
}

function textFromChildren(children: ReactNode): string {
  return Children.toArray(children).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child)
    if (isValidElement<{ children?: ReactNode }>(child)) return textFromChildren(child.props.children)
    return ""
  }).join("")
}

function baseSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "section"
}

function createSlugger() {
  const counts = new Map<string, number>()
  return (text: string) => {
    const base = baseSlug(text)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    return count === 0 ? base : `${base}-${count + 1}`
  }
}

export function extractArticleHeadings(markdown: string): ArticleHeading[] {
  const slug = createSlugger()
  const headings: ArticleHeading[] = []
  let inFence = false

  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = line.match(/^(#|##|###)\s+(.+?)\s*#*\s*$/)
    if (!match) continue
    const text = match[2].replace(/\[([^\]]+)]\([^)]*\)/g, "$1").replace(/[*_`~]/g, "").trim()
    headings.push({ id: slug(text), text, level: match[1].length === 3 ? 3 : 2 })
  }
  return headings
}

function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const [copied, setCopied] = useState(false)
  const code = textFromChildren(children).replace(/\n$/, "")
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="code-block group">
      <button type="button" onClick={copy} className="code-copy" aria-label="코드 복사">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "복사됨" : "복사"}
      </button>
      <pre {...props}>{children}</pre>
    </div>
  )
}

export function MarkdownArticle({ content, className }: { content: string; className?: string }) {
  const components = useMemo(() => {
    const slug = createSlugger()
    return {
      h1: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => <h2 id={slug(textFromChildren(children))} {...props}>{children}</h2>,
      h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => <h2 id={slug(textFromChildren(children))} {...props}>{children}</h2>,
      h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => <h3 id={slug(textFromChildren(children))} {...props}>{children}</h3>,
      pre: CodeBlock,
      a: ({ children, ...props }: ComponentPropsWithoutRef<"a">) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
    }
  }, [content])

  return (
    <div className={cn("article-body prose prose-slate prose-lg max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
