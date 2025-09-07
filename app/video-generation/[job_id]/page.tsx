"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Download, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { AppLayout } from "@/components/app-layout"
import { VideoPlayer } from "@/components/video-player"
import { SubtitleDisplay } from "@/components/subtitle-display"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"

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
  error_message?: string
  resolution: string
  speed: number // TTS speed (0-100)
  created_at: string
  updated_at: string
  completed_at?: string
}

interface MovieData {
  id: string
  title: string
  title_en: string
  title_zh?: string
  year?: number
  genre: string[]
  director?: string
  duration_minutes?: number
  rating?: number
  description?: string
  poster_url?: string
  backdrop_url?: string
}

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
  }, [jobId]) // Remove user dependency to prevent duplicate calls

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
        accent: "from-purple-600 to-pink-600",
        button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
        filterButton: "bg-white/60 border-gray-300 text-gray-700 hover:bg-white/80"
      }
    }
    return {
      background: "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900",
      card: "bg-white/10 backdrop-blur-sm border-white/20",
      text: "text-white",
      secondaryText: "text-gray-300",
      accent: "from-orange-500 to-red-600",
      button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      filterButton: "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20"
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
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className={`${themeClasses.text} text-2xl font-bold mb-4`}>
                {t("common.error") || (language === "zh" ? "出错了" : "Something went wrong")}
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
                onClick={() => {
                  // Try router.back() first, fallback to specific pages
                  try {
                    if (window.history.length > 1) {
                      router.back()
                    } else {
                      // Fallback navigation based on job status
                      if (job && (job.status === 'pending' || job.status === 'processing' || job.status === 'queued')) {
                        router.push('/job-pending')
                      } else {
                        router.push('/video-generation')
                      }
                    }
                  } catch (error) {
                    // Fallback if router.back() fails
                    console.warn('Router.back() failed, using fallback navigation:', error)
                    if (job && (job.status === 'pending' || job.status === 'processing' || job.status === 'queued')) {
                      router.push('/job-pending')
                    } else {
                      router.push('/video-generation')
                    }
                  }
                }}
                className={`${themeClasses.text} hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <div>
                <h1 className={`${themeClasses.text} text-2xl font-bold`}>
                  {t("videoGeneration.title")}
                </h1>
                <p className={themeClasses.secondaryText}>
                  {(() => {
                    if (typeof job.movie_title === 'object' && job.movie_title) {
                      const titleObj = job.movie_title as any
                      return titleObj[language] || titleObj.en || titleObj.zh || "Movie"
                    }
                    return job.movie_title || "Movie"
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
              {job.status === 'completed' ? (
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
                            onPlayingStateChange={setIsVideoPlaying}
                            className="w-full rounded-lg"
                          />
                        </div>






                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className={`text-sm ${themeClasses.secondaryText}`}>
                            {t("videoGeneration.preparingVideo")}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <Button
                          asChild
                          className={`flex-1 ${themeClasses.button} text-white`}
                          disabled={!downloadUrl}
                        >
                          <a
                            href={downloadUrl || '#'}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!downloadUrl) {
                                e.preventDefault()
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t("videoGeneration.download")}
                          </a>
                        </Button>
                        <Button
                          onClick={() => {
                            try {
                              if (window.history.length > 1) {
                                router.back()
                              } else {
                                router.push('/video-generation')
                              }
                            } catch (error) {
                              console.warn('Router.back() failed, using fallback navigation:', error)
                              router.push('/video-generation')
                            }
                          }}
                          variant="outline"
                          className={`flex-1 ${themeClasses.filterButton}`}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          {t("common.backToList")}
                        </Button>
                      </div>


                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className={themeClasses.card}>
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h3 className={`text-xl font-semibold ${themeClasses.text} mb-3`}>
                      {t("videoGeneration.generating")}
                    </h3>
                    <p className={`${themeClasses.secondaryText} mb-6`}>
                      {t("videoGeneration.pleaseWait")}
                    </p>
                    <div className="mt-4">
                      <p className={`text-sm ${themeClasses.secondaryText}`}>
                        {t("videoGeneration.status")}: {job.status}
                      </p>
                      <p className={`text-xs ${themeClasses.secondaryText} mt-1`}>
                        {t("common.lastUpdated")}: {new Date(job.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subtitle Display - Only show for completed videos */}
              {job.status === 'completed' && (streamingUrl || downloadUrl) && (
                <SubtitleDisplay
                  subtitleUrl={subtitleUrl || undefined}
                  currentTime={currentVideoTime}
                  isPlaying={isVideoPlaying}
                  movieId={job.movie_id}
                  className="mt-6"
                />
              )}
            </div>

            {/* Sidebar - Movie Info & Job Details */}
            <div className="space-y-6">
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
                        {t("videoGeneration.resolution")}
                      </span>
                      <p className={themeClasses.text}>{job.resolution}</p>
                    </div>
                    <div>
                      <span className={themeClasses.secondaryText}>
                        {t("videoGeneration.voice")}
                      </span>
                      <p className={themeClasses.text}>
                        {job.voice_display_name || job.voice_code}
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
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{job.error_message}</p>
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
