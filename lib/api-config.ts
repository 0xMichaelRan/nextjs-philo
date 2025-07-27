/**
 * API Configuration class for managing backend API URLs
 * Uses environment variable NEXT_PUBLIC_API_URL
 */
class ApiConfig {
  private static instance: ApiConfig
  private baseUrl: string

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig()
    }
    return ApiConfig.instance
  }

  // Base URL getter
  public getBaseUrl(): string {
    return this.baseUrl
  }

  // Auth endpoints
  public auth = {
    login: () => `${this.baseUrl}/auth/login`,
    register: () => `${this.baseUrl}/auth/register`,
    logout: () => `${this.baseUrl}/auth/logout`,
    user: () => `${this.baseUrl}/auth/user`,
    updateUser: () => `${this.baseUrl}/auth/user`,
    uploadAvatar: () => `${this.baseUrl}/auth/avatar`,
    paymentHistory: () => `${this.baseUrl}/auth/payment-history`,
    forgotPassword: () => `${this.baseUrl}/auth/forgot-password`,
  }

  // Notification endpoints
  public notifications = {
    list: () => `${this.baseUrl}/notifications`,
    markRead: (id: number) => `${this.baseUrl}/notifications/${id}/read`,
    markAllRead: () => `${this.baseUrl}/notifications/read`,
  }

  // Movie endpoints
  public movies = {
    list: () => `${this.baseUrl}/movies`,
    search: () => `${this.baseUrl}/movies/search`,
    details: (id: string) => `${this.baseUrl}/movies/${id}`,
  }

  // Script endpoints
  public scripts = {
    generate: () => `${this.baseUrl}/scripts/generate`,
    list: () => `${this.baseUrl}/scripts`,
    details: (id: number) => `${this.baseUrl}/scripts/${id}`,
    update: (id: number) => `${this.baseUrl}/scripts/${id}`,
  }

  // Voice endpoints
  public voices = {
    list: () => `${this.baseUrl}/voices`,
    custom: () => `${this.baseUrl}/voices/custom`,
    details: (id: number) => `${this.baseUrl}/voices/${id}`,
  }

  // Video endpoints
  public videos = {
    generate: () => `${this.baseUrl}/videos/generate`,
    list: () => `${this.baseUrl}/videos`,
    details: (id: number) => `${this.baseUrl}/videos/${id}`,
    status: (id: number) => `${this.baseUrl}/videos/${id}/status`,
  }

  // Payment endpoints
  public payments = {
    create: () => `${this.baseUrl}/payments/create`,
    checkout: () => `${this.baseUrl}/payments/checkout`,
    validatePromo: () => `${this.baseUrl}/payments/validate-promo`,
    verify: () => `${this.baseUrl}/payments/verify`,
    history: () => `${this.baseUrl}/payments/history`,
  }

  // Utility method to get authorization headers
  public getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  // Utility method for making authenticated requests
  public async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }
}

// Export singleton instance
export const apiConfig = ApiConfig.getInstance()

// Export the class for testing purposes
export default ApiConfig
