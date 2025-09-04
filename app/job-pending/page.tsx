"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Clock, Play, Download, CheckCircle, AlertCircle, RefreshCw, Film, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"
import { apiConfig } from "@/lib/api-config"

// Utility function for relative time formatting
const formatRelativeTime = (dateString: string, language: string = 'en'): string => {
  if (!dateString) {
    return language === "zh" ? "时间未知" : "Unknown time"
  }

  const now = new Date()
  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return language === "zh" ? "时间格式错误" : "Invalid time format"
  }

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return language === "zh" ? `${diffInSeconds}秒前` : `${diffInSeconds}s ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return language === "zh" ? `${minutes}分钟前` : `${minutes}min ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return language === "zh" ? `${hours}小时前` : `${hours}h ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return language === "zh" ? `${days}天前` : `${days}D ago`
  } else {
    const months = Math.floor(diffInSeconds / 2592000)
    return language === "zh" ? `${months}个月前` : `${months}M ago`
  }
}

interface Job {
  id: string
  movieTitle: string
  status: 'draft' | 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress?: number
  estimatedTime?: number
  queuePosition?: number
  createdAt: string
  updatedAt: string
  createdAtFormatted?: string
  updatedAtFormatted?: string
  completedAt?: string
  downloadUrl?: string
  video_url?: string
  thumbnail_url?: string
  error_message?: string
  poster_url?: string
  backdrop_url?: string
}

interface JobLimits {
  plan: string
  daily_jobs: {
    used: number
    limit: number
    remaining: number
  }
  monthly_jobs: {
    used: number
    limit: number
    remaining: number
  }
  pending_jobs: {
    used: number
    limit: number
    remaining: number
  }
  can_create_job: boolean
}



export default function JobPendingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [jobLimits, setJobLimits] = useState<JobLimits | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [showFailedJobs, setShowFailedJobs] = useState(false)
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { user } = useAuth()
  const { onJobUpdate } = useRealtimeNotifications()

  const fetchJobs = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.videoJobs.list()
      )

      if (response.ok) {
        const data = await response.json()
        // Map backend video job data to frontend Job interface and add movie images
        // Video jobs API returns array directly, not wrapped in {jobs: [...]}
        const jobsArray = Array.isArray(data) ? data : (data.jobs || [])

        // Filter jobs: include all pending jobs + completed jobs from last 1 minute
        const now = new Date()
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000) // 1 minute ago

        const filteredJobs = jobsArray.filter((job: any) => {
          // Include all non-completed jobs
          if (job.status !== 'completed') {
            return true
          }

          // Include completed jobs from last 1 minute
          if (job.status === 'completed' && job.updated_at) {
            const completedAt = new Date(job.updated_at)
            return completedAt >= oneMinuteAgo
          }

          return false
        })
        const mappedJobs = await Promise.all(filteredJobs.map(async (job: any) => {
          const baseJob = {
            ...job,
            movieTitle: (() => {
              // Handle movie_title as object with language keys
              if (typeof job.movie_title === 'object' && job.movie_title) {
                return job.movie_title[language] || job.movie_title.en || job.movie_title.zh || 'Unknown Movie'
              }
              // Fallback to string fields
              return job.movie_title || job.movie_title_en || job.movie_title_zh || 'Unknown Movie'
            })(),
            // Keep original timestamps for calculations, add formatted versions
            createdAtFormatted: job.created_at ? formatRelativeTime(job.created_at, language) : (language === "zh" ? "时间未知" : "Unknown time"),
            updatedAtFormatted: job.updated_at ? formatRelativeTime(job.updated_at, language) : (language === "zh" ? "时间未知" : "Unknown time"),
          }

          // Add movie images if movie_id exists
          if (job.movie_id) {
            baseJob.poster_url = `${process.env.NEXT_PUBLIC_API_URL}/static/${job.movie_id}/image?file=poster`
            baseJob.backdrop_url = `${process.env.NEXT_PUBLIC_API_URL}/static/${job.movie_id}/image?file=backdrop`
          }

          return baseJob
        }))
        setJobs(mappedJobs)
      } else {
        setError("Failed to fetch jobs")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError("Error fetching jobs")
    } finally {
      setLoading(false)
    }
  }

  const fetchJobLimits = async () => {
    if (!user) return

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.auth.userLimits()
      )

      if (response.ok) {
        const data = await response.json()
        setJobLimits(data)
      }
    } catch (error) {
      console.error("Error fetching job limits:", error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchJobs()
      fetchJobLimits()
    }
  }, [user])

  // No more HTTP polling - using SSE for real-time updates

  // Check for error from URL params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      window.location.href = "/auth?redirect=job-pending"
    }
  }, [user])

  // Periodic update for timestamps and job status (every 5 seconds)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      setLastUpdateTime(new Date())

      // Update formatted timestamps for all jobs
      setJobs(prevJobs => {
        const updatedJobs = prevJobs.map(job => ({
          ...job,
          createdAtFormatted: job.createdAt ? formatRelativeTime(job.createdAt, language) : (language === "zh" ? "时间未知" : "Unknown time"),
          updatedAtFormatted: job.updatedAt ? formatRelativeTime(job.updatedAt, language) : (language === "zh" ? "时间未知" : "Unknown time"),
        }))

        // Check if there are pending jobs and refresh if needed
        const hasPendingJobs = updatedJobs.some(job =>
          job.status === 'pending' || job.status === 'queued' || job.status === 'processing'
        )

        if (hasPendingJobs) {
          // Use setTimeout to avoid blocking the state update
          setTimeout(() => fetchJobs(), 100)
        }

        return updatedJobs
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [user, language]) // Remove jobs dependency to prevent recreation

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50 backdrop-blur-md",
        cardHover: "hover:bg-white/90 hover:shadow-lg transition-all duration-300",
        accent: "text-orange-600",
        button: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
        outlineButton: "border-gray-300 text-gray-700 hover:bg-gray-50",
      }
    }
    return {
      background: "bg-gradient-to-br from-orange-900 via-red-900 to-pink-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20 backdrop-blur-md",
      cardHover: "hover:bg-white/20 hover:shadow-xl transition-all duration-300",
      accent: "text-orange-400",
      button: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
      outlineButton: "border-white/20 text-white hover:bg-white/10",
    }
  }

  const themeClasses = getThemeClasses()

  // Subscribe to real-time job updates
  useEffect(() => {
    if (!user) return

    const unsubscribe = onJobUpdate((data) => {
      // Update specific job in the list
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === data.job_id
            ? { ...job, status: data.status as Job['status'], progress: data.progress }
            : job
        )
        // Don't filter out completed jobs - let user see completion status
      )

      // Refresh job limits when job status changes (especially when completed)
      if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
        fetchJobLimits()
      }
    })

    return unsubscribe
  }, [user, onJobUpdate])

  const getStatusBadge = (status: Job['status']) => {
    const badges = {
      draft: {
        text: language === "zh" ? "草稿" : "Draft",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        icon: <Clock className="w-4 h-4" />
      },
      pending: {
        text: language === "zh" ? "待处理" : "Pending",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        icon: <Clock className="w-4 h-4" />
      },
      queued: {
        text: language === "zh" ? "排队中" : "Queued",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: <Clock className="w-4 h-4" />
      },
      processing: {
        text: language === "zh" ? "处理中" : "Processing",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: <RefreshCw className="w-4 h-4 animate-spin" />
      },
      completed: {
        text: language === "zh" ? "已完成" : "Completed",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: <CheckCircle className="w-4 h-4" />
      },
      failed: {
        text: language === "zh" ? "失败" : "Failed",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: <AlertCircle className="w-4 h-4" />
      },
      cancelled: {
        text: language === "zh" ? "已取消" : "Cancelled",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        icon: <AlertCircle className="w-4 h-4" />
      }
    }

    const badge = badges[status]
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return language === "zh" ? `约 ${mins} 分钟` : `~${mins} min`
  }

  const calculateWaitingTime = (createdAt: string) => {
    if (!createdAt) {
      return language === "zh" ? "时间未知" : "Unknown time"
    }

    const created = new Date(createdAt)
    const now = new Date()

    // Check if date is valid
    if (isNaN(created.getTime())) {
      return language === "zh" ? "时间格式错误" : "Invalid time format"
    }

    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) {
      return language === "zh" ? "刚刚创建" : "Just created"
    } else if (diffMins < 60) {
      return language === "zh" ? `等待了 ${diffMins} 分钟` : `Waiting for ${diffMins} min`
    } else {
      const diffHours = Math.floor(diffMins / 60)
      const remainingMins = diffMins % 60
      return language === "zh"
        ? `等待了 ${diffHours} 小时 ${remainingMins} 分钟`
        : `Waiting for ${diffHours}h ${remainingMins}m`
    }
  }

  // Filter jobs by status
  const pendingJobs = jobs.filter(job => ['draft', 'pending', 'queued', 'processing'].includes(job.status))
  const completedJobs = jobs.filter(job => job.status === 'completed')
  const failedJobs = jobs.filter(job => ['failed', 'cancelled'].includes(job.status))

  // Sort completed jobs first (most recent first), then pending jobs
  const sortedCompletedJobs = completedJobs.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  const sortedPendingJobs = pendingJobs.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const displayedJobs = showFailedJobs
    ? [...sortedCompletedJobs, ...sortedPendingJobs, ...failedJobs]
    : [...sortedCompletedJobs, ...sortedPendingJobs]

  // Monthly jobs count is now provided by the API

  return (
    <div className={themeClasses.background}>
      <AppLayout title={language === "zh" ? "视频任务" : "Video Jobs"}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                  {language === "zh" ? "任务队列" : "Job Queue"}
                </h1>
                <p className={`${themeClasses.text} opacity-80`}>
                  {language === "zh" ? "查看您的视频生成进度" : "Track your video generation progress"}
                </p>
              </div>
              <Button
                onClick={() => router.push('/video-generation')}
                variant="outline"
                className={`flex items-center gap-2 ${themeClasses.outlineButton}`}
              >
                <Film className="h-4 w-4" />
                {language === "zh" ? "我的视频" : "My Videos"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Job Status Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className={`${themeClasses.text} text-sm`}>
                  {language === "zh" ? "显示任务：" : "Show jobs:"}
                </span>
                <div className="flex items-center gap-2">
                  {completedJobs.length > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {language === "zh" ? `刚完成 (${completedJobs.length})` : `Just Completed (${completedJobs.length})`}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    {language === "zh" ? `待处理 (${pendingJobs.length})` : `Pending (${pendingJobs.length})`}
                  </Badge>
                  {failedJobs.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFailedJobs(!showFailedJobs)}
                      className={`text-red-600 border-red-600 hover:bg-red-50 ${showFailedJobs ? 'bg-red-50' : ''}`}
                    >
                      {showFailedJobs ?
                        (language === "zh" ? `隐藏失败任务 (${failedJobs.length})` : `Hide Failed (${failedJobs.length})`) :
                        (language === "zh" ? `显示失败任务 (${failedJobs.length})` : `Show Failed (${failedJobs.length})`)
                      }
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className={`${themeClasses.card} mb-6 border-red-500`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-600">
                      {language === "zh" ? "提交失败" : "Submission Failed"}
                    </h3>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="ml-auto"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* VIP Limits Display */}
          {jobLimits && (
            <Card className={`${themeClasses.card} ${themeClasses.cardHover} mb-6`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                      {language === "zh" ? "当前计划" : "Current Plan"}
                    </h3>
                    <div className={`text-2xl font-bold ${themeClasses.accent}`}>
                      {jobLimits.plan}
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                      {language === "zh" ? "等待中任务" : "Pending Jobs"}
                    </h3>
                    <div className={`text-2xl font-bold ${themeClasses.text}`}>
                      {jobLimits.pending_jobs.used} / {jobLimits.pending_jobs.limit}
                    </div>
                    <p className={`text-sm ${themeClasses.secondaryText}`}>
                      {language === "zh" ? `还可创建 ${jobLimits.pending_jobs.remaining} 个` : `${jobLimits.pending_jobs.remaining} remaining`}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                      {language === "zh" ? "本月任务" : "Monthly Jobs"}
                    </h3>
                    <div className={`text-2xl font-bold ${themeClasses.text}`}>
                      {jobLimits.monthly_jobs.used} / {jobLimits.monthly_jobs.limit}
                    </div>
                    <p className={`text-sm ${themeClasses.secondaryText}`}>
                      {language === "zh" ? `还可创建 ${jobLimits.monthly_jobs.remaining} 个` : `${jobLimits.monthly_jobs.remaining} remaining`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jobs List */}
          <div className="space-y-6">
            {loading ? (
              <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className={themeClasses.secondaryText}>
                    {language === "zh" ? "加载中..." : "Loading jobs..."}
                  </p>
                </CardContent>
              </Card>
            ) : displayedJobs.map((job) => (
              <Card
                key={job.id}
                className={`${themeClasses.card} ${themeClasses.cardHover} shadow-lg relative overflow-hidden border-l-4 border-orange-500 cursor-pointer transition-transform hover:scale-[1.02]`}
                style={{
                  backgroundImage: job.backdrop_url ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${job.backdrop_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={() => router.push(`/video-generation/${job.id}`)}
              >
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Poster Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-md shadow-md overflow-hidden flex items-center justify-center">
                        {job.poster_url ? (
                          <img
                            src={job.poster_url}
                            alt={job.movieTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                  </svg>
                                </div>
                              `
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${job.backdrop_url ? 'text-white' : themeClasses.text}`}>
                            {job.movieTitle}
                          </h3>
                          <p className={`text-sm ${job.backdrop_url ? 'text-gray-200' : themeClasses.secondaryText}`}>
                            {language === "zh" ? "创建于" : "Created"} {job.createdAtFormatted}
                          </p>
                          <p className={`text-sm ${job.backdrop_url ? 'text-gray-200' : themeClasses.secondaryText}`}>
                            {language === "zh" ? "更新于" : "Updated"} {job.updatedAtFormatted}
                          </p>
                          {(job.status === "pending" || job.status === "queued" || job.status === "processing") && (
                            <p className={`text-sm ${job.backdrop_url ? 'text-gray-100 font-medium' : `${themeClasses.secondaryText} font-medium`}`}>
                              {job.createdAt ? calculateWaitingTime(job.createdAt) : (language === "zh" ? "等待时间未知" : "Waiting time unknown")}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                  </div>

                  {/* Progress for processing jobs */}
                  {job.status === "processing" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className={themeClasses.secondaryText}>
                          {language === "zh" ? "进度" : "Progress"}
                        </span>
                        <span className={`${themeClasses.text} font-medium`}>
                          {job.progress}%
                        </span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}

                  {/* Queue position for queued jobs */}
                  {job.status === "queued" && job.queuePosition && (
                    <div className="mb-4">
                      <p className={`text-sm ${themeClasses.secondaryText}`}>
                        {language === "zh" ? `队列位置: 第 ${job.queuePosition} 位` : `Queue position: #${job.queuePosition}`}
                      </p>
                      {job.estimatedTime && (
                        <p className={`text-sm ${themeClasses.secondaryText}`}>
                          {language === "zh" ? "预计等待时间" : "Estimated wait"}: {formatTime(job.estimatedTime)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Download button for completed jobs */}
                  {job.status === "completed" && (job.video_url || job.downloadUrl) && (
                    <div className="flex gap-2">
                      {(job.video_url || job.downloadUrl) && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(job.video_url || job.downloadUrl, '_blank')
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {language === "zh" ? "播放" : "Play"}
                        </Button>
                      )}
                      {(job.video_url || job.downloadUrl) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            const videoUrl = job.video_url || job.downloadUrl
                            if (videoUrl) {
                              const link = document.createElement('a')
                              link.href = videoUrl
                              link.download = `${job.movieTitle}_analysis.mp4`
                              link.click()
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {language === "zh" ? "下载" : "Download"}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Error message for failed jobs */}
                  {job.status === "failed" && job.error_message && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {job.error_message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {jobs.length === 0 && (
              <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                <CardContent className="p-12 text-center">
                  <Clock className={`w-16 h-16 ${themeClasses.accent} mx-auto mb-6`} />
                  <h3 className={`text-xl font-semibold ${themeClasses.text} mb-3`}>
                    {language === "zh" ? "暂无任务" : "No jobs yet"}
                  </h3>
                  <p className={`${themeClasses.secondaryText} mb-6`}>
                    {language === "zh" ? "您还没有创建任何视频任务" : "You haven't created any video jobs yet"}
                  </p>
                  <Link href="/movie-selection">
                    <Button className={`${themeClasses.button} text-white px-8 py-3 rounded-lg font-semibold`}>
                      {language === "zh" ? "创建视频" : "Create Video"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </AppLayout>
    </div>
  )
}
