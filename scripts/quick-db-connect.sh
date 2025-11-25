#!/bin/bash

# 간단한 데이터베이스 접속 스크립트
# 사용법: bash scripts/quick-db-connect.sh

DB_HOST="blog-db.cl0iugwqe9zd.ap-southeast-2.rds.amazonaws.com"
DB_USER="admin"
DB_NAME="blog"

# .env에서 비밀번호 읽기
if [ -f ~/blog/.env ]; then
    DB_PASSWORD=$(grep "^DB_PASSWORD=" ~/blog/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "비밀번호를 입력하세요:"
    mysql -h "$DB_HOST" -P 3306 -u "$DB_USER" -p "$DB_NAME"
else
    echo "데이터베이스에 접속 중..."
    export MYSQL_PWD="$DB_PASSWORD"
    mysql -h "$DB_HOST" -P 3306 -u "$DB_USER" "$DB_NAME"
fi

