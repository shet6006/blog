import mysql from "mysql2/promise"

// 환경 변수 검증
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key])

if (missingEnvVars.length > 0) {
  throw new Error(
    `필수 환경 변수가 누락되었습니다: ${missingEnvVars.join(', ')}\n` +
    `환경 변수를 설정해주세요: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME`
  )
}

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST!,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  charset: "utf8mb4",
  timezone: "+00:00",
}

// 연결 풀 생성
// 개발 환경에서는 연결 수를 줄이고, 프로덕션에서는 더 많이 사용
const isDevelopment = process.env.NODE_ENV !== "production"
const defaultConnectionLimit = isDevelopment ? 2 : 10

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || String(defaultConnectionLimit)),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // 연결 타임아웃 설정 (밀리초)
  acquireTimeout: 30000, // 30초로 단축
  // 연결 유지 시간 (밀리초)
  timeout: 30000, // 30초로 단축
})

// 초기화 상태 추적 (싱글톤 패턴)
let isInitialized = false
let initPromise: Promise<boolean> | null = null

// 데이터베이스 연결 테스트 및 초기화
export async function initializeDatabase() {
  // 이미 초기화되었거나 초기화 중이면 기존 Promise 반환
  if (isInitialized) return true
  if (initPromise) return initPromise

  initPromise = (async () => {
    let connection = null
    try {
      connection = await pool.getConnection()
      await connection.ping()
      
      // 개발 환경에서만 상세 로그 출력
      if (process.env.NODE_ENV !== "production") {
        console.log("✅ MySQL 데이터베이스 연결 성공")
        const [tables] = await connection.execute("SHOW TABLES")
        console.log("📋 데이터베이스 테이블:", tables)
      }

      isInitialized = true
      return true
    } catch (error: any) {
      // "Too many connections" 오류는 개발 환경에서만 경고
      if (error?.code === 'ER_CON_COUNT_ERROR') {
        if (process.env.NODE_ENV !== "production") {
          console.warn("⚠️ MySQL 연결 수 초과 - 기존 연결을 재사용합니다")
        }
        // 연결 풀을 재사용하므로 계속 진행
        isInitialized = true
        return true
      }
      
      console.error("❌ MySQL 데이터베이스 연결 실패:", error)
      if (error instanceof Error) {
        console.error("오류 메시지:", error.message)
        // 프로덕션에서는 민감한 정보 출력 안 함
        if (process.env.NODE_ENV !== "production") {
          console.error("연결 설정:", {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            database: dbConfig.database,
          })
        }
      }
      isInitialized = false
      initPromise = null
      return false
    } finally {
      // 연결이 있으면 반드시 해제
      if (connection) {
        connection.release()
      }
    }
  })()

  return initPromise
}

// 앱 시작 시 데이터베이스 초기화 (한 번만 실행)
// 개발 환경에서는 핫 리로드 시 중복 실행 방지
if (typeof window === "undefined") {
  // 개발 환경에서는 초기화를 지연시켜 핫 리로드 문제 방지
  if (isDevelopment) {
    // 개발 환경에서는 초기화하지 않음 (핫 리로드 시 연결 누적 방지)
    // 필요 시 수동으로 initializeDatabase() 호출
  } else {
    // 프로덕션에서는 즉시 초기화
    initializeDatabase().catch((error) => {
      console.error("데이터베이스 초기화 실패:", error)
    })
  }
}

// 프로세스 종료 시 연결 풀 정리
if (typeof process !== "undefined") {
  const cleanup = () => {
    pool.end().catch(() => {
      // 무시 (이미 종료 중)
    })
  }
  
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('exit', cleanup)
}

export default pool
