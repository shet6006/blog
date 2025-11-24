// 입력 검증 유틸리티

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  // 길이 제한
  let sanitized = input.substring(0, maxLength)

  // HTML 태그 제거 (XSS 방지)
  sanitized = sanitized.replace(/<[^>]*>/g, "")

  // 특수 문자 이스케이프
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")

  return sanitized.trim()
}

export function validateSlug(slug: string): boolean {
  // slug는 영문, 숫자, 하이픈만 허용
  return /^[a-z0-9가-힣-]+$/.test(slug) && slug.length <= 255
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

export function validateContent(content: string, maxLength: number = 100000): {
  valid: boolean
  sanitized: string
  error?: string
} {
  if (!content || typeof content !== "string") {
    return { valid: false, sanitized: "", error: "내용이 필요합니다." }
  }

  if (content.length > maxLength) {
    return { valid: false, sanitized: "", error: `내용이 너무 깁니다. (최대 ${maxLength}자)` }
  }

  // 기본적인 XSS 방지 (마크다운은 허용)
  const sanitized = content.trim()

  return { valid: true, sanitized }
}

export function validateAuthorName(name: string): {
  valid: boolean
  sanitized: string
  error?: string
} {
  if (!name || typeof name !== "string") {
    return { valid: false, sanitized: "", error: "이름이 필요합니다." }
  }

  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return { valid: false, sanitized: "", error: "이름이 비어있습니다." }
  }

  if (trimmed.length > 100) {
    return { valid: false, sanitized: "", error: "이름이 너무 깁니다. (최대 100자)" }
  }

  // HTML 태그 제거
  const sanitized = trimmed.replace(/<[^>]*>/g, "")

  return { valid: true, sanitized }
}

export function validateDeviceId(deviceId: string): boolean {
  // deviceId는 영문, 숫자, 하이픈, 언더스코어만 허용
  return /^[a-zA-Z0-9_-]+$/.test(deviceId) && deviceId.length <= 100
}

export function validatePageNumber(page: number | string | null): number {
  const num = typeof page === "string" ? Number.parseInt(page, 10) : page
  if (!Number.isInteger(num) || num < 1) {
    return 1
  }
  if (num > 1000) {
    return 1000 // 최대 1000페이지
  }
  return num
}

export function validateLimit(limit: number | string | null, maxLimit: number = 100): number {
  const num = typeof limit === "string" ? Number.parseInt(limit, 10) : limit
  if (!Number.isInteger(num) || num < 1) {
    return 10
  }
  if (num > maxLimit) {
    return maxLimit
  }
  return num
}

