#!/bin/bash

# 더 간단한 방법: MySQL에 접속한 후 스키마 실행

echo "📦 데이터베이스 설정"
echo ""
echo "다음 명령어를 복사해서 실행하세요:"
echo ""
echo "mysql -h blog-db.cl0iugwqe9zd.ap-southeast-2.rds.amazonaws.com -u admin -p"
echo ""
echo "접속 후 다음 명령어 실행:"
echo "USE personal_blog;"
echo "SOURCE database/schema.sql;"
echo "EXIT;"
echo ""

