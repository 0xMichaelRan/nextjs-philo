"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Star, Clock, Calendar, Users, Globe, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { VideoPlayer, VideoPlayerRef } from "@/components/video-player"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { apiConfig } from "@/lib/api-config"
import { useFlow } from "@/hooks/use-flow"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { getQiniuPosterUrl, getQiniuBackdropUrl, getQiniuImageUrl } from "@/lib/qiniu-config"
import { getStandardThemeClasses } from "@/lib/theme-utils"

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
  tmdb_id?: number
  original_title?: string
  original_language?: string
  vote_count?: number
  popularity?: number
  tagline?: string
}



export default function MovieHomePage() {
  const params = useParams()
  const router = useRouter()
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videoUrls, setVideoUrls] = useState<{ [key: string]: { streaming_url?: string, download_url?: string } }>({})
  const [isMediumOrWideScreen, setIsMediumOrWideScreen] = useState(false)
  const videoRefs = useRef<{ [key: string]: VideoPlayerRef | null }>({})

  // Function to stop all other videos when one starts playing
  const handleVideoPlay = (currentVideoId: string) => {
    Object.keys(videoRefs.current).forEach(videoId => {
      if (videoId !== currentVideoId && videoRefs.current[videoId]) {
        videoRefs.current[videoId]?.pause()
      }
    })
  }

  // Utility function for relative time formatting
  const formatRelativeTime = (dateString: string): string => {
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
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { flowState, updateFlowState, clearFlowState } = useFlow()

  const movieId = params.id as string

  // Movie detail page doesn't require authentication
  useAuthGuard({ requireAuth: false })

  useEffect(() => {
    const movieId = params.id as string
    if (movieId) {
      fetchMovieData(movieId)
      fetchFeaturedVideos(movieId)
    }
  }, [params.id])

  // Check window size for responsive image display
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMediumOrWideScreen(window.innerWidth > 768) // mobile breakpoint
    }

    checkWindowSize()
    window.addEventListener('resize', checkWindowSize)

    return () => window.removeEventListener('resize', checkWindowSize)
  }, [])

  const fetchMovieData = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.movies.details(id) + `?language=${language}`
      )

      if (response.ok) {
        const data: MovieData = await response.json()
        setMovieData(data)
      } else {
        setError(language === "zh" ? "无法加载电影信息" : "Unable to load movie information")
      }
    } catch (err) {
      console.error("Error fetching movie data:", err)
      setError(language === "zh" ? "网络错误，请稍后重试" : "Network error, please try again later")
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedVideos = async (movieId: string) => {
    setVideosLoading(true)
    try {
      // Use the new public API that doesn't require authentication
      const response = await fetch(
        `${apiConfig.getBaseUrl()}/movies/${movieId}/public-videos`
      )

      if (response.ok) {
        const data = await response.json()
        const videos = data.videos || []

        // Transform the public API response to match the expected format
        const transformedVideos = videos.map((video: any) => ({
          id: video.job_id,
          status: 'completed',
          created_at: video.created_at,
          resolution: video.resolution,
          voice_code: video.voice_code,
          thumbnail_url: video.thumbnail_url,
        }))

        setFeaturedVideos(transformedVideos)

        // Create URL map from the public API response
        const urlMap = videos.reduce((acc: any, video: any) => {
          acc[video.job_id] = {
            download_url: video.download_url,
            streaming_url: video.streaming_url,
            subtitle_url: video.subtitle_url,
            video_url: video.download_url, // Fallback for compatibility
          }
          return acc
        }, {})

        setVideoUrls(urlMap)

        console.log(`Loaded ${videos.length} public videos for movie ${movieId}`)
      } else {
        console.warn(`Public videos API returned ${response.status}`)
        // Fallback to empty state
        setFeaturedVideos([])
        setVideoUrls({})
      }
    } catch (error) {
      console.error("Error fetching public videos:", error)
      // Fallback to empty state
      setFeaturedVideos([])
      setVideoUrls({})
    } finally {
      setVideosLoading(false)
    }
  }

  const handleGenerateVideo = () => {
    if (movieData) {
      // Only clear flow state if this is a different movie or no movie was selected
      const currentMovieId = flowState?.movieId
      if (!currentMovieId || currentMovieId !== movieData.id) {
        clearFlowState()
      }

      // Save new movie data to flow state
      updateFlowState({
        movieId: movieData.id,
        movieTitle: movieData.title_zh || movieData.title,
        movieTitleEn: movieData.title_en,
        movieTagline: movieData.tagline
      })

      // Navigate to analysis config with movie ID
      router.push(`/analysis-config?movieId=${movieId}`)
    }
  }

  const themeClasses = getStandardThemeClasses(theme)



  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className={`${themeClasses.text} text-xl`}>
            {language === "zh" ? "加载中..." : "Loading..."}
          </p>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className={`${themeClasses.text} text-xl`}>{error}</p>
        </div>
      </AppLayout>
    )
  }

  if (!movieData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className={`${themeClasses.text} text-xl`}>
            {language === "zh" ? "电影不存在" : "Movie not found"}
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <React.Fragment>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
                {/* Hero Section with Movie Info */}
                <div className="grid lg:grid-cols-4 gap-8 mb-12">
                  {/* Movie Poster */}
                  <div className="lg:col-span-1">
                    <div>
                      <Card className={`${themeClasses.card} overflow-hidden shadow-xl`}>
                        <CardContent className="p-0 relative">
                          <Image
                            src={getQiniuImageUrl(movieData.id, isMediumOrWideScreen ? 'poster' : 'backdrop')}
                            alt={language === "zh" ? (movieData.title_zh || movieData.title) : movieData.title_en}
                            width={isMediumOrWideScreen ? 400 : 800}
                            height={isMediumOrWideScreen ? 600 : 450}
                            className={`w-full h-auto object-cover ${isMediumOrWideScreen ? 'aspect-[2/3]' : 'aspect-video'}`}
                          />
                          {movieData.rating && (
                            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-full flex items-center shadow-lg">
                              <Star className="w-4 h-4 mr-1" />
                              <span className="font-bold">{movieData.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Movie Details */}
                  <div className="lg:col-span-3 space-y-8">
                    {/* Title Section */}
                    <div>
                      <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${themeClasses.text} mb-3`}>
                        {language === "zh" ? (movieData.title_zh || movieData.title) : movieData.title_en}
                      </h1>
                      <h2 className={`text-xl md:text-2xl ${theme === "light" ? "text-purple-600" : "text-cyan-300"} mb-4`}>
                        {language === "zh" ? movieData.title_en : (movieData.title_zh || movieData.original_title)}
                      </h2>

                      {movieData.tagline && (
                        <p className={`text-lg ${theme === "light" ? "text-gray-600" : "text-gray-300"} italic mb-6`}>
                          "{movieData.tagline}"
                        </p>
                      )}

                      {/* Enhanced Badges */}
                      <div className="flex flex-wrap gap-3 mb-8">
                        {movieData.year && (
                          <Badge variant="outline" className={`${theme === "light" ? "text-gray-700 border-gray-300" : "text-white border-white/30"} text-sm px-3 py-1`}>
                            <Calendar className="w-4 h-4 mr-1" />
                            {movieData.year}
                          </Badge>
                        )}
                        {movieData.duration_minutes && (
                          <Badge variant="outline" className={`${theme === "light" ? "text-gray-700 border-gray-300" : "text-white border-white/30"} text-sm px-3 py-1`}>
                            <Clock className="w-4 h-4 mr-1" />
                            {movieData.duration_minutes}分钟
                          </Badge>
                        )}
                        {movieData.original_language && (
                          <Badge variant="outline" className={`${theme === "light" ? "text-gray-700 border-gray-300" : "text-white border-white/30"} text-sm px-3 py-1`}>
                            <Globe className="w-4 h-4 mr-1" />
                            {movieData.original_language.toUpperCase()}
                          </Badge>
                        )}
                        {movieData.vote_count && (
                          <Badge variant="outline" className={`${theme === "light" ? "text-gray-700 border-gray-300" : "text-white border-white/30"} text-sm px-3 py-1`}>
                            <Users className="w-4 h-4 mr-1" />
                            {movieData.vote_count.toLocaleString()} 评分
                          </Badge>
                        )}
                      </div>

                      {/* Enhanced Movie Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {movieData.genre.length > 0 && (
                          <div className="space-y-3">
                            <h3 className={`${themeClasses.text} font-semibold text-lg`}>
                              {language === "zh" ? "类型" : "Genres"}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {movieData.genre.map((g, index) => (
                                <Badge key={index} className="bg-purple-600 hover:bg-purple-700 text-white">
                                  {g}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {movieData.popularity && (
                          <div className="space-y-3">
                            <h3 className={`${themeClasses.text} font-semibold text-lg`}>
                              {language === "zh" ? "热度指数" : "Popularity"}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(movieData.popularity / 100 * 100, 100)}%` }}
                                />
                              </div>
                              <span className={`${themeClasses.text} font-medium`}>
                                {movieData.popularity.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}

                        {movieData.tmdb_id && (
                          <div className="space-y-3">
                            <h3 className={`${themeClasses.text} font-semibold text-lg`}>
                              {language === "zh" ? "数据库ID" : "Database ID"}
                            </h3>
                            <div className="space-y-1">
                              <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} text-sm`}>
                                TMDB: {movieData.tmdb_id}
                              </p>
                              <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} text-sm`}>
                                IMDb: {movieData.id}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {movieData.description && (
                        <div className="space-y-4">
                          <h3 className={`${themeClasses.text} font-semibold text-xl`}>
                            {language === "zh" ? "剧情简介" : "Plot Summary"}
                          </h3>
                          <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} leading-relaxed text-lg`}>
                            {movieData.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons - Hidden on mobile (shown in fixed bottom bar) */}
                    <div className="pt-6 hidden md:block">
                      <BottomNavigation
                        onBack={() => router.push('/movie-selection')}
                        onNext={handleGenerateVideo}
                        nextLabel={language === "zh" ? "开始分析" : "Start Analysis"}
                      />
                    </div>
                  </div>
                </div>

                {/* Sample Videos Section */}
                <Card className={themeClasses.card}>
                  <CardHeader>
                    <CardTitle className={`${themeClasses.text} text-2xl flex items-center`}>
                      <Users className="w-6 h-6 mr-2" />
                      {language === "zh" ? "其他用户的精彩分析" : "Featured User Analysis"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {videosLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className={themeClasses.text}>
                          {language === "zh" ? "加载中..." : "Loading..."}
                        </p>
                      </div>
                    ) : featuredVideos.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredVideos.map((video) => {
                          const videoUrl = videoUrls[video.id]
                          const streamingUrl = videoUrl?.streaming_url || videoUrl?.download_url

                          return (
                            <Card
                              key={video.id}
                              className={`${theme === "light" ? "bg-white/60 border-gray-200/30 hover:bg-white/80" : "bg-white/5 border-white/10 hover:bg-white/10"} transition-all duration-300 overflow-hidden`}
                            >
                              <CardContent className="p-0">
                                <div className="relative">
                                  {/* In-place Video Player */}
                                  {streamingUrl ? (
                                    <VideoPlayer
                                      ref={(ref) => { videoRefs.current[video.id] = ref }}
                                      src={streamingUrl}
                                      poster={video.movie_id ? getQiniuBackdropUrl(video.movie_id) : undefined}
                                      className="w-full aspect-video"
                                      onPlay={() => handleVideoPlay(video.id.toString())}
                                    />
                                  ) : (
                                    <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                      <Play className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  {/* Timestamp and Character on same line */}
                                  <div className="flex items-center justify-between">
                                    <div className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                      {formatRelativeTime(video.completed_at || video.updated_at || video.created_at)}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {video.character || (language === "zh" ? "哲学家" : "Philosopher")}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className={themeClasses.text}>
                          {language === "zh" ? "暂无用户分析视频" : "No user analysis videos yet"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
        </div>

        <MobileBottomBar>
          <div className="flex gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="flex-1 py-4"
            >
              {language === "zh" ? "上一步" : "Previous"}
            </Button>
            <Button
              onClick={handleGenerateVideo}
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4"
            >
              {language === "zh" ? "开始分析" : "Start Analysis"}
            </Button>
          </div>
        </MobileBottomBar>
      </React.Fragment>
    </AppLayout>
  )
}
