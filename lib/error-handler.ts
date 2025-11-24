// 에러 처리 유틸리티
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export function handleDatabaseError(error: any): never {
  console.error("Database Error:", error)

  if (error.code === "ER_NO_SUCH_TABLE") {
    throw new DatabaseError("테이블이 존재하지 않습니다. schema.sql을 실행해주세요.")
  }

  if (error.code === "ER_ACCESS_DENIED_ERROR") {
    throw new DatabaseError("데이터베이스 접근이 거부되었습니다. 사용자 권한을 확인해주세요.")
  }

  if (error.code === "ECONNREFUSED") {
    throw new DatabaseError("MySQL 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
  }

  if (error.code === "ER_BAD_DB_ERROR") {
    throw new DatabaseError("데이터베이스가 존재하지 않습니다. personal_blog 데이터베이스를 생성해주세요.")
  }

  throw new DatabaseError("데이터베이스 오류가 발생했습니다.", error)
}

export function validatePostData(data: any) {
  if (!data.title || data.title.trim().length === 0) {
    throw new ValidationError("제목은 필수입니다.")
  }

  if (!data.content || data.content.trim().length === 0) {
    throw new ValidationError("내용은 필수입니다.")
  }

  if (!data.category_id || isNaN(data.category_id)) {
    throw new ValidationError("유효한 카테고리를 선택해주세요.")
  }

  if (data.title.length > 255) {
    throw new ValidationError("제목은 255자를 초과할 수 없습니다.")
  }
}
