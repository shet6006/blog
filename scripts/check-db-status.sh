#!/bin/bash

# 데이터베이스 연결 문제 진단 스크립트

DB_HOST="blog-db.cl0iugwqe9zd.ap-southeast-2.rds.amazonaws.com"
DB_USER="admin"

echo "🔍 데이터베이스 연결 진단"
echo "=========================="
echo ""

# 1. 포트 연결 확인
echo "1️⃣ 포트 3306 연결 확인..."
if timeout 5 bash -c "echo > /dev/tcp/$DB_HOST/3306" 2>/dev/null; then
    echo "✅ 포트 3306 연결 가능"
else
    echo "❌ 포트 3306 연결 불가"
    echo "   → 네트워크 문제 또는 RDS 상태 확인 필요"
fi

# 2. DNS 확인
echo ""
echo "2️⃣ DNS 확인..."
if nslookup $DB_HOST > /dev/null 2>&1; then
    echo "✅ DNS 해석 성공"
    nslookup $DB_HOST | grep -A 2 "Name:"
else
    echo "❌ DNS 해석 실패"
fi

# 3. MySQL 클라이언트 확인
echo ""
echo "3️⃣ MySQL 클라이언트 확인..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL 클라이언트 설치됨"
    mysql --version
else
    echo "❌ MySQL 클라이언트 미설치"
    echo "   설치: sudo apt install mysql-client"
fi

# 4. 연결 테스트 (비밀번호 필요)
echo ""
echo "4️⃣ 연결 테스트 방법:"
echo ""
echo "방법 1: 비밀번호를 명령어에 포함"
echo "mysql -h $DB_HOST -u $DB_USER -p'your_password'"
echo ""
echo "방법 2: 환경 변수 사용"
echo "export MYSQL_PWD='your_password'"
echo "mysql -h $DB_HOST -u $DB_USER"
echo ""
echo "방법 3: 타임아웃 설정"
echo "mysql -h $DB_HOST -u $DB_USER -p --connect-timeout=10"

