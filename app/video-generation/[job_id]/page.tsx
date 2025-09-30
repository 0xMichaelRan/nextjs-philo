"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Download, AlertCircle, ArrowLeft, RefreshCw, ChevronDown, FileVideo, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { AppLayout } from "@/components/app-layout"
import { VideoPlayer } from "@/components/video-player"
import { SubtitleDisplay } from "@/components/subtitle-display"
import { CurrentSentenceDisplay } from "@/components/current-sentence-display"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"

import { apiConfig } from "@/lib/api-config"
import { formatSpeedDisplay } from "@/lib/speed-utils"
import { VideoJob, MovieData } from "@/types/video-job"

export default function VideoJobPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { onJobUpdate } = useRealtimeNotifications()
  const [job, setJob] = useState<VideoJob | null>(null)
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null)
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)

  const jobId = params.job_id as string

  const fetchVideoUrls = async () => {
    if (!user || !job || job.status !== 'completed') return

    try {
      // Fetch video URLs
      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.getBaseUrl()}/video-jobs/${jobId}/video-url`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Video URLs received:', data)

        // Use streaming URL as primary, fallback to download URL
        setDownloadUrl(data.download_url || data.video_url)
        setStreamingUrl(data.streaming_url)
        setSubtitleUrl(data.subtitle_url)

        console.log('Set video URL for playback:', data.streaming_url || data.download_url)
        console.log('Set download URL:', data.download_url || data.video_url)
        console.log('Set streaming URL:', data.streaming_url)
        console.log('Set subtitle URL:', data.subtitle_url)
      } else {
        console.error('Failed to fetch video URLs')
      }
    } catch (error) {
      console.error('Error fetching video URLs:', error)
    }
  }

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

        // Fetch movie data if movie_id exists
        if (jobData.movie_id) {
          try {
            const movieResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${jobData.movie_id}`)
            if (movieResponse.ok) {
              const movieInfo = await movieResponse.json()
              setMovieData(movieInfo)
            }
          } catch (movieErr) {
            console.error('Error fetching movie data:', movieErr)
          }
        }
      } else if (response.status === 404) {
        setError(t("videoGeneration.jobNotFound"))
      } else {
        setError(t("videoGeneration.fetchFailed"))
      }
    } catch (err) {
      console.error('Error fetching video job:', err)
      setError(t("common.networkError"))
    } finally {
      setLoading(false)
    }
  }

  // Initial job fetch
  useEffect(() => {
    if (user && jobId) {
      fetchJob()
    }
  }, [user, jobId]) // Include user dependency to handle page refresh

  // Subscribe to real-time job updates
  useEffect(() => {
    if (!user || !jobId) return

    const unsubscribe = onJobUpdate((data) => {
      // Update job if it matches current job ID (handle both string and number comparison)
      const currentJobId = parseInt(jobId)
      if (Number(data.job_id) === currentJobId) {
        console.log('Received job update for current job:', data)
        setJob(prevJob => {
          if (!prevJob) return null

          const updatedJob = {
            ...prevJob,
            status: data.status as VideoJob['status'],
            error_message: data.error_message,
            updated_at: new Date().toISOString()
          }

          // If job just completed, trigger video URL fetch
          if (data.status === 'completed' && prevJob.status !== 'completed') {
            console.log('Job completed, will fetch video URLs')
            setTimeout(() => fetchVideoUrls(), 1000) // Small delay to ensure backend is ready
          }

          return updatedJob
        })
      }
    })

    return unsubscribe
  }, [user, jobId, onJobUpdate])

  // Fetch video URLs when job is completed
  useEffect(() => {
    if (job && job.status === 'completed') {
      fetchVideoUrls()
    }
  }, [job?.status, user])

  const getStatusColor = (status: string) => {
    const colors = theme === "light"
      ? {
          completed: 'bg-green-500',
          failed: 'bg-red-500',
          processing: 'bg-blue-500',
          queued: 'bg-yellow-500',
          default: 'bg-gray-500'
        }
      : {
          completed: 'bg-green-400',
          failed: 'bg-red-400',
          processing: 'bg-blue-400',
          queued: 'bg-yellow-400',
          default: 'bg-gray-400'
        }

    switch (status) {
      case 'completed': return colors.completed
      case 'failed': return colors.failed
      case 'processing': return colors.processing
      case 'queued': return colors.queued
      default: return colors.default
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
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 gradient-float",
        card: "theme-bg-elevated backdrop-blur-sm theme-border",
        text: "theme-text-primary",
        secondaryText: "theme-text-secondary",
        accent: "theme-brand-primary",
        button: "theme-button-primary",
        filterButton: "theme-button-secondary"
      }
    }
    /* dark-theme refactor */
    return {
      background: "theme-gradient-hero",
      card: "theme-surface-elevated theme-border",
      text: "theme-text-primary",
      secondaryText: "theme-text-secondary",
      accent: "theme-brand-primary",
      button: "theme-button-primary",
      filterButton: "theme-button-secondary"
    }
  }

  const themeClasses = getThemeClasses()

  if (loading) {
    return (
      <div className={themeClasses.background}>
        <AppLayout>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-8">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${theme === "light" ? "border-purple-600" : "border-violet-400"}`}></div>
              <p className={themeClasses.text}>
                {t("common.loading") || (language === "zh" ? "加载中..." : "Loading...")}
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
              <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${theme === "light" ? "text-red-600" : "text-red-400"}`} />
              <h2 className={`${themeClasses.text} text-2xl font-bold mb-4`}>
                {t("common.error") || (language === "zh" ? "出错了" : "Something went wrong")}
              </h2>
              <p className={`${themeClasses.secondaryText} mb-6`}>
                {error}
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => router.push('/video-generation')}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.goBack") || (language === "zh" ? "返回" : "Go Back")}
                </Button>
                <Button onClick={fetchJob}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("common.retry") || (language === "zh" ? "重试" : "Retry")}
                </Button>
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Movie backdrop background */}
      {movieData?.id && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL}/static/${movieData.id}/image?file=backdrop)`
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Content overlay */}
      <div className={`relative z-10 ${!movieData?.id ? themeClasses.background : ''}`}>
        <AppLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/video-generation')}
                className={`${themeClasses.text} hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <div>
                <h1 className={`${themeClasses.text} text-2xl font-bold`}>
                  {t("videoGeneration.title")}
                </h1>
                <p className={`${themeClasses.secondaryText} text-lg`}>
                  {(() => {
                    // Handle movie title display with better fallback logic
                    if (typeof job.movie_title === 'object' && job.movie_title) {
                      const titleObj = job.movie_title as any
                      // Try language-specific title first, then fallback to available titles
                      if (language === 'zh' || language === 'zh-tw') {
                        return titleObj.zh || titleObj.title_zh || titleObj.title || titleObj.en || titleObj.title_en || "电影"
                      } else {
                        return titleObj.en || titleObj.title_en || titleObj.title || titleObj.zh || titleObj.title_zh || "Movie"
                      }
                    }
                    // Handle string title or use movieData as fallback
                    if (job.movie_title) {
                      return job.movie_title
                    }
                    // Fallback to movieData if available
                    if (movieData) {
                      if (language === 'zh' || language === 'zh-tw') {
                        return movieData.title_zh || movieData.title || movieData.title_en || "电影"
                      } else {
                        return movieData.title_en || movieData.title || movieData.title_zh || "Movie"
                      }
                    }
                    return language === 'zh' || language === 'zh-tw' ? "电影" : "Movie"
                  })()}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(job.status)} text-white`}>
              {getStatusText(job.status)}
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player - Main Focus */}
            <div className="lg:col-span-2">
              {job ? (
                <Card className={themeClasses.card}>
                  <CardContent className="p-0">
                    {(streamingUrl || downloadUrl) ? (
                      <div className="space-y-4">
                        {/* Video Player */}
                        <div className="relative">
                          <VideoPlayer
                            src={streamingUrl || downloadUrl || ''}
                            poster={movieData?.backdrop_url
                              ? `${process.env.NEXT_PUBLIC_API_URL}/static/${movieData.id}/image?file=backdrop`
                              : job.thumbnail_url
                                ? `${apiConfig.getBaseUrl()}${job.thumbnail_url}`
                                : undefined
                            }
                            onTimeUpdate={setCurrentVideoTime}
                            onPlayingStateChange={(playing) => {
                              setIsVideoPlaying(playing)
                              if (playing) setVideoEnded(false) // Reset when video starts playing
                            }}
                            onEnded={() => setVideoEnded(true)}
                            className="w-full rounded-lg"
                          />
                        </div>

                        {/* Current Sentence Display - Right under video player */}
                        {job.status === 'completed' && (streamingUrl || downloadUrl) && (
                          <CurrentSentenceDisplay
                            subtitleUrl={subtitleUrl || undefined}
                            currentTime={currentVideoTime}
                            isPlaying={isVideoPlaying}
                            videoEnded={videoEnded}
                            className="mt-4"
                          />
                        )}






                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2 ${theme === "light" ? "border-purple-600" : "border-violet-400"}`}></div>
                          <p className={`text-sm ${themeClasses.secondaryText}`}>
                            {t("videoGeneration.preparingVideo")}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className={themeClasses.button}
                              disabled={!downloadUrl && !subtitleUrl}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {language === "zh" ? "下载" : "Download"}
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className={`w-48 ${themeClasses.card}`}>
                            {downloadUrl && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={downloadUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center w-full ${themeClasses.text} hover:${themeClasses.secondaryText}`}
                                >
                                  <FileVideo className="w-4 h-4 mr-2" />
                                  {t("videoGeneration.downloadVideo") || "Download Video"}
                                </a>
                              </DropdownMenuItem>
                            )}
                            {subtitleUrl && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={subtitleUrl}
                                  download={`${job.movie_id}_subtitles.srt`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center w-full ${themeClasses.text} hover:${themeClasses.secondaryText}`}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  {t("videoGeneration.downloadSubtitles") || "Download Subtitles"}
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>


                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className={themeClasses.card}>
                  <CardContent className="p-12 text-center">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${theme === "light" ? "border-purple-600" : "border-violet-400"}`}></div>
                    <h3 className={`text-xl font-semibold ${themeClasses.text} mb-3`}>
                      {t("videoGeneration.generating")}
                    </h3>
                    <p className={`${themeClasses.secondaryText} mb-6`}>
                      {t("videoGeneration.pleaseWait")}
                    </p>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Sidebar - Movie Info & Job Details */}
            <div className="space-y-6">
              {/* Video Information Tags */}
              {job.status === 'completed' && (
                <Card className={themeClasses.card}>
                  <CardHeader>
                    <CardTitle className={themeClasses.text}>
                      {language === "zh" ? "视频信息" : "Video Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {/* Speed Tag */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${theme === "light" ? "bg-blue-100 text-blue-800" : "bg-blue-900/50 text-blue-200"}`}>
                        <span className="mr-1">🎵</span>
                        {language === "zh" || language === "zh-tw" ? "语速" : "Speed"}: {formatSpeedDisplay(job.speed, language === "zh-tw" ? "zh" : language)}
                      </div>

                      {/* Resolution Tag */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${theme === "light" ? "bg-green-100 text-green-800" : "bg-green-900/50 text-green-200"}`}>
                        <span className="mr-1">📺</span>
                        {language === "zh" ? "分辨率" : "Resolution"}: {job.resolution}
                      </div>

                      {/* Duration Tag */}
                      {job.video_duration && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          <span className="mr-1">⏱️</span>
                          {language === "zh" ? "时长" : "Duration"}: {Math.floor(job.video_duration / 60)}:{(job.video_duration % 60).toFixed(0).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Movie Information */}
              {movieData && (
                <Card className={themeClasses.card}>
                  <CardHeader>
                    <CardTitle className={themeClasses.text}>
                      {t("movieSelection.movieInfo") || (language === "zh" ? "电影信息" : "Movie Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(movieData.poster_url || movieData.id) && (
                      <div className="flex justify-center">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/static/${movieData.id}/image?file=poster`}
                          alt={movieData.title || movieData.title_zh || movieData.title_en || "Movie"}
                          className="w-32 h-48 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className={`text-lg font-semibold ${themeClasses.text} mb-1`}>
                        {movieData.title_zh || movieData.title}
                      </h3>
                      {movieData.title_en && movieData.title_en !== (movieData.title_zh || movieData.title) && (
                        <p className={`text-sm ${themeClasses.secondaryText} mb-2`}>
                          {movieData.title_en}
                        </p>
                      )}
                      {movieData.year && (
                        <p className={`${themeClasses.secondaryText} text-sm mb-2`}>
                          {movieData.year}
                        </p>
                      )}
                      {movieData.genre && movieData.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mb-3">
                          {movieData.genre.slice(0, 3).map((g, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={() => router.push(`/movie/${movieData.id}`)}
                        variant="outline"
                        size="sm"
                        className={themeClasses.filterButton}
                      >
                        {t("movieSelection.viewDetails") || (language === "zh" ? "查看电影详情" : "View Movie Details")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Job Summary */}
              <Card className={themeClasses.card}>
                <CardHeader>
                  <CardTitle className={themeClasses.text}>
                    {t("videoGeneration.jobInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className={themeClasses.secondaryText}>
                        {t("videoGeneration.voice")}
                      </span>
                      <p className={themeClasses.text}>
                        {job.voice_display_name || job.vcn || `Voice ID: ${job.voice_id}`}
                      </p>
                    </div>
                    <div>
                      <span className={themeClasses.secondaryText}>
                        {t("common.created")}
                      </span>
                      <p className={themeClasses.text}>
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {job.completed_at && (
                      <div>
                        <span className={themeClasses.secondaryText}>
                          {t("common.completed") || (language === "zh" ? "完成时间" : "Completed")}
                        </span>
                        <p className={themeClasses.text}>
                          {new Date(job.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {job.error_message && (
                    <div className={`p-3 rounded-lg border ${theme === "light" ? "bg-red-50 border-red-200" : "bg-red-500/20 border-red-500/30"}`}>
                      <p className={`text-sm ${theme === "light" ? "text-red-700" : "text-red-400"}`}>{job.error_message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>


            </div>
          </div>


        </div>
      </AppLayout>
      </div>
    </div>
  )
}
