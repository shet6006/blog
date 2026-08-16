import Link from "next/link"
import { ArrowUpRight, Github } from "lucide-react"
import { Header } from "@/components/header"

const technologies = ["Next.js", "TypeScript", "Spring Boot", "MySQL", "AWS", "Docker"]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Header />

      <main className="mx-auto max-w-[1120px] px-5 py-16 lg:px-8 lg:py-24">
        <header className="max-w-3xl border-b border-gray-200 pb-12">
          <p className="mb-4 text-sm font-semibold text-blue-600">Portfolio</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.045em] md:text-6xl">
            만들고 운영하며<br />배운 것들을 기록합니다.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-500">
            직접 설계하고 개발한 프로젝트와 운영 과정에서 해결한 문제를 정리합니다.
          </p>
        </header>

        <section className="py-12">
          <div className="mb-7 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">프로젝트</h2>
            <span className="text-sm text-gray-400">01</span>
          </div>

          <article className="grid gap-8 border-y border-gray-200 py-10 md:grid-cols-[1fr_1.25fr] md:gap-14">
            <div>
              <p className="mb-3 text-sm font-medium text-blue-600">개인 프로젝트</p>
              <h3 className="text-3xl font-semibold tracking-[-0.035em]">DDONG&apos;s Blog</h3>
              <p className="mt-4 text-sm text-gray-400">기획 · 개발 · 배포 · 운영</p>
            </div>

            <div>
              <p className="text-base leading-8 text-gray-600">
                글 작성과 분류, 댓글과 좋아요, 관리자 기능을 갖춘 기술 블로그입니다. 프론트엔드와 백엔드를 분리하고 AWS 환경에 직접 배포해 운영하고 있습니다.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="사용 기술">
                {technologies.map((technology) => (
                  <li key={technology} className="border border-gray-200 px-3 py-1.5 text-xs text-gray-600">{technology}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-5 text-sm font-medium">
                <Link href="/" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700">
                  블로그 보기 <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a href="https://github.com/shet6006/blog-frontend" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-950">
                  <Github className="h-4 w-4" /> 프론트엔드
                </a>
                <a href="https://github.com/shet6006/blog-backend" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-950">
                  <Github className="h-4 w-4" /> 백엔드
                </a>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
