"use client"

import { useState, useEffect } from "react"
import { Clock, Download, CheckCircle, AlertCircle, Plus, Crown, User, ArrowLeft, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { apiConfig } from "@/lib/api-config"
import { getMovieTitle } from "@/lib/movie-utils"
import { VideoJob } from "@/types/video-job"
import { getQiniuBackdropUrl } from "@/lib/qiniu-config"

export default function VideoGenerationPage() {
  const [jobs, setJobs] = useState<VideoJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const jobsPerPage = 12

  const router = useRouter()
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()

  // Use auth guard to handle authentication
  const { isAuthenticated, loading: authLoading } = useAuthGuard({ requireAuth: true })

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchJobs(currentPage)
    }
  }, [isAuthenticated, authLoading, currentPage])

  const fetchJobs = async (page: number = 1) => {
    if (!user) return

    try {
      setLoading(true)
      // Calculate offset for pagination (backend uses offset, not page)
      const offset = (page - 1) * jobsPerPage

      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.videoJobs.list()}?limit=${jobsPerPage}&offset=${offset}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        // Backend returns array directly, filter for completed jobs
        const allJobs = Array.isArray(data) ? data : []
        const completedJobs = allJobs.filter((job: VideoJob) => job.status === 'completed')

        setJobs(completedJobs)

        // For total count, we need to make a separate request or estimate
        // Since we're filtering completed jobs, we'll need to fetch more to get accurate count
        if (page === 1) {
          // On first page, fetch a larger set to estimate total completed jobs
          const largeResponse = await apiConfig.makeAuthenticatedRequest(
            `${apiConfig.videoJobs.list()}?limit=1000&offset=0`,
            { method: 'GET' }
          )
          if (largeResponse.ok) {
            const largeData = await largeResponse.json()
            const allCompletedJobs = Array.isArray(largeData) ? largeData.filter((job: VideoJob) => job.status === 'completed') : []
            setTotalJobs(allCompletedJobs.length)
          } else {
            setTotalJobs(completedJobs.length)
          }
        }

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
    const iconClasses = theme === "light"
      ? {
          completed: "text-green-600",
          processing: "text-blue-600",
          pending: "text-yellow-600",
          failed: "text-red-600"
        }
      : {
          completed: "text-green-400",
          processing: "text-blue-400",
          pending: "text-yellow-400",
          failed: "text-red-400"
        }

    switch (status) {
      case "completed":
        return <CheckCircle className={`w-5 h-5 ${iconClasses.completed}`} />
      case "processing":
        return <Clock className={`w-5 h-5 ${iconClasses.processing}`} />
      case "pending":
        return <AlertCircle className={`w-5 h-5 ${iconClasses.pending}`} />
      case "failed":
        return <AlertCircle className={`w-5 h-5 ${iconClasses.failed}`} />
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

  // Remove video play handler - cards will navigate directly

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

  const getTimeGroup = (dateString: string, todayJobsCount: number = 0) => {
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffInMs = now.getTime() - date.getTime()
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      // For the last 24 hours, group by hour if there are many videos today (>6)
      if (diffInHours < 24 && todayJobsCount > 6) {
        if (diffInHours === 0) {
          return language === "zh" ? "刚刚" : "Just now"
        } else if (diffInHours === 1) {
          return language === "zh" ? "1 小时前" : "1 hour ago"
        } else {
          return language === "zh" ? `${diffInHours} 小时前` : `${diffInHours} hours ago`
        }
      } else if (diffInDays === 0) {
        return language === "zh" ? "今天" : "Today"
      } else if (diffInDays === 1) {
        return language === "zh" ? "昨天" : "Yesterday"
      } else if (diffInDays <= 7) {
        return language === "zh" ? `${diffInDays}天前` : `${diffInDays} days ago`
      } else if (diffInDays <= 30) {
        const weeks = Math.floor(diffInDays / 7)
        return language === "zh" ? `${weeks}周前` : `${weeks} week${weeks > 1 ? 's' : ''} ago`
      } else {
        const months = Math.floor(diffInDays / 30)
        return language === "zh" ? `${months}个月前` : `${months} month${months > 1 ? 's' : ''} ago`
      }
    } catch {
      return language === "zh" ? "未知时间" : "Unknown time"
    }
  }

  const groupJobsByTime = (jobs: VideoJob[]) => {
    const groups: { [key: string]: VideoJob[] } = {}

    // Count today's jobs to determine if we should group by hour
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayJobs = jobs.filter(job => new Date(job.created_at) >= todayStart)
    const todayJobsCount = todayJobs.length

    jobs.forEach(job => {
      const group = getTimeGroup(job.created_at, todayJobsCount)
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(job)
    })

    // Sort groups by time (most recent first)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
      const aJob = groups[a][0]
      const bJob = groups[b][0]
      return new Date(bJob.created_at).getTime() - new Date(aJob.created_at).getTime()
    })

    return sortedGroups
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "theme-text-primary",
        secondaryText: "theme-text-secondary",
        card: "theme-bg-elevated border-gray-200/50",
        cardHover: "hover:shadow-lg transition-all duration-300",
        button: "theme-button-primary",
        outlineButton: "theme-button-secondary",
        accent: "theme-brand-primary",
        error: "theme-status-error",
      }
    }
    /* dark-theme refactor */
    return {
      background: "theme-gradient-hero",
      text: "theme-text-primary",
      secondaryText: "theme-text-secondary",
      card: "theme-surface-elevated border-white/20",
      cardHover: "hover:shadow-xl transition-all duration-300",
      button: "theme-button-primary",
      outlineButton: "theme-button-secondary",
      accent: "theme-brand-primary",
      error: "theme-status-error",
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("videoGeneration.title")}>
        <div className="container px-3 px-md-4 px-lg-3">
          <div className="flex flex-wrap -mx-4">
            <div className="hidden xl:block xl:w-1/12 px-4" />
            <div className="w-full xl:w-10/12 lg:w-full px-4">
              <div className="px-3 md:px-0 py-8">
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
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${theme === "light" ? "border-purple-600" : "border-violet-400"}`}></div>
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
                  onClick={() => fetchJobs(currentPage)}
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
                <div className="space-y-8">
                  {groupJobsByTime(jobs).map(([groupName, groupJobs]) => (
                    <div key={groupName}>
                      <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center gap-2`}>
                        <Clock className="w-5 h-5" />
                        {groupName}
                        <span className={`text-sm ${themeClasses.secondaryText} font-normal`}>
                          ({groupJobs.length} {language === "zh" ? "个视频" : "videos"})
                        </span>
                      </h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupJobs.map((job) => (
                    <Card
                      key={job.id}
                      className={`${themeClasses.card} overflow-hidden hover:scale-105 transition-transform cursor-pointer`}
                      onClick={() => router.push(`/video-generation/${job.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={job.movie_id ? getQiniuBackdropUrl(job.movie_id) : "/placeholder.svg"}
                            alt={getMovieTitle(job, language)}
                            className="w-full h-32 object-cover"
                          />

                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            {getStatusIcon(job.status)}
                            <Badge className="bg-black/70 text-white text-xs">
                              {job.resolution}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className={`${themeClasses.text} font-semibold text-lg mb-2`}>
                            {getMovieTitle(job, language)}
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
                                  className={`flex-1 ${themeClasses.button} text-white`}
                                  onClick={() => window.location.href = `${apiConfig.getBaseUrl()}${job.video_url || job.result_video_url}`}
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
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && totalJobs > jobsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={themeClasses.outlineButton}
                  >
                    {language === "zh" ? "上一页" : "Previous"}
                  </Button>

                  <span className={themeClasses.text}>
                    {language === "zh"
                      ? `第 ${currentPage} 页，共 ${Math.ceil(totalJobs / jobsPerPage)} 页`
                      : `Page ${currentPage} of ${Math.ceil(totalJobs / jobsPerPage)}`
                    }
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalJobs / jobsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(totalJobs / jobsPerPage)}
                    className={themeClasses.outlineButton}
                  >
                    {language === "zh" ? "下一页" : "Next"}
                  </Button>
                </div>
              )}
            </div>
          )}


              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
