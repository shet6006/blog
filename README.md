# Blog frontend

Next.js frontend for `kimdongwon.me`.

## Local development

Use Node.js 20 and npm 10. Clone outside OneDrive because its sync client can
lock the large `node_modules` directory during clean installs.

```bash
cp .env.example .env.local
npm ci --legacy-peer-deps
npm run dev
```

On Windows, copy `.env.example` to `.env.local` using Explorer or PowerShell.
Start the backend at `http://localhost:8080` first.

## Production direction

Production currently runs `next start` under PM2. The target is a static export
served by Nginx. Most pages already fetch data in the browser, but the two
dynamic routes under `app/posts/[slug]` require adaptation and regression tests
before static export can replace the server safely.

Only `NEXT_PUBLIC_API_URL` is part of the frontend environment contract. It is
empty in same-origin production and points to localhost in split local
development.
