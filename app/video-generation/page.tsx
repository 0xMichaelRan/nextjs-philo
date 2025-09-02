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
  voice_code: string
  voice_display_name?: string
  custom_voice_id?: string
  status: string
  result_video_url?: string
  result_script_url?: string
  video_url?: string
  thumbnail_url?: string
  narration_audio_url?: string
  error_message?: string
  resolution: string
  speed: number // TTS speed (0-100)
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

  const formatRelativeTime = (dateString: string) => {
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

      if (diffInMinutes < 1) {
        return language === "zh" ? "刚刚" : "just now"
      } else if (diffInMinutes < 60) {
        return language === "zh" ? `${diffInMinutes}分钟前` : `${diffInMinutes} minutes ago`
      } else if (diffInMinutes < 1440) { // 24 hours
        const hours = Math.floor(diffInMinutes / 60)
        return language === "zh" ? `${hours}小时前` : `${hours} hours ago`
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        return language === "zh" ? `${days}天前` : `${days} days ago`
      }
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
        outlineButton: "border-gray-300 text-gray-700 hover:bg-gray-50",
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
      outlineButton: "border-white/20 text-white hover:bg-white/10",
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
                className={`flex items-center gap-2 ${themeClasses.outlineButton}`}
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
                    <Card key={job.id} className={`${themeClasses.card} overflow-hidden hover:scale-105 transition-transform`}>
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={job.movie_id ? `${process.env.NEXT_PUBLIC_API_URL}/static/${job.movie_id}/image?file=backdrop` : "/placeholder.svg"}
                            alt={(() => {
                              if (typeof job.movie_title === 'object' && job.movie_title) {
                                const titleObj = job.movie_title as any
                                return titleObj[language] || titleObj.en || titleObj.zh || "Movie"
                              }
                              return job.movie_title || "Movie"
                            })()}
                            className="w-full h-32 object-cover"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVideoPlay(job)
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                          >
                            <Play className="w-12 h-12 text-white" />
                          </button>
                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            {getStatusIcon(job.status)}
                            <Badge className="bg-black/70 text-white text-xs">
                              {job.resolution}
                            </Badge>
                          </div>
                        </div>
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => router.push(`/video-generation/${job.id}`)}
                        >
                          <h3 className={`${themeClasses.text} font-semibold text-lg mb-2`}>
                            {(() => {
                              if (typeof job.movie_title === 'object' && job.movie_title) {
                                const titleObj = job.movie_title as any
                                return titleObj[language] || titleObj.en || titleObj.zh || "Movie"
                              }
                              return job.movie_title || "Movie"
                            })()}
                          </h3>
                          <div className="space-y-2">
                            <div className={`flex justify-between text-sm ${themeClasses.secondaryText}`}>
                              <span>
                                {language === "zh" ? "状态" : "Status"}: {getStatusText(job.status)}
                              </span>
                              <span>
                                {formatRelativeTime(job.completed_at || job.created_at)}
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
                              {job.result_video_url && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => window.open(`${apiConfig.getBaseUrl()}${job.video_url || job.result_video_url}`, '_blank')}
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
                <DialogTitle>{(() => {
                  if (typeof selectedVideo?.movie_title === 'object' && selectedVideo?.movie_title) {
                    const titleObj = selectedVideo.movie_title as any
                    return titleObj[language] || titleObj.en || titleObj.zh || "Movie"
                  }
                  return selectedVideo?.movie_title || "Movie"
                })()}</DialogTitle>
              </DialogHeader>
              {selectedVideo && (
                <div className="aspect-video">
                  <VideoPlayer
                    src={`${apiConfig.getBaseUrl()}${selectedVideo.video_url || selectedVideo.result_video_url || ""}`}
                    poster={selectedVideo.thumbnail_url ? `${apiConfig.getBaseUrl()}${selectedVideo.thumbnail_url}` : undefined}
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
