#!/bin/bash

# AWS EC2에 Next.js 앱을 배포하는 스크립트
# 사용법: bash ec2-setup.sh

echo "🚀 AWS EC2 배포 스크립트 시작"

# Node.js 설치
echo "📦 Node.js 설치 중..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# PM2 설치
echo "📦 PM2 설치 중..."
npm install -g pm2

# Git 설치
echo "📦 Git 설치 중..."
sudo yum install git -y

# 프로젝트 디렉토리로 이동
cd ~

# 프로젝트 클론 (또는 이미 있다면 스킵)
if [ ! -d "blog" ]; then
    echo "📥 프로젝트 클론 중..."
    git clone https://github.com/your-username/your-repo.git blog
fi

cd blog

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 환경 변수 파일 확인
if [ ! -f ".env" ]; then
    echo "⚠️  .env 파일이 없습니다. 생성해주세요."
    echo "다음 명령어로 생성하세요:"
    echo "nano .env"
    exit 1
fi

# 빌드
echo "🔨 빌드 중..."
npm run build

# PM2로 앱 시작
echo "🚀 앱 시작 중..."
pm2 start npm --name "blog" -- start
pm2 save
pm2 startup

echo "✅ 배포 완료!"
echo "앱이 http://localhost:3000 에서 실행 중입니다."
echo "PM2 상태 확인: pm2 status"
echo "로그 확인: pm2 logs blog"

