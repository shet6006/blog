/**
 * Older posts stored the post title as the first Markdown H1 even though the
 * API already has a dedicated title field. Strip only that exact legacy line.
 * Never search the rest of the document: a `# comment` inside a code block is
 * valid post content and must not become the title.
 */
export function normalizePostBody(content: string | null | undefined, title: string | null | undefined) {
  const body = (content ?? "").replace(/\r\n/g, "\n")
  const normalizedTitle = title?.trim()

  if (!normalizedTitle) return body

  const [firstLine, ...rest] = body.split("\n")
  const firstHeading = firstLine.match(/^#\s+(.+?)\s*$/)

  if (firstHeading?.[1].trim() !== normalizedTitle) return body

  while (rest[0]?.trim() === "") rest.shift()
  return rest.join("\n")
}
