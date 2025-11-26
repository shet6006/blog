#!/bin/bash

# EC2에서 앱 재배포 스크립트
# 사용법: bash scripts/redeploy.sh

set -e

echo "🚀 앱 재배포 시작"
echo "=================="
echo ""

# 프로젝트 디렉토리로 이동
cd ~/blog || {
    echo "❌ ~/blog 디렉토리를 찾을 수 없습니다."
    exit 1
}

# Git 상태 확인
echo "📥 최신 코드 가져오기..."
git fetch origin

# 변경사항 확인
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ 이미 최신 버전입니다."
else
    echo "🔄 변경사항이 있습니다. 업데이트 중..."
    git pull origin main || git pull origin master
fi

# Node.js 버전 확인 및 설정
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20 2>/dev/null || nvm use node
fi

# 의존성 설치
echo ""
echo "📦 의존성 설치 중..."
npm install --legacy-peer-deps

# 환경 변수 파일 확인
if [ ! -f ".env" ]; then
    echo "⚠️  .env 파일이 없습니다!"
    echo "기존 .env 파일이 있는지 확인하세요."
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 이전 빌드 삭제 (깨끗한 빌드를 위해)
echo ""
echo "🧹 이전 빌드 삭제 중..."
rm -rf .next
rm -rf node_modules/.cache

# 빌드
echo ""
echo "🔨 빌드 중..."
NODE_ENV=production npm run build

# 빌드 성공 확인
if [ ! -d ".next" ]; then
    echo "❌ 빌드 실패: .next 디렉토리가 생성되지 않았습니다."
    exit 1
fi

# 빌드된 청크 파일 확인
echo ""
echo "📋 빌드된 파일 확인 중..."
if [ -d ".next/static/chunks/app/admin/write" ]; then
    echo "✅ /admin/write 청크 파일 확인됨"
    ls -la .next/static/chunks/app/admin/write/ | head -5
else
    echo "⚠️  /admin/write 청크 파일을 찾을 수 없습니다."
fi

if [ -d ".next/static/chunks/app/admin/dashboard" ]; then
    echo "✅ /admin/dashboard 청크 파일 확인됨"
    ls -la .next/static/chunks/app/admin/dashboard/ | head -5
else
    echo "⚠️  /admin/dashboard 청크 파일을 찾을 수 없습니다."
fi

# PM2 재시작
echo ""
echo "🔄 PM2 재시작 중..."
pm2 restart blog || pm2 start npm --name "blog" -- start

# PM2 저장
pm2 save

echo ""
echo "✅ 재배포 완료!"
echo ""
echo "📊 앱 상태 확인:"
pm2 status
echo ""
echo "📋 로그 확인: pm2 logs blog"
echo "📋 실시간 로그: pm2 logs blog --lines 50"

