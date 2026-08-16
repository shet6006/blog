export const MAX_POST_IMAGES = 20

const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\((?:<)?([^\s)>]+)(?:>)?(?:\s+["'][^"']*["'])?\)/g

export function getPostImageUrls(content: string): string[] {
  return Array.from(content.matchAll(MARKDOWN_IMAGE_PATTERN), (match) => match[1])
}

export function getPostImageCount(content: string): number {
  return getPostImageUrls(content).length
}

export function resolvePostThumbnail(content: string, thumbnailUrl?: string | null): string | null {
  if (thumbnailUrl === "none") return null
  return thumbnailUrl || getPostImageUrls(content)[0] || null
}
