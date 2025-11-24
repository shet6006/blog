#!/bin/bash

# 로컬 MySQL DB를 덤프하는 스크립트

DB_NAME="blog"
DUMP_FILE="blog_dump.sql"

echo "📤 로컬 MySQL DB 덤프 중..."
echo "데이터베이스: $DB_NAME"
echo ""

# 덤프 실행
mysqldump -u root -p $DB_NAME > $DUMP_FILE

if [ $? -eq 0 ]; then
    echo "✅ 덤프 완료: $DUMP_FILE"
    echo ""
    echo "다음 단계:"
    echo "1. EC2로 전송: scp -i blog-key.pem $DUMP_FILE ec2-user@13.239.11.230:~/"
    echo "2. RDS에 복원: mysql -h [RDS_HOST] -u admin -p blog < $DUMP_FILE"
else
    echo "❌ 덤프 실패"
    exit 1
fi

