#!/bin/bash

# 데이터베이스 설정 스크립트
# 사용법: bash scripts/setup-database.sh

echo "📦 데이터베이스 스키마 실행 중..."

# 환경 변수에서 설정 읽기 (또는 직접 입력)
DB_HOST="${DB_HOST:-blog-db.cl0iugwqe9zd.ap-southeast-2.rds.amazonaws.com}"
DB_USER="${DB_USER:-admin}"
DB_NAME="${DB_NAME:-personal_blog}"

# 비밀번호 입력
read -sp "MySQL 비밀번호를 입력하세요: " DB_PASSWORD
echo ""

# 스키마 실행
echo "스키마 파일 실행 중..."
mysql -h "$DB_HOST" \
      -u "$DB_USER" \
      -p"$DB_PASSWORD" \
      "$DB_NAME" \
      < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ 스키마 실행 완료!"
else
    echo "❌ 스키마 실행 실패"
    exit 1
fi

