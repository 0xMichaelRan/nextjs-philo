"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Clock, Play, Download, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
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

export default function VideoJobPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()

  const [job, setJob] = useState<VideoJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const jobId = params.job_id as string

  const fetchJob = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.videoJobs.details(parseInt(jobId)),
        { method: 'GET' }
      )

      if (response.ok) {
        const jobData = await response.json()
        setJob(jobData)
        setError(null)
      } else if (response.status === 404) {
        setError(language === "zh" ? "视频任务未找到" : "Video job not found")
      } else {
        setError(language === "zh" ? "获取任务信息失败" : "Failed to fetch job information")
      }
    } catch (err) {
      console.error('Error fetching video job:', err)
      setError(language === "zh" ? "网络错误" : "Network error")
    } finally {
      setLoading(false)
    }
  }

  // Start polling for job updates
  useEffect(() => {
    fetchJob()

    // Poll every 5 seconds if job is in progress
    const interval = setInterval(() => {
      if (job && (job.status === 'pending' || job.status === 'queued' || job.status === 'processing')) {
        fetchJob()
      }
    }, 5000)

    setPollingInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [jobId, user])

  // Stop polling when job is completed or failed
  useEffect(() => {
    if (job && (job.status === 'completed' || job.status === 'failed') && pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }, [job?.status, pollingInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'processing': return 'bg-blue-500'
      case 'queued': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    if (language === "zh") {
      switch (status) {
        case 'pending': return '等待中'
        case 'queued': return '队列中'
        case 'processing': return '处理中'
        case 'completed': return '已完成'
        case 'failed': return '失败'
        default: return status
      }
    } else {
      switch (status) {
        case 'pending': return 'Pending'
        case 'queued': return 'Queued'
        case 'processing': return 'Processing'
        case 'completed': return 'Completed'
        case 'failed': return 'Failed'
        default: return status
      }
    }
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400",
        card: "bg-white/90 backdrop-blur-sm border-white/20",
        text: "text-gray-900",
        secondaryText: "text-gray-600",
        accent: "from-purple-600 to-pink-600"
      }
    }
    return {
      background: "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900",
      card: "bg-white/10 backdrop-blur-sm border-white/20",
      text: "text-white",
      secondaryText: "text-gray-300",
      accent: "from-orange-500 to-red-600"
    }
  }

  const themeClasses = getThemeClasses()

  if (loading) {
    return (
      <div className={themeClasses.background}>
        <AppLayout>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className={themeClasses.text}>
                {language === "zh" ? "加载中..." : "Loading..."}
              </p>
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className={themeClasses.background}>
        <AppLayout>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className={`${themeClasses.text} text-2xl font-bold mb-4`}>
                {language === "zh" ? "出错了" : "Something went wrong"}
              </h2>
              <p className={`${themeClasses.secondaryText} mb-6`}>
                {error}
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => {
                    // Navigate based on job status if available, otherwise go to job-pending
                    if (job && job.status === 'completed') {
                      router.push('/video-generation')
                    } else {
                      router.push('/job-pending')
                    }
                  }}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === "zh" ? "返回" : "Go Back"}
                </Button>
                <Button onClick={fetchJob}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === "zh" ? "重试" : "Retry"}
                </Button>
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  return (
    <div className={themeClasses.background}>
      <AppLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Navigate based on job status
                  if (job && (job.status === 'pending' || job.status === 'processing')) {
                    router.push('/job-pending')
                  } else {
                    router.push('/video-generation')
                  }
                }}
                className={`${themeClasses.text} hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "zh" ? "返回" : "Back"}
              </Button>
              <div>
                <h1 className={`${themeClasses.text} text-2xl font-bold`}>
                  {language === "zh" ? "视频生成" : "Video Generation"}
                </h1>
                <p className={themeClasses.secondaryText}>
                  {job.movie_title}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(job.status)} text-white`}>
              {getStatusText(job.status)}
            </Badge>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Card */}
            <Card className={themeClasses.card}>
              <CardHeader>
                <CardTitle className={themeClasses.text}>
                  {language === "zh" ? "任务状态" : "Job Status"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={themeClasses.secondaryText}>
                      {language === "zh" ? "进度" : "Progress"}
                    </span>
                    <span className={themeClasses.text}>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={themeClasses.secondaryText}>
                      {language === "zh" ? "创建时间" : "Created"}
                    </span>
                    <p className={themeClasses.text}>
                      {new Date(job.created_at).toLocaleString()}
                    </p>
                  </div>
                  {job.completed_at && (
                    <div>
                      <span className={themeClasses.secondaryText}>
                        {language === "zh" ? "完成时间" : "Completed"}
                      </span>
                      <p className={themeClasses.text}>
                        {new Date(job.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {job.error_message && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{job.error_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Preview */}
            {job.status === 'completed' && job.video_url && (
              <Card className={themeClasses.card}>
                <CardHeader>
                  <CardTitle className={themeClasses.text}>
                    {language === "zh" ? "视频预览" : "Video Preview"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoPlayer
                    src={job.video_url}
                    poster={job.thumbnail_url}
                    className="w-full rounded-lg"
                  />
                  <div className="mt-4 flex space-x-2">
                    <Button asChild className="flex-1">
                      <a href={job.video_url} download>
                        <Download className="w-4 h-4 mr-2" />
                        {language === "zh" ? "下载视频" : "Download Video"}
                      </a>
                    </Button>
                    {job.narration_audio_url && (
                      <Button variant="outline" asChild>
                        <a href={job.narration_audio_url} download>
                          <Download className="w-4 h-4 mr-2" />
                          {language === "zh" ? "下载音频" : "Download Audio"}
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Job Details */}
          <Card className={`${themeClasses.card} mt-8`}>
            <CardHeader>
              <CardTitle className={themeClasses.text}>
                {language === "zh" ? "任务详情" : "Job Details"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={themeClasses.secondaryText}>
                    {language === "zh" ? "电影ID" : "Movie ID"}
                  </span>
                  <p className={themeClasses.text}>{job.movie_id}</p>
                </div>
                <div>
                  <span className={themeClasses.secondaryText}>
                    {language === "zh" ? "语音" : "Voice"}
                  </span>
                  <p className={themeClasses.text}>{job.voice_name || job.voice_id}</p>
                </div>
                <div>
                  <span className={themeClasses.secondaryText}>
                    {language === "zh" ? "语音语言" : "Voice Language"}
                  </span>
                  <p className={themeClasses.text}>{job.voice_language}</p>
                </div>
                <div>
                  <span className={themeClasses.secondaryText}>
                    {language === "zh" ? "TTS提供商" : "TTS Provider"}
                  </span>
                  <p className={themeClasses.text}>{job.tts_provider}</p>
                </div>
                <div>
                  <span className={themeClasses.secondaryText}>
                    {language === "zh" ? "视频质量" : "Video Quality"}
                  </span>
                  <p className={themeClasses.text}>{job.video_quality}</p>
                </div>
                <div>
                  <span className={themeClasses.secondaryText}>
                    {language === "zh" ? "分辨率" : "Resolution"}
                  </span>
                  <p className={themeClasses.text}>{job.video_resolution}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TTS Text Content */}
          <Card className={`${themeClasses.card} mt-8`}>
            <CardHeader>
              <CardTitle className={themeClasses.text}>
                {language === "zh" ? "TTS文本内容" : "TTS Text Content"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className={`${themeClasses.secondaryText} text-sm font-medium`}>
                    {language === "zh" ? "文本长度" : "Text Length"}
                  </span>
                  <p className={themeClasses.text}>
                    {job.tts_text.length} {language === "zh" ? "字符" : "characters"}
                  </p>
                </div>
                <div>
                  <span className={`${themeClasses.secondaryText} text-sm font-medium`}>
                    {language === "zh" ? "文本内容" : "Text Content"}
                  </span>
                  <div className={`${themeClasses.text} mt-2 p-4 bg-gray-100/20 rounded-lg max-h-96 overflow-y-auto`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {job.tts_text}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  )
}
