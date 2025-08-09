"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Clock, Play, Download, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"

interface Job {
  id: string
  movieTitle: string
  status: 'draft' | 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  estimatedTime?: number
  queuePosition?: number
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  video_url?: string
  thumbnail_url?: string
  error_message?: string
  external_job_id?: string
}

interface JobLimits {
  plan: string
  pending_jobs: {
    current: number
    limit: number
    remaining: number
  }
  monthly_jobs: {
    current: number
    limit: number | null
    remaining: number | null
  }
  can_create_job: boolean
}

// Simple mock data
const mockJobs: Job[] = [
  {
    id: "1",
    movieTitle: "The Shawshank Redemption",
    status: "processing",
    progress: 65,
    estimatedTime: 120,
    createdAt: "2024-01-21 15:30",
  },
  {
    id: "2",
    movieTitle: "Forrest Gump",
    status: "queued",
    progress: 0,
    queuePosition: 2,
    estimatedTime: 300,
    createdAt: "2024-01-21 15:45",
  },
  {
    id: "3",
    movieTitle: "The Godfather",
    status: "completed",
    progress: 100,
    createdAt: "2024-01-20 14:30",
    completedAt: "2024-01-20 15:45",
    downloadUrl: "/download/video-3.mp4",
  },
]

export default function JobPendingPage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState(mockJobs)
  const [loading, setLoading] = useState(true)
  const [jobLimits, setJobLimits] = useState<JobLimits | null>(null)
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { user } = useAuth()

  // Fetch jobs from API
  const fetchJobs = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.jobs.list()
      )

      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch job limits
  const fetchJobLimits = async () => {
    if (!user) return

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.jobs.limits()
      )

      if (response.ok) {
        const data = await response.json()
        setJobLimits(data)
      }
    } catch (error) {
      console.error("Error fetching job limits:", error)
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      window.location.href = "/auth?redirect=job-pending"
    } else {
      fetchJobs()
      fetchJobLimits()
    }
  }, [user])

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
        cardHover: "hover:bg-white/90",
      }
    }
    return {
      background: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
      cardHover: "hover:bg-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  useEffect(() => {
    if (!user) return

    // Poll for job updates every 5 seconds
    const interval = setInterval(() => {
      fetchJobs()
      fetchJobLimits()
    }, 5000)

    return () => clearInterval(interval)
  }, [user])

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
    const created = new Date(createdAt)
    const now = new Date()
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

  return (
    <AppLayout title={language === "zh" ? "视频任务" : "Video Jobs"}>
      <div className={`min-h-screen ${themeClasses.background}`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
              {language === "zh" ? "视频任务" : "Video Jobs"}
            </h1>
            <p className={themeClasses.secondaryText}>
              {language === "zh" ? "查看您的视频生成进度" : "Track your video generation progress"}
            </p>
          </div>

          {/* VIP Limits Display */}
          {jobLimits && (
            <Card className={`${themeClasses.card} mb-6`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                      {language === "zh" ? "当前计划" : "Current Plan"}
                    </h3>
                    <div className={`text-2xl font-bold ${jobLimits.plan === 'SVIP' ? 'text-purple-600' : jobLimits.plan === 'VIP' ? 'text-blue-600' : 'text-gray-600'}`}>
                      {jobLimits.plan}
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                      {language === "zh" ? "等待中任务" : "Pending Jobs"}
                    </h3>
                    <div className={`text-2xl font-bold ${themeClasses.text}`}>
                      {jobLimits.pending_jobs.current} / {jobLimits.pending_jobs.limit}
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
                      {jobLimits.monthly_jobs.current} / {jobLimits.monthly_jobs.limit || "∞"}
                    </div>
                    {jobLimits.monthly_jobs.limit && (
                      <p className={`text-sm ${themeClasses.secondaryText}`}>
                        {language === "zh" ? `还可创建 ${jobLimits.monthly_jobs.remaining} 个` : `${jobLimits.monthly_jobs.remaining} remaining`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jobs List */}
          <div className="space-y-4">
            {loading ? (
              <Card className={themeClasses.card}>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className={themeClasses.secondaryText}>
                    {language === "zh" ? "加载中..." : "Loading jobs..."}
                  </p>
                </CardContent>
              </Card>
            ) : jobs.map((job) => (
              <Card key={job.id} className={`${themeClasses.card} ${themeClasses.cardHover} shadow-sm transition-all duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                        {job.movieTitle}
                      </h3>
                      <p className={`text-sm ${themeClasses.secondaryText}`}>
                        {language === "zh" ? "创建于" : "Created"} {job.createdAt}
                      </p>
                      {(job.status === "pending" || job.status === "queued" || job.status === "processing") && (
                        <p className={`text-sm ${themeClasses.secondaryText} font-medium`}>
                          {calculateWaitingTime(job.createdAt)}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(job.status)}
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
                          onClick={() => window.open(job.video_url || job.downloadUrl, '_blank')}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {language === "zh" ? "播放" : "Play"}
                        </Button>
                      )}
                      {(job.video_url || job.downloadUrl) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
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
              <Card className={themeClasses.card}>
                <CardContent className="p-12 text-center">
                  <Clock className={`w-12 h-12 ${themeClasses.secondaryText} mx-auto mb-4`} />
                  <h3 className={`text-lg font-medium ${themeClasses.text} mb-2`}>
                    {language === "zh" ? "暂无任务" : "No jobs yet"}
                  </h3>
                  <p className={themeClasses.secondaryText}>
                    {language === "zh" ? "您还没有创建任何视频任务" : "You haven't created any video jobs yet"}
                  </p>
                  <Link href="/movie-selection">
                    <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      {language === "zh" ? "创建视频" : "Create Video"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
