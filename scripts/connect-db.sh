#!/bin/bash

# EC2에서 데이터베이스 접근 스크립트
# 사용법: bash scripts/connect-db.sh

echo "🔌 데이터베이스 접근 도구"
echo "========================"
echo ""

# .env 파일에서 설정 읽기
if [ -f ~/blog/.env ]; then
    echo "📄 .env 파일에서 설정 읽는 중..."
    source ~/blog/.env
    
    DB_HOST="${DB_HOST}"
    DB_USER="${DB_USER}"
    DB_NAME="${DB_NAME}"
    DB_PORT="${DB_PORT:-3306}"
else
    echo "⚠️  .env 파일을 찾을 수 없습니다."
    echo "수동으로 입력하세요."
    read -p "DB_HOST: " DB_HOST
    read -p "DB_USER: " DB_USER
    read -p "DB_NAME: " DB_NAME
    DB_PORT="${DB_PORT:-3306}"
fi

if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "❌ 필수 정보가 없습니다."
    exit 1
fi

echo ""
echo "📋 연결 정보:"
echo "  호스트: $DB_HOST"
echo "  사용자: $DB_USER"
echo "  데이터베이스: $DB_NAME"
echo "  포트: $DB_PORT"
echo ""

# MySQL 클라이언트 확인
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL 클라이언트가 설치되지 않았습니다."
    echo ""
    echo "설치 방법:"
    echo "  Amazon Linux: sudo yum install mysql -y"
    echo "  Ubuntu/Debian: sudo apt-get install mysql-client -y"
    exit 1
fi

# 연결 테스트
echo "🔍 연결 테스트 중..."
if timeout 5 bash -c "echo > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
    echo "✅ 포트 $DB_PORT 연결 가능"
else
    echo "❌ 포트 $DB_PORT 연결 불가"
    echo "   → RDS 보안 그룹에서 EC2 IP 허용 확인 필요"
    exit 1
fi

echo ""
echo "💡 사용 방법:"
echo "============"
echo ""
echo "1️⃣ 대화형 MySQL 접속:"
echo "   mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME"
echo ""
echo "2️⃣ 환경 변수로 비밀번호 설정 후 접속:"
echo "   export MYSQL_PWD='your_password'"
echo "   mysql -h $DB_HOST -P $DB_PORT -u $DB_USER $DB_NAME"
echo ""
echo "3️⃣ SQL 명령어 직접 실행:"
echo "   mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e 'SHOW TABLES;'"
echo ""
echo "4️⃣ SQL 파일 실행:"
echo "   mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < file.sql"
echo ""

# 비밀번호가 환경 변수에 있으면 바로 접속 시도
if [ -n "$DB_PASSWORD" ]; then
    echo "🔐 환경 변수에서 비밀번호를 찾았습니다."
    read -p "MySQL에 접속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        export MYSQL_PWD="$DB_PASSWORD"
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME"
    fi
else
    echo "💡 비밀번호를 입력하여 접속:"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME"
fi

