#!/bin/bash

# EC2 앱 상태 확인 스크립트

echo "🔍 EC2 앱 상태 확인"
echo "===================="
echo ""

# 1. PM2 상태
echo "1️⃣ PM2 상태:"
pm2 status
echo ""

# 2. 포트 확인
echo "2️⃣ 포트 3000 확인:"
if netstat -tulpn 2>/dev/null | grep 3000 > /dev/null; then
    echo "✅ 포트 3000 열려있음"
    netstat -tulpn | grep 3000
else
    echo "❌ 포트 3000 안 보임"
    echo "   → 앱이 제대로 시작되지 않았을 수 있음"
fi
echo ""

# 3. 최근 로그
echo "3️⃣ 최근 로그 (마지막 20줄):"
pm2 logs blog --lines 20 --nostream
echo ""

# 4. 환경 변수 확인
echo "4️⃣ 환경 변수 확인:"
if [ -f .env ]; then
    echo "✅ .env 파일 존재"
    echo "DB_HOST 설정 여부:"
    grep -q "DB_HOST" .env && echo "  ✅ DB_HOST 설정됨" || echo "  ❌ DB_HOST 없음"
else
    echo "❌ .env 파일 없음"
fi
echo ""

# 5. 체크리스트
echo "5️⃣ 체크리스트:"
echo "  [ ] EC2 보안 그룹에 포트 3000 규칙 추가"
echo "  [ ] PM2 로그에서 에러 확인"
echo "  [ ] 앱이 정상 실행 중인지 확인"
echo ""

echo "💡 보안 그룹 확인: AWS 콘솔 → EC2 → 인스턴스 → 보안 → 인바운드 규칙"

