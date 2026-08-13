# 블로그 프론트엔드

`kimdongwon.me`의 Next.js 프론트엔드입니다.

## 로컬 개발

Node.js 20과 npm 10을 사용합니다. OneDrive 동기화가 큰 `node_modules` 폴더를 잠글 수 있으므로 Mac에서는 `~/Projects` 같은 일반 작업 폴더에 복제하는 것을 권장합니다.

```bash
cp .env.example .env.local
npm ci --legacy-peer-deps
npm run dev
```

Windows에서는 탐색기나 PowerShell로 `.env.example`을 `.env.local`로 복사합니다. 먼저 백엔드를 `http://localhost:8080`에서 실행합니다.

## 운영 방식

기존 운영은 PM2의 `next start`였지만 이 브랜치는 정적 export 결과물을 Nginx 이미지로 제공합니다. Nginx는 정적 파일을 제공하고 `/api/*` 요청을 백엔드 컨테이너로 전달합니다. 임의 게시글 상세·수정 URL도 컨테이너 검증 과정에서 테스트합니다.

프론트엔드 환경 변수는 `NEXT_PUBLIC_API_URL` 하나입니다. 동일 출처를 사용하는 운영에서는 빈 값이며, 프론트와 백엔드를 따로 실행하는 로컬에서는 localhost 백엔드를 가리킵니다.
