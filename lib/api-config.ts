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
    checkPhone: () => `${this.baseUrl}/auth/check-phone`,
    // Password reset endpoints
    resetPasswordRequest: () => `${this.baseUrl}/auth/reset-password-request`,
    resetPasswordConfirm: () => `${this.baseUrl}/auth/reset-password-confirm`,
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

  // Voice endpoints (consolidated)
  public voices = {
    // Main voice listing endpoint - supports all voice types with filtering
    list: (language?: string, provider?: string, voiceType?: string) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      if (provider) params.append('provider', provider)
      if (voiceType) params.append('voice_type', voiceType)
      const queryString = params.toString()
      return `${this.baseUrl}/voices${queryString ? `?${queryString}` : ''}`
    },
    // Default/system voices
    default: (language?: string, provider?: string) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      if (provider) params.append('provider', provider)
      const queryString = params.toString()
      return `${this.baseUrl}/voices/default${queryString ? `?${queryString}` : ''}`
    },
    defaultDetails: (voiceCode: string, language?: string) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      const queryString = params.toString()
      return `${this.baseUrl}/voices/default/${voiceCode}${queryString ? `?${queryString}` : ''}`
    },
    // Custom voices (VIP only)
    custom: (language?: string) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      const queryString = params.toString()
      return `${this.baseUrl}/voices/custom${queryString ? `?${queryString}` : ''}`
    },
    uploadCustom: () => `${this.baseUrl}/voices/custom`,
    deleteCustom: (id: number) => `${this.baseUrl}/voices/custom/${id}`,
    // Legacy endpoint for backward compatibility
    details: (id: number) => `${this.baseUrl}/voices/${id}`,
  }

  // Legacy default voices endpoints (deprecated - use voices.default instead)
  public defaultVoices = {
    list: (language?: string, provider?: string) => {
      console.warn('defaultVoices.list is deprecated. Use voices.default instead.')
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      if (provider) params.append('provider', provider)
      const queryString = params.toString()
      return `${this.baseUrl}/voices/default${queryString ? `?${queryString}` : ''}`
    },
    details: (voiceCode: string) => {
      console.warn('defaultVoices.details is deprecated. Use voices.defaultDetails instead.')
      return `${this.baseUrl}/voices/default/${voiceCode}`
    },
    byProvider: (provider: string, language?: string) => {
      console.warn('defaultVoices.byProvider is deprecated. Use voices.default with provider filter instead.')
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      if (provider) params.append('provider', provider)
      const queryString = params.toString()
      return `${this.baseUrl}/voices/default${queryString ? `?${queryString}` : ''}`
    },
  }

  // TTS endpoints
  public tts = {
    providers: () => `${this.baseUrl}/tts-providers`,
    health: () => `${this.baseUrl}/tts-providers/health`,
    validateVoice: () => `${this.baseUrl}/tts-providers/validate-voice`,
    synthesize: () => `${this.baseUrl}/tts-providers/synthesize`,
    // Deprecated: use voices.list with provider filter instead
    voices: (provider?: string, language?: string) => {
      console.warn('tts.voices is deprecated. Use voices.list with provider filter instead.')
      const params = new URLSearchParams()
      if (provider) params.append('provider', provider)
      if (language) params.append('language', language)
      const queryString = params.toString()
      return `${this.baseUrl}/voices${queryString ? `?${queryString}` : ''}`
    },
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
    denounceVip: () => `${this.baseUrl}/payments/denounce-vip`,
    pricing: () => `${this.baseUrl}/payments/pricing`,
  }

  // Job endpoints
  public jobs = {
    base: () => `${this.baseUrl}/jobs`,
    create: () => `${this.baseUrl}/jobs`,
    list: () => `${this.baseUrl}/jobs`,
    details: (id: string) => `${this.baseUrl}/jobs/${id}`,
    update: (id: string) => `${this.baseUrl}/jobs/${id}`,
    submitToQueue: (id: string) => `${this.baseUrl}/jobs/${id}/submit-to-queue`,
    limits: () => `${this.baseUrl}/jobs/limits`,
    vipStatus: () => `${this.baseUrl}/jobs/vip-status`,
  }

  // Analysis endpoints
  public analysis = {
    createJob: () => `${this.baseUrl}/analysis/jobs`,
    listJobs: () => `${this.baseUrl}/analysis/jobs`,
    getJob: (jobId: number) => `${this.baseUrl}/analysis/jobs/${jobId}`,
    listPrompts: (category?: string, language?: string) => {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (language) params.append('language', language)
      const queryString = params.toString()
      return `${this.baseUrl}/analysis/prompts${queryString ? `?${queryString}` : ''}`
    },
    getPromptWithMovieData: (promptId: number, movieId: string, language?: string) => {
      const params = new URLSearchParams()
      params.append('movie_id', movieId)
      if (language) params.append('language', language)
      return `${this.baseUrl}/analysis/prompts/${promptId}?${params.toString()}`
    },
    listModels: () => `${this.baseUrl}/analysis/models`,
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
