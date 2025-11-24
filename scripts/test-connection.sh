#!/bin/bash

# RDS 연결 테스트 스크립트

DB_HOST="blog-db.cl0iugwqe9zd.ap-southeast-2.rds.amazonaws.com"

echo "🔍 RDS 연결 진단"
echo "=================="
echo ""

# 1. 현재 IP 확인
echo "1️⃣ 현재 IP 확인..."
CURRENT_IP=$(curl -s ifconfig.me)
echo "현재 IP: $CURRENT_IP"
echo ""

# 2. 포트 연결 테스트
echo "2️⃣ 포트 3306 연결 테스트..."
if timeout 5 bash -c "echo > /dev/tcp/$DB_HOST/3306" 2>/dev/null; then
    echo "✅ 포트 3306 연결 가능"
else
    echo "❌ 포트 3306 연결 불가 (타임아웃)"
    echo ""
    echo "가능한 원인:"
    echo "  - RDS 보안 그룹에서 IP 허용 안 됨"
    echo "  - RDS가 아직 준비 안 됨"
    echo "  - 네트워크 방화벽 문제"
    echo ""
    echo "해결 방법:"
    echo "  1. AWS 콘솔 → RDS → 보안 그룹 확인"
    echo "  2. 인바운드 규칙에 다음 추가:"
    echo "     - 유형: MySQL/Aurora"
    echo "     - 포트: 3306"
    echo "     - 소스: $CURRENT_IP/32"
fi

echo ""
echo "3️⃣ DNS 확인..."
if nslookup $DB_HOST > /dev/null 2>&1; then
    echo "✅ DNS 해석 성공"
else
    echo "❌ DNS 해석 실패"
fi

echo ""
echo "4️⃣ 연결 테스트 방법:"
echo "export MYSQL_PWD='your_password'"
echo "mysql -h $DB_HOST -u admin -e 'SELECT 1;'"

