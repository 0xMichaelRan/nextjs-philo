/**
 * Unified VideoJob interface for the frontend
 * Removes duplicated interfaces and standardizes voice-related fields
 */

import { MovieTitleData } from "@/lib/movie-utils"

export interface VideoJob extends MovieTitleData {
  id: number
  user_id: number
  analysis_job_id: number
  movie_id: string
  movie_title?: string
  movie_title_en?: string
  movie_title_zh?: string
  movie_title_json?: { en?: string; zh?: string }
  tts_text: string
  
  // Voice fields - updated to match new backend structure
  voice_id?: number // Database ID from philo.new_voices
  vcn?: string // Voice code name (null for custom voices)
  voice_display_name?: string // Display name
  
  // Job status and results
  status: string
  result_video_url?: string
  result_script_url?: string
  video_url?: string
  thumbnail_url?: string
  error_message?: string
  resolution: string
  speed: number // TTS speed (0-100)
  video_duration?: number // Video duration in seconds
  
  // Timestamps
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface MovieData {
  id: string
  title: string
  title_en: string
  title_zh?: string
  year?: number
  genre: string[]
  director?: string
  backdrop_url?: string
  poster_url?: string
  imdb_rating?: number
  overview?: string
  runtime?: number
  release_date?: string
}
