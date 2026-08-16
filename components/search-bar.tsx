"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar({ showTitle = true }: { showTitle?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("search") || "")
  useEffect(() => { setQuery(searchParams.get("search") || "") }, [searchParams])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) params.set("search", query.trim())
    else params.delete("search")
    params.set("page", "1")
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      {showTitle && <h3 className="font-semibold text-gray-900">검색</h3>}
      <div className="flex gap-2"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="게시글 검색..." /><Button type="submit" size="sm" variant="outline" aria-label="검색"><Search className="h-4 w-4" /></Button></div>
    </form>
  )
}
