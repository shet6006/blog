#!/bin/bash

# 로컬 MySQL 데이터베이스에서 스키마만 추출하는 스크립트

DB_NAME="blog"
SCHEMA_FILE="database/schema_new.sql"

echo "📤 데이터베이스 스키마 추출 중..."
echo "데이터베이스: $DB_NAME"
echo "출력 파일: $SCHEMA_FILE"
echo ""

# 스키마만 추출 (데이터 제외)
mysqldump -u root -p --no-data $DB_NAME > $SCHEMA_FILE

if [ $? -eq 0 ]; then
    echo "✅ 스키마 추출 완료: $SCHEMA_FILE"
    echo ""
    echo "파일 크기:"
    ls -lh $SCHEMA_FILE
else
    echo "❌ 스키마 추출 실패"
    echo "데이터베이스 이름과 비밀번호를 확인하세요."
    exit 1
fi

