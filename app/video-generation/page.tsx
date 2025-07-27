"use client"

import { useState } from "react"
import { Play, Download, CheckCircle, AlertCircle, Plus, Crown, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { VideoPlayer } from "@/components/video-player"
import { useTheme } from "@/contexts/theme-context"

const mockJobs = [
  {
    id: 1,
    movieTitle: "肖申克的救赎",
    status: "completed",
    progress: 100,
    createdAt: "2024-01-20 14:30",
    completedAt: "2024-01-20 15:45",
    duration: "5分25秒",
    quality: "HD",
    downloadUrl: "#",
    videoUrl: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 2,
    movieTitle: "霸王别姬",
    status: "completed",
    progress: 100,
    createdAt: "2024-01-21 10:15",
    completedAt: "2024-01-21 11:30",
    duration: "8分12秒",
    quality: "HD",
    downloadUrl: "#",
    videoUrl: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 3,
    movieTitle: "阿甘正传",
    status: "queued",
    progress: 0,
    createdAt: "2024-01-21 11:30",
    duration: "12分30秒",
    quality: "HD",
    queuePosition: 3,
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

const userStats = {
  isVip: false,
  dailyLimit: 1,
  dailyUsed: 1,
  totalGenerated: 15,
  vipExpiry: null,
}

export default function VideoGenerationPage() {
  const [jobs, setJobs] = useState(mockJobs)
  const [userInfo, setUserInfo] = useState(userStats)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const { theme } = useTheme()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "queued":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusText = (job: any) => {
    switch (job.status) {
      case "completed":
        return "已完成"
      case "queued":
        return `排队中 (第${job.queuePosition}位)`
      default:
        return "未知状态"
    }
  }

  const canCreateNew = userInfo.isVip || userInfo.dailyUsed < userInfo.dailyLimit

  const handleVideoPlay = (job: any) => {
    setSelectedVideo(job)
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "text-gray-800",
        card: "bg-white/80 border-gray-200/50",
        button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      }
    }
    return {
      background: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
      text: "text-white",
      card: "bg-white/10 border-white/20",
      button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={themeClasses.background}>
      <AppLayout title="视频生成中心">
        <div className="container mx-auto px-6 py-8">
          {/* Action Buttons */}
            <div className="flex space-x-4 mb-12">
            <Link href="/job-pending">
              <Button variant="outline" className="bg-transparent" size="lg">
                <Clock className="w-5 h-5 mr-2" />
                处理队列
              </Button>
            </Link>
          </div>

          {!canCreateNew && !userInfo.isVip && (
            <div className="text-center mb-8">

          {/* 
          <div className="flex space-x-4 mb-12">
            <Link href="/" className="flex-1">
              <Button disabled={!canCreateNew} className={`w-full ${themeClasses.button} text-white`} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                {canCreateNew ? "创建新的分析视频" : "今日生成次数已用完"}
              </Button>
            </Link>
            </div> 
            */}

            {!userInfo.isVip && (
              <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"} mt-2`}>
                <Link
                  href="/vip"
                  className={`${theme === "light" ? "text-purple-600" : "text-purple-400"} hover:underline`}
                >
                  升级VIP享受无限制生成
                </Link>
              </p>
              )}
            </div>
          )}

          {/* Videos Grid */}
          <div className="mb-12">
            <h2 className={`${themeClasses.text} text-2xl font-bold mb-8`}>我的视频</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className={`${themeClasses.card} overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={job.thumbnail || "/placeholder.svg"}
                        alt={job.movieTitle}
                        className="w-full h-32 object-cover"
                      />
                      {job.status === "completed" && (
                        <button
                          onClick={() => handleVideoPlay(job)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                        >
                          <Play className="w-12 h-12 text-white" />
                        </button>
                      )}
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        {getStatusIcon(job.status)}
                        <Badge variant={job.quality === "HD" ? "default" : "secondary"} className="text-xs">
                          {job.quality}
                        </Badge>
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">{job.duration}</Badge>
                    </div>
                    <div className="p-4">
                      <h3 className={`${themeClasses.text} font-semibold text-lg mb-2`}>{job.movieTitle}</h3>
                      <div className="space-y-2">
                        <div
                          className={`flex justify-between text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}
                        >
                          <span>状态: {getStatusText(job)}</span>
                        </div>

                        <div
                          className={`flex justify-between text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
                        >
                          <span>创建: {job.createdAt}</span>
                          {job.completedAt && <span>完成: {job.completedAt}</span>}
                        </div>

                        {job.status === "completed" && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-transparent"
                              onClick={() => handleVideoPlay(job)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              播放
                            </Button>
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                              <Download className="w-4 h-4 mr-2" />
                              下载
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-12">
                <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} text-lg mb-4`}>
                  还没有生成任何视频
                </p>
                <Link href="/">
                  <Button className={themeClasses.button}>开始创建您的第一个视频</Button>
                </Link>
              </div>
            )}
          </div>

          {/* User Status - Moved to Bottom */}
          <Card className={`${themeClasses.card}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`${themeClasses.text} font-semibold`}>{userInfo.isVip ? "VIP用户" : "免费用户"}</h3>
                    {userInfo.isVip && <Crown className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <div className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                    {userInfo.isVip
                      ? `VIP有效期至: ${userInfo.vipExpiry}`
                      : `今日剩余: ${userInfo.dailyLimit - userInfo.dailyUsed}/${userInfo.dailyLimit} 次`}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`${themeClasses.text} font-semibold`}>{userInfo.totalGenerated}</div>
                  <div className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>累计生成</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link href="/profile" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <User className="w-4 h-4 mr-2" />
                    个人中心
                  </Button>
                </Link>
                {!userInfo.isVip && (
                  <Link href="/vip" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                      <Crown className="w-4 h-4 mr-2" />
                      升级VIP
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Player Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.movieTitle}</DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="aspect-video">
                <VideoPlayer src={selectedVideo.videoUrl} poster={selectedVideo.thumbnail} className="w-full h-full" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AppLayout>
    </div>
  )
}
