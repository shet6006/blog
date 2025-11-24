import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"

// JWT_SECRET 검증 (서버 사이드에서만 실행)
function getJwtSecret(): string {
  if (typeof window !== "undefined") {
    // 클라이언트 사이드에서는 검증하지 않음
    return ""
  }
  
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET 환경 변수가 설정되지 않았습니다.\n" +
      "프로덕션 환경에서는 반드시 강력한 JWT_SECRET을 설정해야 합니다."
    )
  }
  
  return process.env.JWT_SECRET
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export const verifyToken = (token: string) => {
  try {
    const secret = getJwtSecret()
    if (!secret) return null // 클라이언트에서는 검증 불가
    const decoded = jwt.verify(token, secret)
    return decoded
  } catch (error) {
    return null
  }
} 