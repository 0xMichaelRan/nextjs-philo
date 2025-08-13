"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Play, Pause, Edit, RefreshCw, ArrowRight, ArrowLeft, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { MovieHeader } from "@/components/movie-header"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"
import { useToast } from "@/hooks/use-toast"
import { useFlow } from "@/hooks/use-flow"



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

export default function ScriptReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { flowState } = useFlow()
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
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

  // Redirect if no movie selected or load movie data from flow state
  useEffect(() => {
    if (!flowState.movieId) {
      router.push('/movie-selection')
      return
    }

    // Set movie data from flow state
    setMovieData({
      id: flowState.movieId,
      title: flowState.movieTitle || '',
      title_zh: flowState.movieTitle,
      title_en: flowState.movieTitleEn,
      tagline: flowState.movieTagline
    })

    // Get data from flow store
    if (flowState.voiceId || flowState.customVoiceId) {
      setVoiceConfig({
        voiceId: flowState.voiceId,
        voiceName: flowState.voiceName,
        voiceCode: flowState.voiceId, // Use voiceId as voiceCode for now
        voiceLanguage: flowState.voiceLanguage,
        customVoiceId: flowState.customVoiceId,
        ttsProvider: flowState.ttsProvider || 'xfyun',
        isCustom: flowState.voiceId === 'custom'
      })
    }

    // Get analysis result from flow store
    if (flowState.analysisResult) {
      console.log("Using analysis result from flow store:", flowState.analysisResult.substring(0, 100) + "...")
      setLlmResponse(flowState.analysisResult)
    } else if (flowState.analysisJobId) {
      // Fallback to fetching from API if no analysis result in store
      fetchLLMResponse(flowState.analysisJobId.toString())
    } else {
      // For testing purposes, show sample content
      console.log("No analysis result or job ID in flow store, using sample content")
      const sampleResponse = `欢迎使用AI电影分析系统！

这是一个演示用的AI分析结果。在实际使用中，这里会显示AI对所选电影的深度分析内容，包括：

• 剧情结构分析
• 角色性格解读
• 主题思想探讨
• 艺术手法评析
• 社会意义阐述

您可以选择不同的语音来生成这段分析内容的音频版本。语音将自动生成。`
      setLlmResponse(sampleResponse)
    }

    // Fetch script content if we have movie data
    fetchMovieData(flowState.movieId)
  }, [flowState, router])

  // Auto-generate TTS when llmResponse changes
  useEffect(() => {
    if (llmResponse && voiceConfig && !isGenerating) {
      console.log("Auto-generating TTS for analysis result...")
      generateTTSAudio()
    }
  }, [llmResponse, voiceConfig])

  const fetchLLMResponse = async (analysisJobId: string) => {
    try {
      console.log("Fetching LLM response for job ID:", analysisJobId)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.getJob(parseInt(analysisJobId))
      )

      if (response.ok) {
        const jobData = await response.json()
        console.log("LLM job data:", jobData)
        if (jobData.response_content) {
          console.log("Setting LLM response:", jobData.response_content.substring(0, 100) + "...")
          setLlmResponse(jobData.response_content)
        } else {
          console.log("No response_content in job data")
          // For testing, set a sample response if no real response is available
          const sampleResponse = `这是一个关于电影《${movieData?.title || "未知电影"}》的深度分析。

电影通过精妙的叙事结构和丰富的视觉语言，展现了人性的复杂性和社会的多面性。导演运用独特的镜头语言，将观众带入一个充满象征意义的世界。

影片的主题围绕着爱情、背叛、救赎等永恒话题展开，每个角色都承载着深刻的寓意。通过细腻的情感描绘和紧张的剧情推进，观众能够感受到强烈的情感冲击。

总的来说，这部电影不仅是一部娱乐作品，更是一面反映社会现实的镜子，值得我们深入思考和品味。`
          setLlmResponse(sampleResponse)
        }
      } else {
        console.log("Failed to fetch LLM response, status:", response.status)
        // Set sample response for testing
        const sampleResponse = `这是一个测试用的AI分析结果。

由于无法获取真实的分析数据，这里显示的是示例内容。在实际使用中，这里会显示AI对电影的深度分析结果。

这段文字将用于语音合成，生成相应的音频内容。语音将自动生成。`
        setLlmResponse(sampleResponse)
      }
    } catch (error) {
      console.error("Error fetching LLM response:", error)
      // Set sample response for testing
      const sampleResponse = `AI分析结果加载失败，显示示例内容。

这是一段用于测试语音合成功能的示例文字。在正常情况下，这里会显示AI对电影的详细分析内容。

您可以使用这段文字来测试TTS语音生成功能是否正常工作。`
      setLlmResponse(sampleResponse)
    }
  }

  const fetchMovieData = async (movieId: string) => {
    setLoading(true)
    try {
      // Fetch movie data
      const movieResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${movieId}`)
      if (movieResponse.ok) {
        const movie = await movieResponse.json()
        setMovieData(movie)
      }

      // Fetch entries content
      const entriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/static/${movieId}/entries?lang_variant=chs`)
      let entriesContent = ""
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json()
        entriesContent = JSON.stringify(entriesData, null, 2)
      }

      // Fetch clean content
      const cleanResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/static/${movieId}/clean?lang_variant=chs`)
      let cleanContent = ""
      if (cleanResponse.ok) {
        cleanContent = await cleanResponse.text()
      }

      // Set content blocks
      const blocks: ContentBlock[] = []
      if (entriesContent) {
        blocks.push({
          type: 'entries',
          title: language === 'zh' ? '电影片段数据' : 'Movie Entries Data',
          content: entriesContent
        })
      }
      if (cleanContent) {
        blocks.push({
          type: 'clean',
          title: language === 'zh' ? '清理后文本' : 'Clean Text',
          content: cleanContent
        })
      }
      setContentBlocks(blocks)

    } catch (error) {
      console.error("Error fetching movie data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateTTSAudio = async () => {
    if (!voiceConfig) {
      toast({
        title: language === "zh" ? "错误" : "Error",
        description: language === "zh" ? "缺少语音配置" : "Missing voice configuration",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Use LLM response if available, otherwise fall back to content blocks
      let textContent = llmResponse
      if (!textContent && contentBlocks.length > 0) {
        textContent = contentBlocks.find(block => block.type === 'clean')?.content ||
                     contentBlocks[0]?.content || ''
      }

      if (!textContent) {
        throw new Error("No content available for TTS generation")
      }

      // Prepare TTS request
      const ttsRequest = {
        text: textContent.substring(0, 500), // Limit text length for demo
        provider: voiceConfig.ttsProvider,
        voice_type: voiceConfig.isCustom ? 'custom' : 'system',
        language: voiceConfig.voiceLanguage || 'zh',
        voice_id: voiceConfig.isCustom ? null : voiceConfig.voiceCode,
        custom_voice_file_path: voiceConfig.isCustom ? voiceConfig.customVoiceId : null
      }

      // Call TTS API
      const response = await apiConfig.makeAuthenticatedRequest(apiConfig.tts.synthesize(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ttsRequest)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.audio_data) {
          // Convert base64 audio data to blob
          const audioData = atob(result.audio_data)
          const audioArray = new Uint8Array(audioData.length)
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i)
          }

          // Use the correct MIME type based on the audio format returned by the backend
          const mimeType = result.audio_format === 'wav' ? 'audio/wav' :
                          result.audio_format === 'mp3' ? 'audio/mpeg' :
                          result.audio_format === 'aac' ? 'audio/aac' :
                          result.audio_format === 'ogg' ? 'audio/ogg' :
                          'audio/wav' // Default fallback

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
    if (!generatedAudioUrl && !isGenerating) {
      // Generate audio first
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

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setAudioProgress(0)
    }

    const handleLoadedData = () => {
      // Audio is ready to play
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadeddata', handleLoadedData)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [generatedAudioUrl])

  const handleEditSection = (sectionId: number) => {
    // Navigate to script edit with section ID (flow state will be preserved)
    router.push(`/script-edit?sectionId=${sectionId}`)
  }

  const handleBack = () => {
    // Go back to voice selection to choose a different voice
    router.push(`/voice-selection?${searchParams.toString()}`)
  }

  const fetchJobLimits = async () => {
    if (!user) return null

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.jobs.limits()
      )

      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error("Error fetching job limits:", error)
    }
    return null
  }

  const handleNext = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    // Check job limits before proceeding
    const limits = await fetchJobLimits()
    if (limits && !limits.can_create_job) {
      setJobLimits(limits)
      setShowLimitsModal(true)
      return
    }

    // Navigate to job submission (flow state will be preserved)
    router.push('/job-submission')
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    return {
      background: "bg-gradient-to-br from-amber-900 via-orange-900 to-red-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div
      className={themeClasses.background}
      style={{
        backgroundImage: movieData ? `url(/placeholder.svg?height=1080&width=1920&query=${encodeURIComponent(movieData.title_en || movieData.title)}+movie+poster)` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <AppLayout title={t("scriptReview.title")}>
        <div className="container mx-auto px-6 py-8 pb-24 relative z-10">
          {/* Movie Info */}
          {loading ? (
            <div className="text-center py-8">
              <p className={themeClasses.text}>加载中...</p>
            </div>
          ) : movieData ? (
            <MovieHeader
              movieId={movieData.id}
              movieTitle={movieData.title_zh || movieData.title}
              movieTitleEn={movieData.title_en}
              movieTagline={movieData.tagline}
              subtitle={t("scriptReview.subtitle")}
              className="mb-8 max-w-2xl mx-auto"
            />
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.text}>未找到电影信息</p>
            </div>
          )}

          {/* Content Info */}
          {(contentBlocks.length > 0 || llmResponse || movieData) && (
            <Card className={`${themeClasses.card} backdrop-blur-md mb-8`}>
              <CardHeader>
                <CardTitle className={themeClasses.text}>
                  {language === "zh" ? "内容概览" : "Content Overview"}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {contentBlocks.length > 0 && (
                    <Badge variant="secondary">
                      {language === "zh" ? "内容块" : "Content Blocks"}: {contentBlocks.length}
                    </Badge>
                  )}
                  {llmResponse && (
                    <Badge variant="secondary">
                      {language === "zh" ? "AI分析" : "AI Analysis"}: {llmResponse.length} {language === "zh" ? "字符" : "chars"}
                    </Badge>
                  )}
                  {movieData && (
                    <Badge variant="secondary">
                      {language === "zh" ? "电影" : "Movie"}: {movieData.title_zh || movieData.title}
                    </Badge>
                  )}
                  {voiceConfig && (
                    <Badge variant="secondary">
                      {language === "zh" ? "语音" : "Voice"}: {voiceConfig.voiceName || (voiceConfig.isCustom ? "自定义语音" : "Default Voice")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Video Preview Player */}
          <Card className={`${themeClasses.card} backdrop-blur-md mb-8`}>
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={movieData ? `${process.env.NEXT_PUBLIC_API_URL}/static/${movieData.id}/image?file=backdrop` : "/placeholder.svg?height=200&width=400"}
                  alt={movieData?.title || t("scriptReview.videoPreview")}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if backdrop image fails to load
                    e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    disabled={isGenerating || !generatedAudioUrl}
                    title={!generatedAudioUrl ? (language === "zh" ? "语音正在生成中" : "Audio is being generated") : ""}
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-8 h-8 text-white animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white" />
                    )}
                  </Button>

                  {/* Show message when no audio is available */}
                  {!generatedAudioUrl && !isGenerating && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
                        <p className="text-sm mb-2">
                          {language === "zh" ? "语音正在生成中" : "Audio is being generated"}
                        </p>
                        <p className="text-xs opacity-75">
                          {language === "zh" ? "请稍候，语音将自动播放" : "Please wait, audio will play automatically"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-sm text-white mb-2">
                    <span>
                      {voiceConfig ? (
                        voiceConfig.isCustom ?
                          (language === "zh" ? "自定义语音" : "Custom Voice") :
                          voiceConfig.voiceName
                      ) : (
                        t("scriptReview.videoPreview")
                      )}
                    </span>
                    <span>
                      {voiceConfig?.ttsProvider && (
                        <Badge variant="secondary" className="text-xs">
                          {voiceConfig.ttsProvider === 'xfyun' ? '讯飞语音' : 'IndexTTS'}
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LLM Response Preview */}
          {llmResponse && (
            <Card className={`${themeClasses.card} backdrop-blur-md mb-8 border-2 border-blue-400 dark:border-blue-600`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`${themeClasses.text} text-lg flex items-center gap-2`}>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      {language === "zh" ? "AI 分析结果" : "AI Analysis Result"}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900">
                        {language === "zh" ? "用于语音合成" : "For TTS"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {llmResponse.length} {language === "zh" ? "字符" : "characters"}
                      </Badge>
                      {voiceConfig && (
                        <Badge variant="secondary" className="text-xs">
                          {voiceConfig.voiceName || (voiceConfig.isCustom ? "自定义语音" : "Default Voice")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Auto-generation status indicator */}
                  {isGenerating && (
                    <div className="flex items-center text-blue-600 text-sm">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {language === "zh" ? "正在生成语音..." : "Generating audio..."}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${themeClasses.secondaryText} leading-relaxed`}>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700 shadow-inner">
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-7">
                      {llmResponse}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {language === "zh" ? "此内容将用于语音合成生成音频" : "This content will be used for TTS audio generation"}
                    </span>
                    {generatedAudioUrl && (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {language === "zh" ? "音频已生成" : "Audio generated"}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show placeholder if no LLM response */}
          {!llmResponse && (
            <Card className={`${themeClasses.card} backdrop-blur-md mb-8 border-dashed border-2 border-gray-300 dark:border-gray-600`}>
              <CardContent className="p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <p className="text-sm">
                    {language === "zh" ? "等待 AI 分析结果..." : "Waiting for AI analysis result..."}
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    {language === "zh" ? "分析完成后将显示用于语音合成的内容" : "Content for TTS will appear here after analysis"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Blocks */}
          <div className="space-y-6">
            {contentBlocks.map((block, index) => (
              <Card key={block.type} className={`${themeClasses.card} backdrop-blur-md`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`${themeClasses.text} text-lg`}>
                      {block.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {block.type === 'entries' ? 'JSON' : 'TEXT'}
                      </Badge>
                      <Button
                        onClick={() => handleEditSection(index + 1)}
                        size="sm"
                        variant="ghost"
                        className={`${theme === "light" ? "text-gray-800 hover:bg-gray-200" : "text-white hover:bg-white/10"}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`${themeClasses.secondaryText} leading-relaxed`}>
                    {block.type === 'entries' ? (
                      <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96">
                        {block.content}
                      </pre>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {block.content}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Note */}
          <div className="mt-8">
            <Card className={`${themeClasses.card} backdrop-blur-md`}>
              <CardContent className="p-4 text-center">
                <p className={`${themeClasses.secondaryText} text-sm italic`}>{t("scriptReview.aiNote")}</p>
              </CardContent>
            </Card>
          </div>

          {isGenerating && (
            <Card className={`${themeClasses.card} backdrop-blur-md mt-8`}>
              <CardContent className="p-6 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                <p className={themeClasses.text}>{t("scriptReview.regenerating")}</p>
              </CardContent>
            </Card>
          )}

          {/* Audio Element */}
          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onError={() => setIsPlaying(false)} />
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10 z-40">
          <div className="container mx-auto flex space-x-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "zh" ? "重新选择语音" : "Choose Voice Again"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!generatedAudioUrl}
              className={`flex-1 ${
                generatedAudioUrl
                  ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
              title={!generatedAudioUrl ? (language === "zh" ? "语音正在生成中" : "Audio is being generated") : ""}
            >
              {t("scriptReview.generateVideo")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </AppLayout>

      {/* Job Limits Modal */}
      {showLimitsModal && jobLimits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl">
            <CardHeader className="relative">
              <Button
                onClick={() => setShowLimitsModal(false)}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === "zh" ? "任务队列已满" : "Job Queue Full"}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  {language === "zh"
                    ? `您当前有 ${jobLimits.pending_jobs.current} 个待处理任务，已达到 ${jobLimits.plan} 计划的上限。`
                    : `You currently have ${jobLimits.pending_jobs.current} pending jobs, which has reached your ${jobLimits.plan} plan limit.`
                  }
                </p>

                <p className="text-gray-600 dark:text-gray-300">
                  {language === "zh"
                    ? "请等待当前任务完成后再创建新任务。"
                    : "Please wait for current jobs to complete before creating new ones."
                  }
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {language === "zh" ? "当前计划限制" : "Current Plan Limits"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-orange-600">
                      {jobLimits.plan}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {jobLimits.pending_jobs.current}/{jobLimits.pending_jobs.limit} {language === "zh" ? "待处理任务" : "pending jobs"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowLimitsModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  {language === "zh" ? "我知道了" : "I Understand"}
                </Button>
                {(jobLimits.plan === "Free" || jobLimits.plan === "VIP") && (
                  <Button
                    onClick={() => {
                      setShowLimitsModal(false)
                      router.push('/vip')
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {jobLimits.plan === "Free"
                      ? (language === "zh" ? "升级VIP" : "Upgrade to VIP")
                      : (language === "zh" ? "升级SVIP" : "Upgrade to SVIP")
                    }
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
