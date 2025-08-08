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

interface Job {
  id: string
  movieTitle: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  estimatedTime?: number
  queuePosition?: number
  createdAt: string
  completedAt?: string
  downloadUrl?: string
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
  const { theme } = useTheme()
  const { language } = useLanguage()

  useEffect(() => {
    // Simulate progress updates
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job =>
        job.status === "processing"
          ? { ...job, progress: Math.min(job.progress + 1, 95) }
          : job
      ))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: Job['status']) => {
    const badges = {
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

  return (
    <AppLayout title={language === "zh" ? "视频任务" : "Video Jobs"}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === "zh" ? "视频任务" : "Video Jobs"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === "zh" ? "查看您的视频生成进度" : "Track your video generation progress"}
            </p>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.movieTitle}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === "zh" ? "创建于" : "Created"} {job.createdAt}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  {/* Progress for processing jobs */}
                  {job.status === "processing" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === "zh" ? "进度" : "Progress"}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {job.progress}%
                        </span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}

                  {/* Queue position for queued jobs */}
                  {job.status === "queued" && job.queuePosition && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === "zh" ? `队列位置: 第 ${job.queuePosition} 位` : `Queue position: #${job.queuePosition}`}
                      </p>
                      {job.estimatedTime && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "zh" ? "预计等待时间" : "Estimated wait"}: {formatTime(job.estimatedTime)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Download button for completed jobs */}
                  {job.status === "completed" && job.downloadUrl && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        {language === "zh" ? "播放" : "Play"}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {language === "zh" ? "下载" : "Download"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {jobs.length === 0 && (
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {language === "zh" ? "暂无任务" : "No jobs yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === "zh" ? "您还没有创建任何视频任务" : "You haven't created any video jobs yet"}
                  </p>
                  <Link href="/movie-selection">
                    <Button className="mt-4">
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
