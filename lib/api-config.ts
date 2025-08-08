/**
 * API Configuration class for managing backend API URLs
 * Uses environment variable NEXT_PUBLIC_API_URL
 */
class ApiConfig {
  private static instance: ApiConfig
  private baseUrl: string

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8009'
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
    uploadAvatar: () => `${this.baseUrl}/auth/upload-avatar`,
    paymentHistory: () => `${this.baseUrl}/auth/payment-history`,
    changePassword: () => `${this.baseUrl}/auth/change-password`,
    sendVerificationCode: () => `${this.baseUrl}/auth/send-verification-code`,
    verifyPhoneNumber: () => `${this.baseUrl}/auth/verify-phone-number`,
    // Legacy endpoints (deprecated)
    forgotPassword: () => `${this.baseUrl}/auth/forgot-password`,
    resetPassword: () => `${this.baseUrl}/auth/reset-password`,
  }

  // Notification endpoints
  public notifications = {
    list: () => `${this.baseUrl}/notifications`,
    markRead: (id: number) => `${this.baseUrl}/notifications/${id}`,
    markAllRead: () => `${this.baseUrl}/notifications/mark-all-read`,
  }

  // Movie endpoints
  public movies = {
    list: () => `${this.baseUrl}/movies`,
    search: () => `${this.baseUrl}/movies/search`,
    details: (id: string) => `${this.baseUrl}/movies/${id}`,
  }

  // Voice endpoints
  public voices = {
    list: () => `${this.baseUrl}/voices`,
    custom: () => `${this.baseUrl}/voices/custom`,
    deleteCustom: (id: number) => `${this.baseUrl}/voices/custom/${id}`,
    details: (id: number) => `${this.baseUrl}/voices/${id}`,
  }

  // Script endpoints (to be implemented)
  public scripts = {
    generate: () => `${this.baseUrl}/scripts/generate`,
    list: () => `${this.baseUrl}/scripts`,
    details: (id: number) => `${this.baseUrl}/scripts/${id}`,
    update: (id: number) => `${this.baseUrl}/scripts/${id}`,
  }

  // Video endpoints (to be implemented)
  public videos = {
    generate: () => `${this.baseUrl}/videos/generate`,
    list: () => `${this.baseUrl}/videos`,
    details: (id: number) => `${this.baseUrl}/videos/${id}`,
    status: (id: number) => `${this.baseUrl}/videos/${id}/status`,
  }

  // Payment endpoints
  public payments = {
    checkout: () => `${this.baseUrl}/payments/checkout`,
    complete: (paymentId: number) => `${this.baseUrl}/payments/${paymentId}/complete`,
    mockComplete: () => `${this.baseUrl}/payments/mock-complete`,
    confirm: (paymentId: number) => `${this.baseUrl}/payments/confirm/${paymentId}`,
    history: () => `${this.baseUrl}/payments/history`,
    subscription: () => `${this.baseUrl}/payments/subscription`,
    validatePromo: () => `${this.baseUrl}/payments/validate-promo`,
  }

  // Job endpoints
  public jobs = {
    create: () => `${this.baseUrl}/jobs`,
    list: () => `${this.baseUrl}/jobs`,
    details: (id: string) => `${this.baseUrl}/jobs/${id}`,
    update: (id: string) => `${this.baseUrl}/jobs/${id}`,
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
