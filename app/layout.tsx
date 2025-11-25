import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: '개발자 블로그',
  description: '웹 개발, TypeScript, React 등 프론트엔드 기술에 대한 경험과 인사이트를 공유합니다.',
  generator: 'Next.js',
  charset: 'utf-8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
