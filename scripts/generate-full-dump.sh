#!/bin/bash

# 로컬 MySQL 데이터베이스에서 스키마 + 데이터 모두 추출하는 스크립트

DB_NAME="blog"
DUMP_FILE="database/schema_with_data.sql"

echo "📤 데이터베이스 스키마 + 데이터 추출 중..."
echo "데이터베이스: $DB_NAME"
echo "출력 파일: $DUMP_FILE"
echo ""

# 스키마 + 데이터 모두 추출
mysqldump -u root -p $DB_NAME > $DUMP_FILE

if [ $? -eq 0 ]; then
    echo "✅ 추출 완료: $DUMP_FILE"
    echo ""
    echo "파일 크기:"
    ls -lh $DUMP_FILE
    echo ""
    echo "다음 단계:"
    echo "1. EC2로 전송: scp -i blog-key.pem $DUMP_FILE ec2-user@13.239.11.230:~/blog/"
    echo "2. RDS에 복원: mysql -h [RDS_HOST] -u admin -p blog < $DUMP_FILE"
else
    echo "❌ 추출 실패"
    echo "데이터베이스 이름과 비밀번호를 확인하세요."
    exit 1
fi

