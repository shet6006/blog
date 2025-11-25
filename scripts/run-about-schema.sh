#!/bin/bash

# 소개 페이지 스키마 실행 스크립트
# 사용법: bash scripts/run-about-schema.sh

DB_HOST="blog-db.cl0iugwqe9zd.ap-southeast-2.rds.amazonaws.com"
DB_USER="admin"
DB_NAME="blog"

# .env에서 비밀번호 읽기
if [ -f ~/blog/.env ]; then
    DB_PASSWORD=$(grep "^DB_PASSWORD=" ~/blog/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "비밀번호를 입력하세요:"
    mysql -h "$DB_HOST" -P 3306 -u "$DB_USER" -p "$DB_NAME" < database/about_page_schema.sql
else
    echo "소개 페이지 스키마 실행 중..."
    export MYSQL_PWD="$DB_PASSWORD"
    mysql -h "$DB_HOST" -P 3306 -u "$DB_USER" "$DB_NAME" < database/about_page_schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ 스키마 실행 완료!"
    else
        echo "❌ 스키마 실행 실패"
        exit 1
    fi
fi

