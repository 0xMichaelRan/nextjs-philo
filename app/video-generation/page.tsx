"use client"

import { useState, useEffect } from "react"
import { Clock, Play, Download, CheckCircle, AlertCircle, Plus, Crown, User, ArrowLeft, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { VideoPlayer } from "@/components/video-player"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiConfig } from "@/lib/api-config"

interface VideoJob {
  id: number
  user_id: number
  analysis_job_id: number
  movie_id: string
  movie_title: string
  movie_title_en?: string
  tts_text: string
  voice_id: string
  voice_name?: string
  voice_language: string
  custom_voice_id?: string
  tts_provider: string
  status: string
  progress: number
  external_job_id?: string
  result_video_url?: string
  result_script_url?: string
  video_url?: string
  thumbnail_url?: string
  narration_audio_url?: string
  error_message?: string
  video_quality: string
  video_format: string
  video_resolution: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export default function VideoGenerationPage() {
  const [jobs, setJobs] = useState<VideoJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoJob | null>(null)
  const router = useRouter()
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchCompletedJobs()
    } else {
      router.push('/auth')
    }
  }, [user, router])

  const fetchCompletedJobs = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.videoJobs.list(),
        { method: 'GET' }
      )

      if (response.ok) {
        const allJobs = await response.json()
        // Filter only completed jobs for the video generation page
        const completedJobs = allJobs.filter((job: VideoJob) => job.status === 'completed')
        setJobs(completedJobs)
        setError(null)
      } else {
        setError(language === "zh" ? "获取视频列表失败" : "Failed to fetch video list")
      }
    } catch (err) {
      console.error('Error fetching video jobs:', err)
      setError(language === "zh" ? "网络错误" : "Network error")
    } finally {
      setLoading(false)
    }
  }

  // Format VIP expiry date
  const formatVipExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return null
    try {
      const date = new Date(expiryDate)
      return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "processing":
        return <Clock className="w-5 h-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return language === "zh" ? "已完成" : "Completed"
      case "processing":
        return language === "zh" ? "处理中" : "Processing"
      case "pending":
        return language === "zh" ? "等待中" : "Pending"
      case "failed":
        return language === "zh" ? "失败" : "Failed"
      default:
        return language === "zh" ? "未知状态" : "Unknown Status"
    }
  }

  const handleVideoPlay = (job: VideoJob) => {
    setSelectedVideo(job)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
        cardHover: "hover:bg-white/90 hover:shadow-lg transition-all duration-300",
        button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
        accent: "text-purple-600",
        error: "text-red-600",
      }
    }
    return {
      background: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
      cardHover: "hover:bg-white/20 hover:shadow-xl transition-all duration-300",
      button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      accent: "text-purple-400",
      error: "text-red-400",
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("videoGeneration.title")}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                  {language === "zh" ? "我的视频" : "My Videos"}
                </h1>
                <p className={`${themeClasses.text} opacity-80`}>
                  {language === "zh" ? "查看和管理您的已完成视频" : "View and manage your completed videos"}
                </p>
              </div>
              <Button
                onClick={() => router.push('/job-pending')}
                variant="outline"
                className="flex items-center gap-2 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === "zh" ? "任务队列" : "Job Queue"}
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className={themeClasses.secondaryText}>
                  {language === "zh" ? "加载中..." : "Loading videos..."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
              <CardContent className="p-12 text-center">
                <AlertCircle className={`w-16 h-16 ${themeClasses.error} mx-auto mb-6`} />
                <h3 className={`text-xl font-semibold ${themeClasses.text} mb-3`}>
                  {language === "zh" ? "加载失败" : "Loading Failed"}
                </h3>
                <p className={`${themeClasses.secondaryText} mb-6`}>{error}</p>
                <Button
                  onClick={fetchCompletedJobs}
                  className={`${themeClasses.button} text-white px-8 py-3 rounded-lg font-semibold`}
                >
                  {language === "zh" ? "重试" : "Retry"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Videos Grid */}
          {!loading && !error && (
            <div className="mb-12">
              {jobs.length === 0 ? (
                <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                  <CardContent className="p-12 text-center">
                    <Film className={`w-16 h-16 ${themeClasses.accent} mx-auto mb-6`} />
                    <h3 className={`text-xl font-semibold ${themeClasses.text} mb-3`}>
                      {language === "zh" ? "暂无完成的视频" : "No completed videos yet"}
                    </h3>
                    <p className={`${themeClasses.secondaryText} mb-6`}>
                      {language === "zh" ? "您还没有完成的视频。查看任务队列了解进度。" : "You don't have any completed videos yet. Check the job queue to see progress."}
                    </p>
                    <Button
                      onClick={() => router.push('/job-pending')}
                      className={`${themeClasses.button} text-white px-8 py-3 rounded-lg font-semibold`}
                    >
                      {language === "zh" ? "查看任务队列" : "View Job Queue"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <Card key={job.id} className={`${themeClasses.card} overflow-hidden cursor-pointer hover:scale-105 transition-transform`}>
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={job.thumbnail_url || "/placeholder.svg"}
                            alt={job.movie_title}
                            className="w-full h-32 object-cover"
                          />
                          <button
                            onClick={() => handleVideoPlay(job)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                          >
                            <Play className="w-12 h-12 text-white" />
                          </button>
                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            {getStatusIcon(job.status)}
                            <Badge className="bg-black/70 text-white text-xs">
                              {job.video_quality}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className={`${themeClasses.text} font-semibold text-lg mb-2`}>
                            {job.movie_title}
                          </h3>
                          <div className="space-y-2">
                            <div className={`flex justify-between text-sm ${themeClasses.secondaryText}`}>
                              <span>
                                {language === "zh" ? "状态" : "Status"}: {getStatusText(job.status)}
                              </span>
                            </div>
                            <div className={`flex justify-between text-xs ${themeClasses.secondaryText}`}>
                              <span>
                                {language === "zh" ? "创建时间" : "Created"}: {formatDate(job.created_at)}
                              </span>
                              {job.completed_at && (
                                <span>
                                  {language === "zh" ? "完成时间" : "Completed"}: {formatDate(job.completed_at)}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 bg-transparent"
                                onClick={() => router.push(`/video-generation/${job.id}`)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {language === "zh" ? "查看详情" : "View Details"}
                              </Button>
                              {job.result_video_url && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => window.open(job.result_video_url, '_blank')}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  {language === "zh" ? "下载" : "Download"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video Player Dialog */}
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>{selectedVideo?.movie_title}</DialogTitle>
              </DialogHeader>
              {selectedVideo && (
                <div className="aspect-video">
                  <VideoPlayer
                    src={selectedVideo.result_video_url || selectedVideo.video_url || ""}
                    poster={selectedVideo.thumbnail_url}
                    className="w-full h-full"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </div>
  )
}
