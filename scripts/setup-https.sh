#!/bin/bash

# HTTPS 설정 스크립트 (Let's Encrypt 사용)
# 사용법: sudo bash setup-https.sh your-domain.com

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ 도메인을 입력해주세요."
    echo "사용법: sudo bash setup-https.sh your-domain.com"
    exit 1
fi

echo "🔒 HTTPS 설정 시작"
echo "도메인: $DOMAIN"
echo "================================"

# Certbot 설치 확인 및 설치
echo ""
echo "📦 Certbot 설치 확인 중..."
if ! command -v certbot &> /dev/null; then
    echo "Certbot이 설치되어 있지 않습니다. 설치 중..."
    
    # OS 확인
    if [ -f /etc/redhat-release ]; then
        # Amazon Linux / CentOS / RHEL
        sudo yum install -y epel-release
        sudo yum install -y certbot python3-certbot-nginx
    elif [ -f /etc/debian_version ]; then
        # Ubuntu / Debian
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    else
        echo "❌ 지원하지 않는 OS입니다. 수동으로 Certbot을 설치해주세요."
        exit 1
    fi
else
    echo "✅ Certbot이 이미 설치되어 있습니다."
fi

# Nginx가 실행 중인지 확인
if ! systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx가 실행되지 않습니다. 시작 중..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# 방화벽 포트 확인
echo ""
echo "🔥 방화벽 포트 확인 중..."
if command -v firewall-cmd &> /dev/null; then
    echo "firewall-cmd를 사용하여 포트를 열고 있습니다..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
elif command -v ufw &> /dev/null; then
    echo "ufw를 사용하여 포트를 열고 있습니다..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw reload
else
    echo "⚠️  방화벽 설정 도구를 찾을 수 없습니다. 수동으로 포트 80과 443을 열어주세요."
fi

# SSL 인증서 발급
echo ""
echo "🔐 SSL 인증서 발급 중..."
echo "⚠️  도메인이 이 서버를 가리키고 있어야 합니다!"
echo "⚠️  DNS A 레코드가 이 서버의 IP를 가리키는지 확인하세요."
read -p "계속하시겠습니까? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "취소되었습니다."
    exit 1
fi

# Certbot으로 인증서 발급 및 Nginx 자동 설정
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL 인증서 발급 및 설정 완료!"
    echo ""
    echo "📋 다음 단계:"
    echo "1. .env 파일에 다음을 추가하세요:"
    echo "   COOKIE_SECURE=true"
    echo "   COOKIE_SAME_SITE=lax"
    echo ""
    echo "2. Next.js 앱을 재시작하세요:"
    echo "   pm2 restart blog"
    echo ""
    echo "3. 브라우저에서 https://$DOMAIN 으로 접속하여 확인하세요."
    echo ""
    echo "🔄 인증서 자동 갱신 설정:"
    echo "   sudo certbot renew --dry-run"
else
    echo ""
    echo "❌ SSL 인증서 발급에 실패했습니다."
    echo "다음을 확인하세요:"
    echo "1. 도메인이 이 서버의 IP를 가리키는지 확인"
    echo "2. 포트 80이 열려있는지 확인"
    echo "3. Nginx가 정상적으로 실행 중인지 확인"
    exit 1
fi

