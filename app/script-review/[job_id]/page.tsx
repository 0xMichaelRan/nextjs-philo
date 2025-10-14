"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Pause, Edit, RefreshCw, ArrowRight, ArrowLeft, AlertTriangle, X, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { MovieHeader } from "@/components/movie-header"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"
import { getStandardThemeClasses } from "@/lib/theme-utils"
import { useToast } from "@/hooks/use-toast"
import { useFlow } from "@/hooks/use-flow"
import { getQiniuBackdropUrl } from "@/lib/qiniu-config"

interface MovieData {
  id: string
  title: string
  title_zh?: string
  title_en?: string
  tagline?: string
}

interface ContentBlock {
  type: 'entries' | 'clean'
  title: string
  content: string
}

interface AnalysisJob {
  id: number
  movie_id: string
  status: string
  progress: number
  analysis_result?: string
  tts_audio_file_path?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export default function ScriptReviewPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.job_id as string
  const { flowState, updateFlowState } = useFlow()
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showLimitsModal, setShowLimitsModal] = useState(false)
  const [jobLimits, setJobLimits] = useState<any>(null)
  const [voiceConfig, setVoiceConfig] = useState<any>(null)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [llmResponse, setLlmResponse] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!jobId) {
      router.push('/job-pending')
      return
    }

    // Fetch analysis job data
    fetchAnalysisJob()
  }, [jobId, router])

  const fetchAnalysisJob = async () => {
    try {
      setLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.getJob(parseInt(jobId)),
        { method: 'GET' }
      )

      if (response.ok) {
        const job = await response.json()
        setAnalysisJob(job)
        
        // Prioritize edited text from flow state, fallback to job result
        const textToUse = flowState.analysisResult || job.analysis_result
        if (textToUse) {
          setLlmResponse(textToUse)
        }

        if (job.movie_id) {
          await fetchMovieData(job.movie_id)
        }

        // Update flow state (preserve existing analysisResult if it exists)
        updateFlowState({
          analysisJobId: job.id,
          movieId: job.movie_id,
          analysisResult: flowState.analysisResult || job.analysis_result
        })
      } else {
        throw new Error('Failed to fetch analysis job')
      }
    } catch (error) {
      console.error('Error fetching analysis job:', error)
      toast({
        title: language === "zh" ? "错误" : "Error",
        description: language === "zh" ? "获取分析任务失败" : "Failed to fetch analysis job",
        variant: "destructive"
      })
      router.push('/job-pending')
    } finally {
      setLoading(false)
    }
  }

  const fetchMovieData = async (movieId: string) => {
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.movies.details(movieId),
        { method: 'GET' }
      )

      if (response.ok) {
        const movie = await response.json()
        setMovieData(movie)
      }
    } catch (error) {
      console.error('Error fetching movie data:', error)
    }
  }

  // Set voice config from flow state
  useEffect(() => {
    if (flowState.voiceId && (!voiceConfig || voiceConfig.voiceId !== flowState.voiceId)) {
      const newVoiceConfig = {
        voiceId: flowState.voiceId,
        voiceName: flowState.voiceName,
        vcn: flowState.vcn,  // Use vcn instead of voiceCode
        voiceLanguage: flowState.voiceLanguage,
        ttsProvider: flowState.ttsProvider || 'xfyun',
        speed: flowState.speed || 50
      }

      console.log("Script-review - Flow state voice data:", {
        voiceId: flowState.voiceId,
        vcn: flowState.vcn,
        voiceName: flowState.voiceName,
        ttsProvider: flowState.ttsProvider
      })
      console.log("Script-review - Final voice config:", newVoiceConfig)

      setVoiceConfig(newVoiceConfig)
    } else if (!voiceConfig && !flowState.voiceId && analysisJob?.id) {
      // Fallback: Set default voice config if none exists
      console.log("No voice config in flow state, setting default voice config")
      const defaultVoiceConfig = {
        voiceId: null,
        voiceName: language === "zh" ? "默认语音" : "Default Voice",
        vcn: 'x4_yezi',  // Default xfyun voice
        voiceLanguage: 'zh',
        ttsProvider: 'xfyun',
        speed: 50
      }
      setVoiceConfig(defaultVoiceConfig)
    }
  }, [flowState, analysisJob, language])

  // Auto-generate TTS when analysis result is available and voice is configured
  useEffect(() => {
    if (llmResponse && voiceConfig && !isGenerating && !generatedAudioUrl) {
      console.log("Auto-generating TTS for analysis result...")
      generateTTSAudio()
    }
  }, [llmResponse, voiceConfig])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setAudioProgress(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [generatedAudioUrl])

  const generateTTSAudio = async () => {
    if (!voiceConfig) {
      console.error("TTS generation failed: No voice configuration available")
      console.log("Current flow state:", flowState)
      toast({
        title: language === "zh" ? "错误" : "Error",
        description: language === "zh" ? "缺少语音配置，请返回语音选择页面" : "Missing voice configuration, please return to voice selection",
        variant: "destructive"
      })
      return
    }

    if (!llmResponse) {
      console.error("TTS generation failed: No analysis result available")
      toast({
        title: language === "zh" ? "错误" : "Error",
        description: language === "zh" ? "缺少分析结果" : "Missing analysis result",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)
      
      // First, check if TTS audio already exists for this analysis job with the current voice
      if (analysisJob?.id) {
        const currentVoiceId = voiceConfig.voiceId
        const ttsAudioUrl = `${apiConfig.getBaseUrl()}/static/tts-audio/aj${analysisJob.id}/${currentVoiceId}.wav`

        try {
          const audioCheckResponse = await fetch(ttsAudioUrl)
          if (audioCheckResponse.ok) {
            console.log(`Using cached TTS audio for voice: ${currentVoiceId}`)
            setGeneratedAudioUrl(ttsAudioUrl)
            toast({
              title: language === "zh" ? "成功" : "Success",
              description: language === "zh" ? "已加载保存的语音" : "Loaded saved audio"
            })
            return
          }
        } catch (audioCheckError) {
          console.log(`Cached TTS audio not found for voice ${currentVoiceId}, generating new audio...`)
        }
      }

      // If we have an analysis job ID, try to generate and save TTS audio
      if (analysisJob?.id) {
        // For default voice case, we need to get a valid voice ID from the backend
        // For now, we'll use a fallback approach with VCN directly
        if (!voiceConfig.voiceId && voiceConfig.vcn) {
          console.log("Using VCN-based TTS generation as fallback...")
          // Use the direct TTS synthesis endpoint instead
          const ttsRequest = {
            text: llmResponse.substring(0, 7888),
            provider: voiceConfig.ttsProvider,
            voice_type: 'system',
            language: 'zh',
            voice_id: voiceConfig.vcn,
            speed: voiceConfig.speed || 50
          }

          const response = await apiConfig.makeAuthenticatedRequest(apiConfig.tts.synthesize(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ttsRequest)
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.audio_data) {
              const audioData = atob(result.audio_data)
              const audioArray = new Uint8Array(audioData.length)
              for (let i = 0; i < audioData.length; i++) {
                audioArray[i] = audioData.charCodeAt(i)
              }

              const mimeType = result.audio_format === 'wav' ? 'audio/wav' :
                              result.audio_format === 'mp3' ? 'audio/mpeg' :
                              result.audio_format === 'aac' ? 'audio/aac' :
                              result.audio_format === 'ogg' ? 'audio/ogg' :
                              'audio/wav'

              const audioBlob = new Blob([audioArray], { type: mimeType })
              const audioUrl = URL.createObjectURL(audioBlob)
              setGeneratedAudioUrl(audioUrl)

              toast({
                title: language === "zh" ? "成功" : "Success",
                description: language === "zh" ? "语音生成完成" : "Audio generated successfully"
              })
              return
            }
          }
          // If VCN-based generation fails, continue with the original approach
        }

        const generateTtsRequest = {
          voice_id: voiceConfig.voiceId || 1, // Use a default voice ID if null
          voice_type: voiceConfig.voiceId ? 'system' : 'custom',
          language: 'zh',
          provider: voiceConfig.ttsProvider || 'xfyun',
          speed: voiceConfig.speed || 50
        }

        console.log("TTS Generation - Frontend request:", generateTtsRequest)
        console.log("TTS Generation - Voice config:", voiceConfig)

        try {
          const generateResponse = await apiConfig.makeAuthenticatedRequest(
            apiConfig.analysis.generateTtsAudio(analysisJob.id),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(generateTtsRequest)
            }
          )

          if (generateResponse.ok) {
            const result = await generateResponse.json()
            if (result.tts_audio_url) {
              const fullAudioUrl = `${apiConfig.getBaseUrl()}${result.tts_audio_url}`
              setGeneratedAudioUrl(fullAudioUrl)

              toast({
                title: language === "zh" ? "成功" : "Success",
                description: language === "zh" ? "语音生成并保存完成" : "Audio generated and saved successfully"
              })
              return
            }
          }
        } catch (saveError) {
          console.log("Could not save TTS audio, falling back to temporary generation...")
        }
      }

      // Fallback: Generate TTS audio without saving (original method)
      const ttsRequest = {
        text: llmResponse.substring(0, 7888),
        provider: voiceConfig.ttsProvider,
        voice_type: 'system',  // Simplified - we'll handle custom voices differently
        language: 'zh',
        voice_id: voiceConfig.vcn || 'x4_yezi',  // Use VCN for system voices
        speed: voiceConfig.speed || 50
      }

      const response = await apiConfig.makeAuthenticatedRequest(apiConfig.tts.synthesize(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ttsRequest)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.audio_data) {
          const audioData = atob(result.audio_data)
          const audioArray = new Uint8Array(audioData.length)
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i)
          }

          const mimeType = result.audio_format === 'wav' ? 'audio/wav' :
                          result.audio_format === 'mp3' ? 'audio/mpeg' :
                          result.audio_format === 'aac' ? 'audio/aac' :
                          result.audio_format === 'ogg' ? 'audio/ogg' :
                          'audio/wav'

          const audioBlob = new Blob([audioArray], { type: mimeType })
          const audioUrl = URL.createObjectURL(audioBlob)
          setGeneratedAudioUrl(audioUrl)

          toast({
            title: language === "zh" ? "成功" : "Success",
            description: language === "zh" ? "语音生成完成" : "Audio generated successfully"
          })
        } else {
          throw new Error(result.error_message || "TTS generation failed")
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "TTS generation failed")
      }
    } catch (error) {
      console.error("TTS generation error:", error)
      toast({
        title: language === "zh" ? "错误" : "Error",
        description: language === "zh" ? "语音生成失败" : "Failed to generate audio",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = () => {
    if (!voiceConfig) {
      toast({
        title: language === "zh" ? "提示" : "Notice",
        description: language === "zh" ? "请先选择语音配置" : "Please select voice configuration first",
        variant: "default"
      })
      router.push(`/voice-selection/${jobId}`)
      return
    }

    if (!generatedAudioUrl && !isGenerating) {
      generateTTSAudio()
      return
    }

    if (isPlaying) {
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    } else {
      setIsPlaying(true)
      if (audioRef.current && generatedAudioUrl) {
        audioRef.current.src = generatedAudioUrl
        audioRef.current.play()
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * audioDuration

    audioRef.current.currentTime = newTime
    setAudioProgress(percentage * 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleGenerateVideo = async () => {
    if (!analysisJob || !movieData || !user) {
      if (!user) {
        router.push('/auth')
        return
      }

      toast({
        title: language === "zh" ? "错误" : "Error",
        description: language === "zh" ? "缺少必要数据" : "Missing required data",
        variant: "destructive"
      })
      return
    }

    try {
      // Check VIP status and job limits using new system
      const vipStatusResponse = await apiConfig.makeAuthenticatedRequest(
        apiConfig.payments.vipStatus(),
        { method: 'GET' }
      )

      if (vipStatusResponse.ok) {
        const vipStatus = await vipStatusResponse.json()
        const status = vipStatus.vip_status

        // Get user limits from auth endpoint
        const limitsResponse = await apiConfig.makeAuthenticatedRequest(
          apiConfig.auth.userLimits(),
          { method: 'GET' }
        )

        if (limitsResponse.ok) {
          const limits = await limitsResponse.json()

          // Check if user can create more jobs using backend response
          const dailyLimit = limits.limits?.daily_limit || (status.tier === 'free' ? 2 : (status.tier === 'vip' ? 10 : 99))
          const dailyUsed = limits.daily_jobs_used || 0

          if (dailyUsed >= dailyLimit || !limits.can_create_job) {
            setJobLimits({
              daily_jobs: { used: dailyUsed, limit: dailyLimit },
              plan: status.tier,
              can_create_job: limits.can_create_job || false
            })
            setShowLimitsModal(true)
            return
          }
        }
      }

      // Create video job
      const videoJobData = {
        analysis_job_id: analysisJob.id,
        movie_id: movieData.id,
        // movie_title: movieData.title_zh || movieData.title,
        movie_title: [
          movieData.title_en || movieData.title,  // English title first (index 0)
          movieData.title_zh || movieData.title,  // Chinese title second (index 1)
        ].filter(Boolean),        // removes any undefined/null/empty entries
        movie_title_en: movieData.title_en,
        tts_text: analysisJob.analysis_result || llmResponse,
        voice_id: voiceConfig?.voiceId || 1, // Use default voice ID instead of null
        vcn: voiceConfig?.vcn || 'x4_yezi', // Use default VCN instead of null
        voice_display_name: voiceConfig?.voiceName || 'Default Voice',
        voice_language: voiceConfig?.voiceLanguage || 'zh',
        tts_provider: voiceConfig?.ttsProvider || 'xfyun',
        resolution: flowState.resolution || '480p',
        speed: flowState.speed || 50
      }

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.videoJobs.create(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(videoJobData)
        }
      )

      if (response.ok) {
        await response.json() // Consume response but don't need the result

        toast({
          title: language === "zh" ? "成功" : "Success",
          description: language === "zh" ? "视频生成任务已创建" : "Video generation job created"
        })

        // Navigate to job pending page to show the new job
        router.push('/job-pending')
      } else {
        const errorData = await response.json()

        // Show error but still navigate to job-pending to see status
        toast({
          title: language === "zh" ? "错误" : "Error",
          description: errorData.detail || (language === "zh" ? "创建视频任务失败" : "Failed to create video job"),
          variant: "destructive"
        })

        // Navigate to job pending page even on error to see job status
        router.push('/job-pending')
      }
    } catch (error) {
      console.error('Error creating video job:', error)
      toast({
        title: language === "zh" ? "错误" : "Error",
        description: language === "zh" ? "创建视频任务失败" : "Failed to create video job",
        variant: "destructive"
      })

      // Navigate to job pending page even on error
      router.push('/job-pending')
    }
  }

  if (loading) {
    return (
      <AppLayout title={language === "zh" ? "脚本审查" : "Script Review"}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (!analysisJob || !llmResponse) {
    return (
      <AppLayout title={language === "zh" ? "脚本审查" : "Script Review"}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === "zh" ? "分析结果不可用" : "Analysis Result Not Available"}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === "zh" ? "请返回任务列表重新开始" : "Please return to job list to start over"}
            </p>
            <Button onClick={() => router.push('/job-pending')}>
              {language === "zh" ? "返回任务列表" : "Back to Jobs"}
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const themeClasses = getStandardThemeClasses(theme)

  return (
    <div>
      <AppLayout title={language === "zh" ? "脚本审查" : "Script Review"}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className={`text-3xl font-bold ${themeClasses.text}`}>
                {language === "zh" ? "脚本审查" : "Script Review"}
              </h1>
            </div>
          </div>

          {/* Movie Header */}
          {movieData && (
            <div className="mb-8 text-center">
              <h2 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                {movieData.title_zh || movieData.title}
              </h2>
              {movieData.title_en && movieData.title_en !== movieData.title && (
                <p className={`text-lg text-gray-600 dark:text-gray-300 mb-2`}>{movieData.title_en}</p>
              )}
              {movieData.tagline && (
                <p className={`text-gray-500 dark:text-gray-400 italic`}>{movieData.tagline}</p>
              )}
            </div>
          )}

          {/* Video-like Audio Player */}
          <Card className={`${themeClasses.card} mb-8 overflow-hidden`}>
            <CardContent className="p-0">
              <div className={`relative aspect-video ${themeClasses.overlayBg}`}>
                {/* Video thumbnail/backdrop */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: movieData ? `url(${getQiniuBackdropUrl(movieData.id)})` : undefined,
                  }}
                />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={handlePlayPause}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 w-20 h-20 rounded-full"
                  >
                    {isGenerating ? (
                      <RefreshCw className={`w-8 h-8 ${themeClasses.overlayText} animate-spin`} />
                    ) : isPlaying ? (
                      <Pause className={`w-8 h-8 ${themeClasses.overlayText}`} />
                    ) : (
                      <Play className={`w-8 h-8 ${themeClasses.overlayText} ml-1`} />
                    )}
                  </Button>
                </div>

                {/* Audio controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  {/* Progress bar */}
                  <div
                    className="w-full bg-white/20 rounded-full h-2 mb-4 cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>

                  {/* Controls and info */}
                  <div className={`flex items-center justify-between ${themeClasses.overlayText}`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>

                    {/* Removed tags - voice info moved below */}
                  </div>
                </div>

                {/* Loading overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className={`text-center ${themeClasses.overlayText}`}>
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">
                        {language === "zh" ? "正在生成语音..." : "Generating audio..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Review Section */}
          {voiceConfig && (
            <div className="mb-6 space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.text} text-center mb-4`}>
                {language === "zh" ? "配置确认" : "Configuration Review"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Voice Configuration */}
                <div className={`backdrop-blur-sm rounded-lg p-4 border ${theme === "light" ? "bg-gray-100 border-gray-200" : "bg-white/10 border-white/20"}`}>
                  <div className={`text-sm ${themeClasses.mutedText} mb-1`}>
                    {language === "zh" ? "语音配置" : "Voice"}
                  </div>
                  <div className={`${themeClasses.text} font-medium`}>
                    {voiceConfig.voiceName || (language === "zh" ? "默认语音" : "Default Voice")}
                  </div>
                  {voiceConfig.ttsProvider && (
                    <div className={`text-xs ${themeClasses.mutedText} mt-1`}>
                      {language === "zh" ? "提供商" : "Provider"}: {voiceConfig.ttsProvider}
                    </div>
                  )}
                </div>

                {/* Speed Configuration */}
                <div className={`backdrop-blur-sm rounded-lg p-4 border ${theme === "light" ? "bg-gray-100 border-gray-200" : "bg-white/10 border-white/20"}`}>
                  <div className={`text-sm ${themeClasses.mutedText} mb-1`}>
                    {language === "zh" ? "播放速度" : "Speed"}
                  </div>
                  <div className={`${themeClasses.text} font-medium`}>
                    {(() => {
                      const speed = flowState.speed || 50;
                      if (speed < 30) return language === "zh" ? "较慢" : "Slower";
                      if (speed < 45) return language === "zh" ? "慢" : "Slow";
                      if (speed <= 55) return language === "zh" ? "正常" : "Normal";
                      if (speed < 70) return language === "zh" ? "快" : "Fast";
                      return language === "zh" ? "较快" : "Faster";
                    })()}
                  </div>
                  <div className={`text-xs ${themeClasses.mutedText} mt-1`}>
                    {language === "zh" ? "数值" : "Value"}: {flowState.speed || 50}
                  </div>
                </div>

                {/* Resolution Configuration */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-white/70 mb-1">
                    {language === "zh" ? "视频分辨率" : "Resolution"}
                  </div>
                  <div className="text-white font-medium">
                    {flowState.resolution || '480p'}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {(() => {
                      const res = flowState.resolution || '480p';
                      if (res === '480p') return language === "zh" ? "标清画质" : "Standard Quality";
                      if (res === '720p') return language === "zh" ? "高清画质" : "HD Quality";
                      if (res === '1080p') return language === "zh" ? "全高清画质" : "Full HD Quality";
                      return language === "zh" ? "标准画质" : "Standard Quality";
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          <Card className="bg-white/10 border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {language === "zh" ? "AI 分析结果" : "AI Analysis Result"}
              </CardTitle>
              <div className="flex items-center justify-between mt-2">
                {/* Speed and Resolution Controls */}
                <div className="flex items-center space-x-2">
                  {/* Speed Control */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Settings className="w-3 h-3 mr-1" />
                        {language === "zh" ? "语速" : "Speed"}: {(() => {
                          const speed = flowState.speed || 50;
                          if (speed < 30) return language === "zh" ? "较慢" : "Slower";
                          if (speed < 45) return language === "zh" ? "慢" : "Slow";
                          if (speed <= 55) return language === "zh" ? "正常" : "Normal";
                          if (speed < 70) return language === "zh" ? "快" : "Fast";
                          return language === "zh" ? "较快" : "Faster";
                        })()} ({flowState.speed || 50})
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {[30, 40, 50, 60, 70, 80].map((speed) => (
                        <DropdownMenuItem
                          key={speed}
                          onClick={() => updateFlowState({ speed })}
                          className={flowState.speed === speed ? "bg-blue-100 dark:bg-blue-900" : ""}
                        >
                          {(() => {
                            if (speed < 30) return language === "zh" ? "较慢" : "Slower";
                            if (speed < 45) return language === "zh" ? "慢" : "Slow";
                            if (speed <= 55) return language === "zh" ? "正常" : "Normal";
                            if (speed < 70) return language === "zh" ? "快" : "Fast";
                            return language === "zh" ? "较快" : "Faster";
                          })()} ({speed})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Resolution Control */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Settings className="w-3 h-3 mr-1" />
                        {flowState.resolution || "720p"}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={() => updateFlowState({ resolution: "480p" })}
                        className={flowState.resolution === "480p" ? "bg-blue-100 dark:bg-blue-900" : ""}
                      >
                        480p (SD)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateFlowState({ resolution: "720p" })}
                        className={flowState.resolution === "720p" ? "bg-blue-100 dark:bg-blue-900" : ""}
                      >
                        720p (HD)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateFlowState({ resolution: "1080p" })}
                        className={flowState.resolution === "1080p" ? "bg-blue-100 dark:bg-blue-900" : ""}
                      >
                        1080p (FHD)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto backdrop-blur-sm">
                <pre className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {llmResponse}
                </pre>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-300">
                <span>
                  {language === "zh" ? "此内容将用于生成视频解说" : "This content will be used for video narration"}
                </span>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                    {llmResponse.length} {language === "zh" ? "字符" : "characters"}
                  </Badge>
                {generatedAudioUrl && (
                  <span className="text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {language === "zh" ? "音频已准备" : "Audio ready"}
                  </span>
                )}
              </div>
              
            </CardContent>
          </Card>

          {/* Generate Video button removed - using bottom navigation instead */}

          {!generatedAudioUrl && !isGenerating && (
            <p className="text-center text-gray-300 text-sm mt-4">
              {language === "zh" ? "音频预览可选，您可以直接生成视频" : "Audio preview is optional, you can proceed to generate video"}
            </p>
          )}
        </div>

        {/* Navigation Buttons - Hidden on mobile (shown in fixed bottom bar) */}
        <div className="pt-6 hidden md:block">
          <BottomNavigation
            onBack={() => router.push(`/voice-selection/${jobId}`)}
            onNext={handleGenerateVideo}
            backLabel={language === "zh" ? "返回语音选择" : "Back to Voice Selection"}
            nextLabel={language === "zh" ? "生成视频" : "Generate Video"}
            nextDisabled={isGenerating}
          />
        </div>

        {/* Hidden audio element for TTS playback */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {/* Job Limits Modal */}
        {showLimitsModal && jobLimits && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white dark:bg-gray-800 max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  {language === "zh" ? "任务限制" : "Job Limits"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {language === "zh"
                    ? `您今天已使用 ${jobLimits.daily_jobs?.used || 0}/${jobLimits.daily_jobs?.limit || 0} 个任务。`
                    : `You have used ${jobLimits.daily_jobs?.used || 0}/${jobLimits.daily_jobs?.limit || 0} jobs today.`
                  }
                </p>
                {jobLimits.plan === 'free' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {language === "zh"
                      ? "升级到VIP以获得更多任务额度。"
                      : "Upgrade to VIP for more job quota."
                    }
                  </p>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowLimitsModal(false)}>
                    {language === "zh" ? "关闭" : "Close"}
                  </Button>
                  {jobLimits.plan === 'free' && (
                    <Button onClick={() => router.push(`/payment?returnTo=/script-review/${jobId}`)}>
                      {language === "zh" ? "升级VIP" : "Upgrade VIP"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mobile Bottom Bar */}
        <MobileBottomBar>
          <div className="flex space-x-3 w-full">
            <Button
              onClick={() => router.push(`/voice-selection/${jobId}`)}
              variant="outline"
              size="lg"
              className="flex-1 py-4"
            >
              {language === "zh" ? "返回语音选择" : "Back to Voice Selection"}
            </Button>
            <Button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 disabled:opacity-50"
            >
              {language === "zh" ? "生成视频" : "Generate Video"}
            </Button>
          </div>
        </MobileBottomBar>
      </AppLayout>
    </div>
  )
}
