"use client"

// React 19 호환성을 위해 간단한 API 문서 페이지 사용
// swagger-ui-react 대신 커스텀 컴포넌트 사용
export { default } from "./page-simple"

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Blog API",
    version: "1.0.0",
    description: "블로그 API 문서",
  },
  servers: [
    {
      url: "/api",
      description: "API 서버",
    },
  ],
  tags: [
    { name: "Auth", description: "인증 관련 API" },
    { name: "Posts", description: "게시글 관련 API" },
    { name: "Categories", description: "카테고리 관련 API" },
    { name: "Comments", description: "댓글 관련 API" },
    { name: "Admin", description: "관리자 API" },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "로그인",
        description: "관리자 로그인",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "admin" },
                  password: { type: "string", example: "password" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "로그인 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "인증 실패" },
        },
      },
    },
    "/auth/check": {
      get: {
        tags: ["Auth"],
        summary: "인증 상태 확인",
        description: "현재 로그인 상태 확인",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "인증됨",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "인증되지 않음" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "로그아웃",
        description: "로그아웃",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "로그아웃 성공" },
        },
      },
    },
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "게시글 목록 조회",
        description: "게시글 목록을 조회합니다",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" }, description: "카테고리 필터" },
          { name: "search", in: "query", schema: { type: "string" }, description: "검색어" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "페이지 번호" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "페이지당 항목 수" },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["created_at", "likes"], default: "created_at" }, description: "정렬 기준" },
        ],
        responses: {
          200: {
            description: "게시글 목록",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/posts/{slug}": {
      get: {
        tags: ["Posts"],
        summary: "게시글 상세 조회",
        description: "슬러그로 게시글을 조회합니다",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" }, description: "게시글 슬러그" },
        ],
        responses: {
          200: {
            description: "게시글 상세",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Post" },
              },
            },
          },
          404: { description: "게시글을 찾을 수 없음" },
        },
      },
    },
    "/admin/posts": {
      get: {
        tags: ["Admin"],
        summary: "관리자 게시글 목록",
        description: "관리자용 게시글 목록 조회",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          200: {
            description: "게시글 목록",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          401: { description: "인증되지 않음" },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "게시글 작성",
        description: "새 게시글 작성",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content", "category_id"],
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  category_id: { type: "integer" },
                  is_public: { type: "boolean", default: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "게시글 생성 성공" },
          401: { description: "인증되지 않음" },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "카테고리 목록 조회",
        description: "모든 카테고리를 조회합니다",
        responses: {
          200: {
            description: "카테고리 목록",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
      },
    },
    "/comments/{slug}": {
      get: {
        tags: ["Comments"],
        summary: "댓글 목록 조회",
        description: "특정 게시글의 댓글을 조회합니다",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "댓글 목록",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Comment" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "댓글 작성",
        description: "새 댓글을 작성합니다",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["author_name", "content"],
                properties: {
                  author_name: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "댓글 작성 성공" },
        },
      },
    },
    "/stats": {
      get: {
        tags: ["Posts"],
        summary: "통계 조회",
        description: "블로그 통계를 조회합니다",
        responses: {
          200: {
            description: "통계 정보",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalPosts: { type: "integer" },
                    totalLikes: { type: "integer" },
                    totalComments: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT 토큰이 httpOnly 쿠키로 전송됩니다",
      },
    },
    schemas: {
      Post: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          content: { type: "string" },
          excerpt: { type: "string" },
          slug: { type: "string" },
          category_id: { type: "integer" },
          category_name: { type: "string" },
          author_id: { type: "string" },
          is_public: { type: "boolean" },
          likes_count: { type: "integer" },
          comments_count: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          slug: { type: "string" },
          post_count: { type: "integer" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          post_id: { type: "integer" },
          author_name: { type: "string" },
          content: { type: "string" },
          is_admin: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
    },
  },
}

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Swagger UI를 동적으로 로드
    if (typeof window !== "undefined") {
      import("swagger-ui-react").then((SwaggerUIBundle) => {
        const SwaggerUI = SwaggerUIBundle.default
        // Swagger UI 렌더링
        const ui = SwaggerUI({
          spec: swaggerSpec,
          dom_id: "#swagger-ui",
        })
      })
      import("swagger-ui-react/swagger-ui.css")
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">API 문서 로딩 중...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">API 문서</h1>
        <p className="text-gray-600 mb-8">
          블로그 API의 모든 엔드포인트와 사용 방법을 확인할 수 있습니다.
        </p>
        <div id="swagger-ui" className="swagger-ui-container"></div>
      </div>
    </div>
  )
}

