/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // 외부 이미지 도메인 허용 (필요한 경우)
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'your-cdn-domain.com',
    //   },
    // ],
  },
  // 프로덕션에서 basePath 설정 (필요한 경우만)
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
}

export default nextConfig
