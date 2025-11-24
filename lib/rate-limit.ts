// 간단한 Rate Limiting 구현
// 메모리 기반 (프로덕션에서는 Redis 사용 권장)

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// 주기적으로 오래된 항목 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000) // 1분마다 정리

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1분
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  // 기존 항목이 없거나 시간이 지났으면 초기화
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: store[key].resetTime,
    }
  }

  // 요청 수 증가
  store[key].count++

  // 제한 초과 확인
  if (store[key].count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  }
}

// IP 기반 Rate Limiting
export function getClientIdentifier(request: Request): string {
  // X-Forwarded-For 헤더 확인 (프록시/로드밸런서 뒤에 있을 때)
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  // X-Real-IP 헤더 확인
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // 기본값 (로컬 개발)
  return "unknown"
}

