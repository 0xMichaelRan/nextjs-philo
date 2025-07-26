"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Play, Star, Clock, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

const mockMovieData = {
  director: "弗兰克·德拉邦特",
  genre: ["剧情", "犯罪"],
  duration: "142分钟",
  releaseDate: "1994-09-23",
  rating: 9.7,
  description:
    "一个银行家因为妻子和她的情人被杀而被判终身监禁。他在肖申克监狱中逐渐获得狱友的信任，并且逐渐在监狱中找到了自己的价值。同时，他也策划着为自己的清白而复仇。",
  cast: ["蒂姆·罗宾斯", "摩根·弗里曼", "鲍勃·冈顿"],
  sampleVideos: [
    {
      id: 1,
      title: "希望与救赎的哲学思考",
      author: "电影爱好者A",
      duration: "8分32秒",
      views: 1234,
      thumbnail: "/placeholder.svg?height=120&width=200",
      style: "哲学思辨",
    },
    {
      id: 2,
      title: "监狱制度的社会批判",
      author: "影评人B",
      duration: "12分15秒",
      views: 856,
      thumbnail: "/placeholder.svg?height=120&width=200",
      style: "学术严谨",
    },
    {
      id: 3,
      title: "友谊与人性的温暖解读",
      author: "文艺青年C",
      duration: "6分48秒",
      views: 2341,
      thumbnail: "/placeholder.svg?height=120&width=200",
      style: "情感共鸣",
    },
  ],
}

export default function MovieHomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieId, setMovieId] = useState("")
  const [titleCn, setTitleCn] = useState("")
  const [titleEn, setTitleEn] = useState("")

  useEffect(() => {
    const id = searchParams.get("movieId")
    const cn = searchParams.get("titleCn")
    const en = searchParams.get("titleEn")

    if (id) setMovieId(id)
    if (cn) setTitleCn(decodeURIComponent(cn))
    if (en) setTitleEn(decodeURIComponent(en))
  }, [searchParams])

  const handleGenerateVideo = () => {
    const params = new URLSearchParams()
    params.set("movieId", movieId)
    params.set("titleCn", titleCn)
    params.set("titleEn", titleEn)
    router.push(`/analysis-options?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/movie-selection">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-white">电影详情</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Movie Info Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Movie Poster */}
          <div className="md:col-span-1">
            <Card className="bg-white/10 border-white/20 overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={`/placeholder.svg?height=450&width=300&query=${encodeURIComponent(titleEn)}+movie+poster`}
                  alt={titleCn}
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
              <h1 className="text-4xl font-bold text-white mb-2">{titleCn}</h1>
              <h2 className="text-2xl text-cyan-300 mb-4">{titleEn}</h2>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-orange-500 text-white flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  {mockMovieData.rating}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  {mockMovieData.releaseDate}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {mockMovieData.duration}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">导演</h3>
                  <p className="text-gray-300">{mockMovieData.director}</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">类型</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockMovieData.genre.map((g, index) => (
                      <Badge key={index} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-white font-semibold mb-2">主演</h3>
                  <p className="text-gray-300">{mockMovieData.cast.join(" / ")}</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">剧情简介</h3>
                <p className="text-gray-300 leading-relaxed">{mockMovieData.description}</p>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateVideo}
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              生成分析视频
            </Button>
          </div>
        </div>

        {/* Sample Videos Section */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center">
              <Users className="w-6 h-6 mr-2" />
              其他用户的精彩分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMovieData.sampleVideos.map((video) => (
                <Card
                  key={video.id}
                  className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-0">
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
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
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
    </div>
  )
}
