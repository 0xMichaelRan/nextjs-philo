"use client"

import { useState, useEffect, useRef } from "react"
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

const mockMoviesData = {
  "1": {
    id: 1,
    titleCn: "肖申克的救赎",
    titleEn: "The Shawshank Redemption",
    director: "弗兰克·德拉邦特",
    genre: ["剧情", "犯罪"],
    duration: "142分钟",
    releaseDate: "1994-09-23",
    rating: 9.7,
    description:
      "一个银行家因为妻子和她的情人被杀而被判终身监禁。他在肖申克监狱中逐渐获得狱友的信任，并且逐渐在监狱中找到了自己的价值。同时，他也策划着为自己的清白而复仇。",
    cast: ["蒂姆·罗宾斯", "摩根·弗里曼", "鲍勃·冈顿"],
    poster: "/placeholder.svg?height=450&width=300",
    sampleVideos: [
      {
        id: 1,
        title: "希望与救赎的哲学思考",
        author: "电影爱好者A",
        duration: "8分32秒",
        views: 1234,
        thumbnail: "/placeholder.svg?height=120&width=200",
        style: "哲学思辨",
        videoUrl: "https://example.com/video1.mp4",
      },
      {
        id: 2,
        title: "监狱制度的社会批判",
        author: "影评人B",
        duration: "12分15秒",
        views: 856,
        thumbnail: "/placeholder.svg?height=120&width=200",
        style: "学术严谨",
        videoUrl: "https://example.com/video2.mp4",
      },
      {
        id: 3,
        title: "友谊与人性的温暖解读",
        author: "文艺青年C",
        duration: "6分48秒",
        views: 2341,
        thumbnail: "/placeholder.svg?height=120&width=200",
        style: "情感共鸣",
        videoUrl: "https://example.com/video3.mp4",
      },
    ],
  },
  "2": {
    id: 2,
    titleCn: "霸王别姬",
    titleEn: "Farewell My Concubine",
    director: "陈凯歌",
    genre: ["剧情", "爱情", "历史"],
    duration: "171分钟",
    releaseDate: "1993-01-01",
    rating: 9.6,
    description:
      "段小楼与程蝶衣是一对打小一起长大的师兄弟，两人一个演生，一个演旦，一向配合天衣无缝，尤其一出《霸王别姬》，更是誉满京城。但两人对戏剧与人生关系的理解有本质不同，段小楼深知戏非人生，程蝶衣则是人戏不分。",
    cast: ["张国荣", "巩俐", "张丰毅"],
    poster: "/placeholder.svg?height=450&width=300",
    sampleVideos: [
      {
        id: 1,
        title: "中国传统戏曲的艺术魅力",
        author: "戏曲爱好者",
        duration: "10分12秒",
        views: 2134,
        thumbnail: "/placeholder.svg?height=120&width=200",
        style: "学术严谨",
        videoUrl: "https://example.com/video4.mp4",
      },
      {
        id: 2,
        title: "历史变迁中的人物命运",
        author: "历史研究者",
        duration: "15分45秒",
        views: 1856,
        thumbnail: "/placeholder.svg?height=120&width=200",
        style: "哲学思辨",
        videoUrl: "https://example.com/video5.mp4",
      },
    ],
  },
}

export default function MovieHomePage() {
  const params = useParams()
  const router = useRouter()
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videoUrls, setVideoUrls] = useState<{[key: string]: {streaming_url?: string, download_url?: string}}>({})
  const [isMediumOrWideScreen, setIsMediumOrWideScreen] = useState(false)
  const videoRefs = useRef<{[key: string]: VideoPlayerRef | null}>({})

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
  const { language, setLanguage, t } = useLanguage()
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
  }, [params])

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
        // Fallback to mock data if API fails
        if (mockMoviesData[id as keyof typeof mockMoviesData]) {
          const mockData = mockMoviesData[id as keyof typeof mockMoviesData]
          setMovieData({
            id: mockData.id.toString(),
            title: mockData.titleCn,
            title_en: mockData.titleEn,
            title_zh: mockData.titleCn,
            year: parseInt(mockData.releaseDate.split('-')[0]),
            genre: mockData.genre,
            director: mockData.director,
            duration_minutes: parseInt(mockData.duration.replace('分钟', '')),
            rating: mockData.rating,
            description: mockData.description,
            poster_url: mockData.poster
          })
        } else {
          setError(language === "zh" ? "无法加载电影信息" : "Unable to load movie information")
        }
      }
    } catch (err) {
      console.error("Error fetching movie data:", err)
      // Fallback to mock data
      if (mockMoviesData[id as keyof typeof mockMoviesData]) {
        const mockData = mockMoviesData[id as keyof typeof mockMoviesData]
        setMovieData({
          id: mockData.id.toString(),
          title: mockData.titleCn,
          title_en: mockData.titleEn,
          title_zh: mockData.titleCn,
          year: parseInt(mockData.releaseDate.split('-')[0]),
          genre: mockData.genre,
          director: mockData.director,
          duration_minutes: parseInt(mockData.duration.replace('分钟', '')),
          rating: mockData.rating,
          description: mockData.description,
          poster_url: mockData.poster
        })
      } else {
        setError(language === "zh" ? "网络错误，请稍后重试" : "Network error, please try again later")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedVideos = async (movieId: string) => {
    setVideosLoading(true)
    try {
      const response = await fetch(
        apiConfig.videoJobs.completed(movieId, 3)
      )

      if (response.ok) {
        const data = await response.json()
        const videos = data.jobs || []
        setFeaturedVideos(videos)

        // Fetch video URLs for each completed video
        const urlPromises = videos.map(async (video: any) => {
          if (video.status === 'completed') {
            try {
              const urlResponse = await apiConfig.makeAuthenticatedRequest(
                apiConfig.videoJobs.videoUrl(video.id)
              )
              if (urlResponse.ok) {
                const urlData = await urlResponse.json()
                return { [video.id]: urlData }
              }
            } catch (error) {
              console.error(`Error fetching video URL for job ${video.id}:`, error)
            }
          }
          return { [video.id]: {} }
        })

        const urlResults = await Promise.all(urlPromises)
        const urlMap = urlResults.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        setVideoUrls(urlMap)
      }
    } catch (error) {
      console.error("Error fetching featured videos:", error)
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

  const getTextClasses = () => {
    if (theme === "light") {
      return "text-gray-800"
    }
    return "text-white"
  }

  const getCardClasses = () => {
    if (theme === "light") {
      return "bg-white/80 border-gray-200/50"
    }
    return "bg-white/10 border-white/20"
  }



  if (loading) {
    return (
      <AppLayout title={language === "zh" ? "电影详情" : "Movie Details"}>
        <div className="flex items-center justify-center h-96">
          <p className={`${getTextClasses()} text-xl`}>
            {language === "zh" ? "加载中..." : "Loading..."}
          </p>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title={language === "zh" ? "电影详情" : "Movie Details"}>
        <div className="flex items-center justify-center h-96">
          <p className={`${getTextClasses()} text-xl`}>{error}</p>
        </div>
      </AppLayout>
    )
  }

  if (!movieData) {
    return (
      <AppLayout title={language === "zh" ? "电影详情" : "Movie Details"}>
        <div className="flex items-center justify-center h-96">
          <p className={`${getTextClasses()} text-xl`}>
            {language === "zh" ? "电影不存在" : "Movie not found"}
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header with Language Toggle */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/movie-selection')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "zh" ? "返回" : "Back"}
            </Button>

            <div className="flex items-center space-x-1">
              <Button
                variant={language === "zh" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("zh")}
              >
                中
              </Button>
              <Button
                variant={language === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("en")}
              >
                EN
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Movie Info */}
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Card className={`${getCardClasses()} overflow-hidden shadow-xl`}>
                <CardContent className="p-0 relative">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/static/${movieData.id}/image?file=${isMediumOrWideScreen ? 'backdrop' : 'poster'}` || "/placeholder.svg"}
                    alt={language === "zh" ? (movieData.title_zh || movieData.title) : movieData.title_en}
                    width={isMediumOrWideScreen ? 800 : 400}
                    height={isMediumOrWideScreen ? 450 : 600}
                    className={`w-full h-auto object-cover ${isMediumOrWideScreen ? 'aspect-video' : 'aspect-[2/3]'}`}
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
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${getTextClasses()} mb-3`}>
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
                    <h3 className={`${getTextClasses()} font-semibold text-lg`}>
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
                    <h3 className={`${getTextClasses()} font-semibold text-lg`}>
                      {language === "zh" ? "热度指数" : "Popularity"}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{width: `${Math.min(movieData.popularity / 100 * 100, 100)}%`}}
                        />
                      </div>
                      <span className={`${getTextClasses()} font-medium`}>
                        {movieData.popularity.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}

                {movieData.tmdb_id && (
                  <div className="space-y-3">
                    <h3 className={`${getTextClasses()} font-semibold text-lg`}>
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
                  <h3 className={`${getTextClasses()} font-semibold text-xl`}>
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
        <Card className={getCardClasses()}>
          <CardHeader>
            <CardTitle className={`${getTextClasses()} text-2xl flex items-center`}>
              <Users className="w-6 h-6 mr-2" />
              {language === "zh" ? "其他用户的精彩分析" : "Featured User Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className={getTextClasses()}>
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
                              poster={video.movie_id ? `${process.env.NEXT_PUBLIC_API_URL}/static/${video.movie_id}/image?file=backdrop` : undefined}
                              className="w-full h-32"
                              onPlay={() => handleVideoPlay(video.id.toString())}
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
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
                <p className={getTextClasses()}>
                  {language === "zh" ? "暂无用户分析视频" : "No user analysis videos yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar>
        <div className="flex space-x-3 w-full">
          <Button
            onClick={() => router.push('/movie-selection')}
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
    </AppLayout>
  )
}
