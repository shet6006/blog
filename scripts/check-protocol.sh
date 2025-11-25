#!/bin/bash

# 배포 환경이 HTTP인지 HTTPS인지 확인하는 스크립트

echo "🔍 배포 환경 프로토콜 확인"
echo "================================"

# Nginx 설정 파일 확인
if [ -f "/etc/nginx/conf.d/blog.conf" ]; then
    echo ""
    echo "📄 Nginx 설정 파일 확인:"
    echo "------------------------"
    grep -E "listen|ssl_certificate|ssl_certificate_key" /etc/nginx/conf.d/blog.conf || echo "설정 파일을 찾을 수 없습니다."
    
    # HTTPS 설정 확인
    if grep -q "listen 443" /etc/nginx/conf.d/blog.conf || grep -q "ssl_certificate" /etc/nginx/conf.d/blog.conf; then
        echo ""
        echo "✅ HTTPS가 설정되어 있습니다!"
    elif grep -q "listen 80" /etc/nginx/conf.d/blog.conf; then
        echo ""
        echo "⚠️  HTTP만 설정되어 있습니다 (포트 80)"
    fi
fi

# Nginx 프로세스 확인
echo ""
echo "📊 Nginx 프로세스 확인:"
echo "------------------------"
if pgrep nginx > /dev/null; then
    echo "✅ Nginx가 실행 중입니다"
    sudo netstat -tlnp | grep nginx || echo "포트 정보를 확인할 수 없습니다"
else
    echo "❌ Nginx가 실행되지 않습니다"
fi

# 환경 변수 확인
echo ""
echo "🔧 환경 변수 확인:"
echo "------------------------"
if [ -f "$HOME/blog/.env" ]; then
    echo "COOKIE_SECURE 설정:"
    grep "COOKIE_SECURE" "$HOME/blog/.env" || echo "  COOKIE_SECURE가 설정되지 않았습니다"
    echo ""
    echo "COOKIE_SAME_SITE 설정:"
    grep "COOKIE_SAME_SITE" "$HOME/blog/.env" || echo "  COOKIE_SAME_SITE가 설정되지 않았습니다"
else
    echo "⚠️  .env 파일을 찾을 수 없습니다: $HOME/blog/.env"
fi

echo ""
echo "================================"
echo "💡 권장 사항:"
echo "  - HTTP 사용 시: COOKIE_SECURE=false"
echo "  - HTTPS 사용 시: COOKIE_SECURE=true"
echo "================================"

