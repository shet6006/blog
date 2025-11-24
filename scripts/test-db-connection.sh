#!/bin/bash

# 데이터베이스 연결 테스트 스크립트

DB_HOST="blog-db.cl0iugwqe9zd.ap-southeast-2.rds.amazonaws.com"
DB_USER="admin"

echo "🔍 데이터베이스 연결 테스트 중..."
echo ""

# 1. 네트워크 연결 확인
echo "1️⃣ 네트워크 연결 확인..."
if ping -c 1 $DB_HOST > /dev/null 2>&1; then
    echo "✅ 네트워크 연결 성공"
else
    echo "❌ 네트워크 연결 실패 (ping 실패는 정상일 수 있음)"
fi

# 2. 포트 연결 확인
echo ""
echo "2️⃣ 포트 3306 연결 확인..."
if timeout 5 bash -c "echo > /dev/tcp/$DB_HOST/3306" 2>/dev/null; then
    echo "✅ 포트 3306 연결 가능"
else
    echo "❌ 포트 3306 연결 불가"
    echo "   → RDS 보안 그룹에서 본인 IP 허용 확인 필요"
fi

# 3. MySQL 클라이언트 확인
echo ""
echo "3️⃣ MySQL 클라이언트 확인..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL 클라이언트 설치됨"
    mysql --version
else
    echo "❌ MySQL 클라이언트가 설치되지 않음"
    echo "   설치 명령어:"
    echo "   sudo apt update && sudo apt install mysql-client"
fi

# 4. 연결 테스트 (비밀번호 입력 필요)
echo ""
echo "4️⃣ MySQL 연결 테스트..."
echo "   다음 명령어로 연결 테스트:"
echo "   mysql -h $DB_HOST -u $DB_USER -p"
echo ""
echo "   또는 비밀번호를 직접 입력:"
echo "   mysql -h $DB_HOST -u $DB_USER -p'your_password'"

