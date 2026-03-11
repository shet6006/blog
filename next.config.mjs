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
  // Next.js는 프론트엔드만 담당. API는 Spring 백엔드(NEXT_PUBLIC_API_URL)로 직접 호출.
}

export default nextConfig
