"use client"

import { useRef } from "react"
import type { MutableRefObject, UIEvent } from "react"
import { Bold, Code2, Heading2, Italic, Link2, List, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownArticle } from "@/components/markdown-article"

interface MarkdownEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  minHeight?: number
  required?: boolean
}

export function MarkdownEditor({ id = "content", value, onChange, textareaRef, minHeight = 640, required }: MarkdownEditorProps) {
  const previewRef = useRef<HTMLDivElement | null>(null)
  const syncingRef = useRef<"editor" | "preview" | null>(null)

  const replaceSelection = (before: string, after = before, placeholder = "텍스트") => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const selected = value.slice(start, end) || placeholder
    onChange(`${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`)
    requestAnimationFrame(() => {
      const selectionStart = start + before.length
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionStart + selected.length)
    })
  }

  const insertLinePrefix = (prefix: string, placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart ?? value.length
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1
    const needsNewLine = lineStart !== start && value.slice(lineStart, start).trim().length > 0
    const insertion = `${needsNewLine ? "\n" : ""}${prefix}${placeholder}`
    onChange(`${value.slice(0, start)}${insertion}${value.slice(start)}`)
    requestAnimationFrame(() => {
      const cursor = start + insertion.length
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const syncScroll = (source: "editor" | "preview", event: UIEvent<HTMLElement>) => {
    if (syncingRef.current === source) return
    const sourceElement = event.currentTarget
    const target = source === "editor" ? previewRef.current : textareaRef.current
    if (!target) return
    const sourceRange = sourceElement.scrollHeight - sourceElement.clientHeight
    const targetRange = target.scrollHeight - target.clientHeight
    const ratio = sourceRange > 0 ? sourceElement.scrollTop / sourceRange : 0
    syncingRef.current = source === "editor" ? "preview" : "editor"
    target.scrollTop = ratio * Math.max(0, targetRange)
    requestAnimationFrame(() => { syncingRef.current = null })
  }

  const toolbar = [
    { label: "소제목", icon: Heading2, action: () => insertLinePrefix("## ", "소제목") },
    { label: "굵게", icon: Bold, action: () => replaceSelection("**", "**") },
    { label: "기울임", icon: Italic, action: () => replaceSelection("*", "*") },
    { label: "인용", icon: Quote, action: () => insertLinePrefix("> ", "인용문") },
    { label: "목록", icon: List, action: () => insertLinePrefix("- ", "목록 항목") },
    { label: "링크", icon: Link2, action: () => replaceSelection("[", "](https://)", "링크 텍스트") },
    { label: "코드", icon: Code2, action: () => replaceSelection("`", "`", "code") },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50/80 px-3 py-2">
        {toolbar.map(({ label, icon: Icon, action }) => (
          <Button key={label} type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:bg-white hover:text-slate-950" aria-label={label} title={label} onClick={action}>
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2" style={{ minHeight }}>
        <div className="border-b border-slate-200 md:border-b-0 md:border-r">
          <Textarea id={id} ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} onScroll={(event) => syncScroll("editor", event)} placeholder="마크다운으로 글을 작성하세요. 본문은 ## 소제목부터 시작하면 읽기 좋습니다." required={required} spellCheck className="h-full min-h-[inherit] resize-none rounded-none border-0 bg-transparent p-6 font-mono text-[15px] leading-7 shadow-none focus-visible:ring-0" style={{ minHeight }} />
        </div>
        <div ref={previewRef} onScroll={(event) => syncScroll("preview", event)} className="markdown-preview overflow-y-auto p-6 md:p-8" style={{ height: minHeight }}>
          <MarkdownArticle content={value || "*여기에 미리보기가 표시됩니다.*"} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-xs text-slate-500">
        <span>양쪽 스크롤이 함께 움직입니다.</span>
        <span>{value.length.toLocaleString("ko-KR")}자</span>
      </div>
    </div>
  )
}
