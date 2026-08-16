# 블로그 프론트엔드

`kimdongwon.me`의 Next.js 15 정적 프론트엔드입니다.

## 로컬 개발

Node.js 20과 npm 10을 사용합니다.

```bash
cp .env.example .env.local
npm ci --legacy-peer-deps
npm run dev
```

Windows에서는 탐색기나 PowerShell로 `.env.example`을 `.env.local`로 복사합니다. 먼저 백엔드를 `http://localhost:8080`에서 실행합니다.

## 운영 방식

`master`에 push하면 GitHub Actions가 정적 export를 S3에 동기화하고 CloudFront 캐시를 무효화합니다. 운영 API는 동일 출처의 `/api/*`를 사용합니다.

프론트엔드 환경 변수는 `NEXT_PUBLIC_API_URL` 하나입니다. 동일 출처를 사용하는 운영에서는 빈 값이며, 프론트와 백엔드를 따로 실행하는 로컬에서는 localhost 백엔드를 가리킵니다.

전체 운영 절차는 백엔드 저장소의
[운영·개발 가이드](https://github.com/shet6006/blog-backend/blob/master/docs/operations.md)에서 관리합니다.
