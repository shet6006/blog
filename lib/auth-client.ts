// 클라이언트 사이드 전용 인증 유틸리티
// 서버 사이드 코드와 분리하여 클라이언트 번들 크기 최적화

export function hasJwtToken() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('token='));
}

