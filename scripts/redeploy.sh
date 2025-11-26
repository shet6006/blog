"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

interface ApiEndpoint {
  method: string
  path: string
  summary: string
  description: string
  auth?: boolean
  params?: Record<string, string>
  requestBody?: Record<string, string>
  responses: Record<string, string>
  pathParams?: Record<string, string>
}

const apiEndpoints: Record<string, ApiEndpoint[]> = {
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
      pathParams: {
        slug: "게시글 슬러그",
      },
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
      pathParams: {
        slug: "게시글 슬러그",
      },
      responses: {
        200: "댓글 목록",
      },
    },
    {
      method: "POST",
      path: "/api/comments/{slug}",
      summary: "댓글 작성",
      description: "새 댓글을 작성합니다",
      pathParams: {
        slug: "게시글 슬러그",
      },
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

function ApiTestCard({ endpoint, tag }: { endpoint: ApiEndpoint; tag: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [requestInfo, setRequestInfo] = useState<any>(null)
  const [params, setParams] = useState<Record<string, string>>({})
  const [pathParams, setPathParams] = useState<Record<string, string>>({})
  const [requestBody, setRequestBody] = useState<string>("")

  // pathParams 초기화
  if (endpoint.pathParams) {
    Object.keys(endpoint.pathParams).forEach((key) => {
      if (!pathParams[key]) {
        setPathParams((prev) => ({ ...prev, [key]: "" }))
      }
    })
  }

  // requestBody 초기화
  if (endpoint.requestBody && !requestBody) {
    const initialBody: Record<string, any> = {}
    Object.keys(endpoint.requestBody).forEach((key) => {
      if (endpoint.requestBody![key].includes("number")) {
        initialBody[key] = 0
      } else if (endpoint.requestBody![key].includes("boolean")) {
        initialBody[key] = true
      } else {
        initialBody[key] = ""
      }
    })
    setRequestBody(JSON.stringify(initialBody, null, 2))
  }

  const buildUrl = () => {
    let url = endpoint.path
    // Path 파라미터 치환
    if (endpoint.pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, value || `{${key}}`)
      })
    }
    // Query 파라미터 추가
    if (endpoint.params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }
    }
    return url
  }

  const handleTest = async () => {
    setIsLoading(true)
    setResponse(null)
    setRequestInfo(null)

    try {
      const url = buildUrl()
      const startTime = Date.now()

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 자동 전송
      }

      if (endpoint.method !== "GET" && requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody))
        } catch (e) {
          toast.error("요청 본문이 유효한 JSON이 아닙니다")
          setIsLoading(false)
          return
        }
      }

      const response = await fetch(url, options)
      const endTime = Date.now()
      const duration = endTime - startTime

      let responseData: any
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      setRequestInfo({
        method: endpoint.method,
        url,
        headers: Object.fromEntries(response.headers.entries()),
        duration: `${duration}ms`,
      })

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
      })

      if (response.ok) {
        toast.success(`요청 성공 (${response.status})`)
      } else {
        toast.error(`요청 실패 (${response.status})`)
      }
    } catch (error: any) {
      setResponse({
        error: error.message || "요청 중 오류가 발생했습니다",
      })
      toast.error("요청 실패")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("클립보드에 복사되었습니다")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
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
            <CardTitle className="text-lg font-mono break-all">
              {endpoint.path}
            </CardTitle>
            {endpoint.auth && (
              <Badge variant="destructive">인증 필요</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">{endpoint.summary}</h3>
          <p className="text-sm text-gray-600">{endpoint.description}</p>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Path 파라미터 */}
            {endpoint.pathParams && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Path 파라미터:</h4>
                <div className="space-y-2">
                  {Object.entries(endpoint.pathParams).map(([key, desc]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-700">
                        {key} <span className="text-gray-500">({desc})</span>
                      </label>
                      <Input
                        value={pathParams[key] || ""}
                        onChange={(e) =>
                          setPathParams((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder={`예: ${key === "slug" ? "my-post-title" : "value"}`}
                        className="mt-1 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query 파라미터 */}
            {endpoint.params && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Query 파라미터:</h4>
                <div className="space-y-2">
                  {Object.entries(endpoint.params).map(([key, desc]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-700">
                        {key} <span className="text-gray-500">({desc})</span>
                      </label>
                      <Input
                        value={params[key] || ""}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder="선택 사항"
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 요청 본문 */}
            {endpoint.requestBody && (
              <div>
                <h4 className="font-semibold text-sm mb-2">요청 본문 (JSON):</h4>
                <div className="relative">
                  <Textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="font-mono text-sm min-h-[150px]"
                    placeholder={JSON.stringify(endpoint.requestBody, null, 2)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(requestBody)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 테스트 버튼 */}
            <Button
              onClick={handleTest}
              disabled={isLoading}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? "요청 중..." : "API 테스트"}
            </Button>

            {/* 요청 정보 */}
            {requestInfo && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center justify-between">
                  요청 정보
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${requestInfo.method} ${requestInfo.url}\n\nHeaders:\n${JSON.stringify(requestInfo.headers, null, 2)}\n\nDuration: ${requestInfo.duration}`
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </h4>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <div>
                    <span className="font-semibold">Method:</span>{" "}
                    <code className="bg-gray-200 px-1 rounded">
                      {requestInfo.method}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold">URL:</span>{" "}
                    <code className="bg-gray-200 px-1 rounded break-all">
                      {requestInfo.url}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span>{" "}
                    <code className="bg-gray-200 px-1 rounded">
                      {requestInfo.duration}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* 응답 */}
            {response && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center justify-between">
                  응답
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(response, null, 2))
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        response.status >= 200 && response.status < 300
                          ? "default"
                          : "destructive"
                      }
                    >
                      {response.status} {response.statusText}
                    </Badge>
                  </div>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(response.data || response.error, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* 응답 예시 */}
            <div>
              <h4 className="font-semibold text-sm mb-2">예상 응답:</h4>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API 문서</h1>
          <p className="text-gray-600">
            블로그 API의 모든 엔드포인트를 테스트하고 요청/응답을 확인할 수 있습니다.
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
                <ApiTestCard key={index} endpoint={endpoint} tag={tag} />
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
              관리자 API는 인증이 필요합니다. 먼저{" "}
              <code className="bg-gray-100 px-1 rounded">/api/auth/login</code>
              으로 로그인하면 httpOnly 쿠키에 JWT 토큰이 저장됩니다. 이후 요청 시
              브라우저가 자동으로 쿠키를 전송합니다.
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
