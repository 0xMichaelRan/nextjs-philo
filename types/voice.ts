/**
 * Voice-related types for the frontend
 * Updated to match the new backend philo.new_voices table structure
 */

export interface Voice {
  id: number // Database ID - CANNOT be NULL
  vcn?: string // Voice code name (system voices only)
  display_name: string // Localized display name
  voice_file: string // Voice file path
  is_active: boolean
  is_premium: boolean
  voice_type: "system" | "custom"
  xfyun_vcn: string // VCN to use for Xfyun API calls
  created_at: string
  // Additional fields for frontend compatibility
  language?: string // Language code (zh, en)
  gender?: string // Voice gender
  description?: string // Voice description
  duration?: string // Duration for custom voices
  audio_url?: string // Audio URL for preview
}

export interface VoiceConfig {
  voiceId: number // Database ID
  voiceName: string // Display name
  vcn?: string // Voice code name (null for custom voices)
  voiceLanguage: string
  ttsProvider: string
  speed: number
  voiceType: "system" | "custom"
  xfyunVcn: string // VCN to use for Xfyun API
}

export interface CustomVoiceUpload {
  name_zh: string
  name_en: string
  description?: string
}

export interface VoiceStats {
  total_voices: number
  system_voices: number
  custom_voices: number
  premium_voices: number
  active_voices: number
}
