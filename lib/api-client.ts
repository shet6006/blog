// Spring 백엔드 API base URL (.env.local의 NEXT_PUBLIC_API_URL)
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || ""
}

// 프론트엔드에서 사용할 API 클라이언트 (Spring 백엔드 직접 호출)
class ApiClient {
  private get baseUrl() {
    return `${getApiBaseUrl()}/api`
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    // GET은 Content-Type 생략 → simple request로 preflight 방지. POST/PUT/DELETE는 JSON 필요
    const needsJson = options?.method && !["GET", "HEAD"].includes(options.method)
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> || {}),
    }
    if (needsJson && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // 쿠키 자동 전송
    })

    if (response.status === 401) {
      // 로그인 페이지로 리다이렉트 (클라이언트 컴포넌트에서만)
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      throw new Error("Unauthorized")
    }

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorMessage
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  // Posts
  async getPosts(params?: {
    category?: string
    search?: string
    page?: number
    limit?: number
    includePrivate?: boolean
    sortBy?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set("category", params.category)
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.includePrivate) searchParams.set("includePrivate", "true")
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)

    return this.request(`${this.baseUrl}/posts?${searchParams}`)
  }

  async getPostBySlug(slug: string) {
    return this.request(`${this.baseUrl}/posts/${slug}`)
  }

  async createPost(postData: any) {
    return this.request(`${this.baseUrl}/posts`, {
      method: "POST",
      body: JSON.stringify(postData),
    })
  }

  async updatePost(slug: string, updates: any) {
    return this.request(`${this.baseUrl}/posts/${slug}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deletePost(slug: string) {
    return this.request(`${this.baseUrl}/posts/${slug}`, {
      method: "DELETE",
    })
  }

  // Categories
  async getCategories() {
    return this.request(`${this.baseUrl}/categories`)
  }

  async createCategory(name: string) {
    return this.request(`${this.baseUrl}/categories`, {
      method: "POST",
      body: JSON.stringify({ name }),
    })
  }

  // Comments
  async getComments(slug: string) {
    return this.request(`${this.baseUrl}/comments/${slug}`)
  }

  async createComment(slug: string, commentData: {
    authorName: string
    content: string
    deviceId: string
  }) {
    return this.request(`${this.baseUrl}/comments/${slug}`, {
      method: "POST",
      body: JSON.stringify(commentData),
    })
  }

  async deleteComment(slug: string) {
    return this.request(`${this.baseUrl}/comments/${slug}`, {
      method: "DELETE",
    })
  }

  // Likes
  async getLikeStatus(slug: string, deviceId: string) {
    return this.request(`${this.baseUrl}/posts/${slug}/likes?deviceId=${deviceId}`)
  }

  async toggleLike(slug: string, deviceId: string) {
    return this.request(`${this.baseUrl}/posts/${slug}/likes`, {
      method: "POST",
      body: JSON.stringify({ deviceId }),
    })
  }

  // Admin
  async getStats() {
    return this.request(`${this.baseUrl}/stats`)
  }

  async getAdminProfile() {
    return this.request(`${this.baseUrl}/admin/profile`)
  }

  async updateAdminProfile(updates: any) {
    return this.request(`${this.baseUrl}/admin/profile`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }
}

export const apiClient = new ApiClient()
