"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Star, Clock, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"

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
  const [movieData, setMovieData] = useState<any>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const movieId = params.id as string
    if (movieId && mockMoviesData[movieId]) {
      setMovieData(mockMoviesData[movieId])
    }
  }, [params])

  const handleGenerateVideo = () => {
    if (movieData) {
      router.push(
        `/analysis-options?movieId=${movieData.id}&titleCn=${encodeURIComponent(movieData.titleCn)}&titleEn=${encodeURIComponent(movieData.titleEn)}`,
      )
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

  const getButtonClasses = () => {
    if (theme === "light") {
      return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
    }
    return "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
  }

  if (!movieData) {
    return (
      <AppLayout title="电影详情">
        <div className="flex items-center justify-center h-96">
          <p className={`${getTextClasses()} text-xl`}>加载中...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout >
      <div className="container mx-auto px-6 py-8">
        {/* Movie Info Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Movie Poster */}
          <div className="md:col-span-1">
            <Card className={`${getCardClasses()} overflow-hidden`}>
              <CardContent className="p-0">
                <Image
                  src={movieData.poster || "/placeholder.svg"}
                  alt={movieData.titleCn}
                  width={300}
                  height={450}
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>
          </div>

          {/* Movie Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className={`text-4xl font-bold ${getTextClasses()} mb-2`}>{movieData.titleCn}</h1>
              <h2 className={`text-2xl ${theme === "light" ? "text-purple-600" : "text-cyan-300"} mb-4`}>
                {movieData.titleEn}
              </h2>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-orange-500 text-white flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  {movieData.rating}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${theme === "light" ? "text-gray-700 border-gray-300" : "text-white border-white/30"}`}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  {movieData.releaseDate}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${theme === "light" ? "text-gray-700 border-gray-300" : "text-white border-white/30"}`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {movieData.duration}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className={`${getTextClasses()} font-semibold mb-2`}>导演</h3>
                  <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>{movieData.director}</p>
                </div>
                <div>
                  <h3 className={`${getTextClasses()} font-semibold mb-2`}>类型</h3>
                  <div className="flex flex-wrap gap-2">
                    {movieData.genre.map((g, index) => (
                      <Badge key={index} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className={`${getTextClasses()} font-semibold mb-2`}>主演</h3>
                  <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                    {movieData.cast.join(" / ")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className={`${getTextClasses()} font-semibold mb-2`}>剧情简介</h3>
                <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} leading-relaxed`}>
                  {movieData.description}
                </p>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateVideo}
              size="lg"
              className={`w-full ${getButtonClasses()} text-white font-semibold py-4`}
            >
              <Play className="w-5 h-5 mr-2" />
              生成分析视频
            </Button>
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
              {movieData.sampleVideos.map((video) => (
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
    </AppLayout>
  )
}
