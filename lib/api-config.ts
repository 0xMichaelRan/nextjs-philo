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
    userLimits: () => `${this.baseUrl}/auth/user/limits`,
    // Password reset endpoints
    resetPasswordRequest: () => `${this.baseUrl}/auth/reset-password-request`,
    resetPasswordConfirm: () => `${this.baseUrl}/auth/reset-password-confirm`,

  }

  // Notification endpoints
  public notifications = {
    list: () => `${this.baseUrl}/notifications`,
    markRead: (id: number) => `${this.baseUrl}/notifications/${id}`,
    markAllRead: () => `${this.baseUrl}/notifications/mark-all-read`,
    markSeen: () => `${this.baseUrl}/notifications/mark-seen`,
    hasNew: () => `${this.baseUrl}/notifications/has-new`,
  }

  // Movie endpoints
  public movies = {
    list: () => `${this.baseUrl}/movies`,
    search: () => `${this.baseUrl}/movies/search`,
    details: (id: string) => `${this.baseUrl}/movies/${id}`,
  }

  // Voice endpoints (using new unified voices system)
  public voices = {
    // Main voice listing endpoint - supports all voice types with filtering
    list: (language?: string, voiceType?: string, userId?: number, includeInactive?: boolean) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      if (voiceType) params.append('voice_type', voiceType)
      if (userId) params.append('user_id', userId.toString())
      if (includeInactive) params.append('include_inactive', 'true')
      const queryString = params.toString()
      return `${this.baseUrl}/voices${queryString ? `?${queryString}` : ''}`
    },
    // System voices only (user_id IS NULL)
    system: (language?: string, includeInactive?: boolean) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      if (includeInactive) params.append('include_inactive', 'true')
      const queryString = params.toString()
      return `${this.baseUrl}/voices/system${queryString ? `?${queryString}` : ''}`
    },
    // Custom voices only (user_id IS NOT NULL)
    custom: (language?: string, userId?: number, includeInactive?: boolean) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      if (userId) params.append('user_id', userId.toString())
      if (includeInactive) params.append('include_inactive', 'true')
      const queryString = params.toString()
      return `${this.baseUrl}/voices/custom${queryString ? `?${queryString}` : ''}`
    },
    // Get voice by VCN (Voice Code Name)
    byVcn: (vcn: string, language?: string) => {
      const params = new URLSearchParams()
      if (language) params.append('language', language)
      const queryString = params.toString()
      return `${this.baseUrl}/voices/${vcn}${queryString ? `?${queryString}` : ''}`
    },

    uploadCustom: () => `${this.baseUrl}/voices/custom`,
    deleteCustom: (id: number) => `${this.baseUrl}/voices/custom/${id}`,
    details: (id: number) => `${this.baseUrl}/voices/${id}`,
  }



  // TTS endpoints
  public tts = {
    providers: () => `${this.baseUrl}/tts-providers`,
    health: () => `${this.baseUrl}/tts-providers/health`,
    validateVoice: () => `${this.baseUrl}/tts-providers/validate-voice`,
    synthesize: () => `${this.baseUrl}/tts-providers/synthesize`,

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
    // New VIP system endpoints
    calculateUpgradePrice: () => `${this.baseUrl}/payments/calculate-upgrade-price`,
    vipStatus: () => `${this.baseUrl}/payments/vip-status`,
  }

  // Video Job endpoints (primary job management)
  public videoJobs = {
    create: () => `${this.baseUrl}/video-jobs/`,
    list: () => `${this.baseUrl}/video-jobs/`,
    details: (id: number) => `${this.baseUrl}/video-jobs/${id}`,
    completed: (movieId?: string, limit?: number) => {
      const params = new URLSearchParams()
      if (movieId) params.append('movie_id', movieId)
      if (limit) params.append('limit', limit.toString())
      const queryString = params.toString()
      return `${this.baseUrl}/video-jobs/completed${queryString ? `?${queryString}` : ''}`
    },
    vipStatus: () => `${this.baseUrl}/video-jobs/vip-status`,
    cancel: (id: number) => `${this.baseUrl}/video-jobs/${id}/cancel`,
    videoUrl: (id: number) => `${this.baseUrl}/video-jobs/${id}/video-url`,
  }

  // Analysis endpoints
  public analysis = {
    createJob: () => `${this.baseUrl}/analysis/jobs`,
    listJobs: () => `${this.baseUrl}/analysis/jobs`,
    getJob: (jobId: number) => `${this.baseUrl}/analysis/jobs/${jobId}`,
    updateJob: (jobId: number) => `${this.baseUrl}/analysis/jobs/${jobId}`,
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
    // TTS audio endpoints
    getTtsAudio: (jobId: number, voiceId: string) => `${this.baseUrl}/analysis/jobs/${jobId}/tts-audio/${voiceId}`,
    generateTtsAudio: (jobId: number) => `${this.baseUrl}/analysis/jobs/${jobId}/generate-tts`,
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
