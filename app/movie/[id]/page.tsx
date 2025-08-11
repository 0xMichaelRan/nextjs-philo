"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Star, Clock, Calendar, Users, Globe, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { apiConfig } from "@/lib/api-config"
import { useFlow } from "@/hooks/use-flow"

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
  const [currentLanguage, setCurrentLanguage] = useState<"zh" | "en">("zh")
  const { theme } = useTheme()
  const { flowState, updateFlowState, clearFlowState } = useFlow()

  useEffect(() => {
    const movieId = params.id as string
    if (movieId) {
      fetchMovieData(movieId)
    }
  }, [params])

  const fetchMovieData = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.movies.details(id) + "?language=zh"
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
          setError("无法加载电影信息")
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
        setError("网络错误，请稍后重试")
      }
    } finally {
      setLoading(false)
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
      <AppLayout title="电影详情">
        <div className="flex items-center justify-center h-96">
          <p className={`${getTextClasses()} text-xl`}>加载中...</p>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="电影详情">
        <div className="flex items-center justify-center h-96">
          <p className={`${getTextClasses()} text-xl`}>{error}</p>
        </div>
      </AppLayout>
    )
  }

  if (!movieData) {
    return (
      <AppLayout title="电影详情">
        <div className="flex items-center justify-center h-96">
          <p className={`${getTextClasses()} text-xl`}>电影不存在</p>
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
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>

            <div className="flex items-center space-x-1">
              <Button
                variant={currentLanguage === "zh" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentLanguage("zh")}
              >
                中
              </Button>
              <Button
                variant={currentLanguage === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentLanguage("en")}
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
                    src={`${process.env.NEXT_PUBLIC_API_URL}/static/${movieData.id}/image?file=backdrop` || "/placeholder.svg"}
                    alt={currentLanguage === "zh" ? (movieData.title_zh || movieData.title) : movieData.title_en}
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover"
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
                {currentLanguage === "zh" ? (movieData.title_zh || movieData.title) : movieData.title_en}
              </h1>
              <h2 className={`text-xl md:text-2xl ${theme === "light" ? "text-purple-600" : "text-cyan-300"} mb-4`}>
                {currentLanguage === "zh" ? movieData.title_en : (movieData.title_zh || movieData.original_title)}
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
                    <h3 className={`${getTextClasses()} font-semibold text-lg`}>类型</h3>
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
                    <h3 className={`${getTextClasses()} font-semibold text-lg`}>热度指数</h3>
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
                    <h3 className={`${getTextClasses()} font-semibold text-lg`}>数据库ID</h3>
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
                  <h3 className={`${getTextClasses()} font-semibold text-xl`}>剧情简介</h3>
                  <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} leading-relaxed text-lg`}>
                    {movieData.description}
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Action Button - Hidden on mobile (shown in fixed bottom bar) */}
            <div className="pt-6 hidden md:block">
              <Button
                onClick={handleGenerateVideo}
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-3" />
                开始生成视频分析
              </Button>
            </div>
          </div>
        </div>

        {/* Sample Videos Section */}
        <Card className={getCardClasses()}>
          <CardHeader>
            <CardTitle className={`${getTextClasses()} text-2xl flex items-center`}>
              <Users className="w-6 h-6 mr-2" />
              其他用户的精彩分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMoviesData["1"].sampleVideos.map((video) => (
                <Card
                  key={video.id}
                  className={`${theme === "light" ? "bg-white/60 border-gray-200/30 hover:bg-white/80" : "bg-white/5 border-white/10 hover:bg-white/10"} transition-all duration-300 cursor-pointer group`}
                >
                  <CardContent className="p-0">
                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                      <div className="relative">
                        <Image
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          width={200}
                          height={120}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                          {video.duration}
                        </Badge>
                      </div>
                    </a>
                    <div className="p-4">
                      <h3 className={`${getTextClasses()} font-semibold text-sm mb-2 line-clamp-2`}>{video.title}</h3>
                      <div
                        className={`flex items-center justify-between text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"} mb-2`}
                      >
                        <span>{video.author}</span>
                        <span>{video.views} 观看</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {video.style}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Action Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 p-4 safe-area-pb">
        <Button
          onClick={handleGenerateVideo}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Play className="w-6 h-6 mr-3" />
          开始生成视频分析
        </Button>
      </div>

      {/* Add bottom padding to prevent content from being hidden behind fixed button */}
      <div className="h-20 md:hidden"></div>
    </AppLayout>
  )
}
