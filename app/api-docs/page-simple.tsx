"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const apiEndpoints = {
  Auth: [
    {
      method: "POST",
      path: "/api/auth/login",
      summary: "로그인",
      description: "관리자 로그인",
      requestBody: {
        username: "string",
        password: "string",
      },
      responses: {
        200: "로그인 성공",
        401: "인증 실패",
      },
    },
    {
      method: "GET",
      path: "/api/auth/check",
      summary: "인증 상태 확인",
      description: "현재 로그인 상태 확인",
      auth: true,
      responses: {
        200: "인증됨",
        401: "인증되지 않음",
      },
    },
    {
      method: "POST",
      path: "/api/auth/logout",
      summary: "로그아웃",
      description: "로그아웃",
      auth: true,
      responses: {
        200: "로그아웃 성공",
      },
    },
  ],
  Posts: [
    {
      method: "GET",
      path: "/api/posts",
      summary: "게시글 목록 조회",
      description: "게시글 목록을 조회합니다",
      params: {
        category: "카테고리 필터 (선택)",
        search: "검색어 (선택)",
        page: "페이지 번호 (기본: 1)",
        limit: "페이지당 항목 수 (기본: 10)",
        sortBy: "정렬 기준 (created_at 또는 likes)",
      },
      responses: {
        200: "게시글 목록",
      },
    },
    {
      method: "GET",
      path: "/api/posts/{slug}",
      summary: "게시글 상세 조회",
      description: "슬러그로 게시글을 조회합니다",
      responses: {
        200: "게시글 상세",
        404: "게시글을 찾을 수 없음",
      },
    },
    {
      method: "GET",
      path: "/api/stats",
      summary: "통계 조회",
      description: "블로그 통계를 조회합니다",
      responses: {
        200: "통계 정보 (totalPosts, totalLikes, totalComments)",
      },
    },
  ],
  Categories: [
    {
      method: "GET",
      path: "/api/categories",
      summary: "카테고리 목록 조회",
      description: "모든 카테고리를 조회합니다",
      responses: {
        200: "카테고리 목록",
      },
    },
  ],
  Comments: [
    {
      method: "GET",
      path: "/api/comments/{slug}",
      summary: "댓글 목록 조회",
      description: "특정 게시글의 댓글을 조회합니다",
      responses: {
        200: "댓글 목록",
      },
    },
    {
      method: "POST",
      path: "/api/comments/{slug}",
      summary: "댓글 작성",
      description: "새 댓글을 작성합니다",
      requestBody: {
        author_name: "string",
        content: "string",
      },
      responses: {
        200: "댓글 작성 성공",
      },
    },
  ],
  Admin: [
    {
      method: "GET",
      path: "/api/admin/posts",
      summary: "관리자 게시글 목록",
      description: "관리자용 게시글 목록 조회",
      auth: true,
      params: {
        page: "페이지 번호 (기본: 1)",
        limit: "페이지당 항목 수 (기본: 10)",
      },
      responses: {
        200: "게시글 목록",
        401: "인증되지 않음",
      },
    },
    {
      method: "POST",
      path: "/api/admin/posts",
      summary: "게시글 작성",
      description: "새 게시글 작성",
      auth: true,
      requestBody: {
        title: "string (필수)",
        content: "string (필수)",
        category_id: "number (필수)",
        is_public: "boolean (기본: true)",
      },
      responses: {
        200: "게시글 생성 성공",
        401: "인증되지 않음",
      },
    },
    {
      method: "GET",
      path: "/api/admin/categories",
      summary: "관리자 카테고리 목록",
      description: "관리자용 카테고리 목록 조회",
      auth: true,
      responses: {
        200: "카테고리 목록",
        401: "인증되지 않음",
      },
    },
    {
      method: "GET",
      path: "/api/admin/comments",
      summary: "관리자 댓글 목록",
      description: "관리자용 댓글 목록 조회",
      auth: true,
      responses: {
        200: "댓글 목록",
        401: "인증되지 않음",
      },
    },
  ],
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API 문서</h1>
          <p className="text-gray-600">
            블로그 API의 모든 엔드포인트와 사용 방법을 확인할 수 있습니다.
          </p>
        </div>

        <Tabs defaultValue="Auth" className="space-y-6">
          <TabsList>
            {Object.keys(apiEndpoints).map((tag) => (
              <TabsTrigger key={tag} value={tag}>
                {tag}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(apiEndpoints).map(([tag, endpoints]) => (
            <TabsContent key={tag} value={tag} className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            endpoint.method === "GET"
                              ? "default"
                              : endpoint.method === "POST"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <CardTitle className="text-lg font-mono">
                          {endpoint.path}
                        </CardTitle>
                        {endpoint.auth && (
                          <Badge variant="destructive">인증 필요</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-1">{endpoint.summary}</h3>
                      <p className="text-sm text-gray-600">
                        {endpoint.description}
                      </p>
                    </div>

                    {endpoint.params && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">파라미터:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                          {Object.entries(endpoint.params).map(([key, value]) => (
                            <li key={key}>
                              <code className="bg-gray-100 px-1 rounded">{key}</code>: {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {endpoint.requestBody && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">요청 본문:</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                          {JSON.stringify(endpoint.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-sm mb-2">응답:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                        {Object.entries(endpoint.responses).map(([code, desc]) => (
                          <li key={code}>
                            <Badge variant="outline" className="mr-2">
                              {code}
                            </Badge>
                            {desc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>인증 방법</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              관리자 API는 인증이 필요합니다. 먼저 <code className="bg-gray-100 px-1 rounded">/api/auth/login</code>으로 로그인하면
              httpOnly 쿠키에 JWT 토큰이 저장됩니다. 이후 요청 시 브라우저가 자동으로 쿠키를 전송합니다.
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p className="font-semibold mb-1">토큰 만료 시간:</p>
              <p>1시간 (로그인 후 1시간이 지나면 자동으로 만료됩니다)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

