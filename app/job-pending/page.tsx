"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Clock, Play, Download, ChevronDown, ChevronUp, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

const mockPendingJobs = [
  {
    id: 1,
    movieTitle: "肖申克的救赎",
    movieTitleEn: "The Shawshank Redemption",
    status: "processing",
    progress: 45,
    waitingTime: 180, // seconds
    estimatedTime: 300, // seconds
    createdAt: "2024-01-21 15:30",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 2,
    movieTitle: "霸王别姬",
    movieTitleEn: "Farewell My Concubine",
    status: "queued",
    progress: 0,
    waitingTime: 60,
    estimatedTime: 600,
    queuePosition: 3,
    createdAt: "2024-01-21 15:45",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

const mockCompletedJobs = [
  {
    id: 3,
    movieTitle: "阿甘正传",
    movieTitleEn: "Forrest Gump",
    status: "completed",
    progress: 100,
    createdAt: "2024-01-20 14:30",
    completedAt: "2024-01-20 15:45",
    duration: "5分25秒",
    durationEn: "5m 25s",
    quality: "HD",
    downloadUrl: "#",
    videoUrl: "https://example.com/video1.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 4,
    movieTitle: "泰坦尼克号",
    movieTitleEn: "Titanic",
    status: "completed",
    progress: 100,
    createdAt: "2024-01-19 10:15",
    completedAt: "2024-01-19 11:30",
    duration: "8分12秒",
    durationEn: "8m 12s",
    quality: "HD",
    downloadUrl: "#",
    videoUrl: "https://example.com/video2.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

export default function JobPendingPage() {
  const searchParams = useSearchParams()
  const [pendingJobs, setPendingJobs] = useState(mockPendingJobs)
  const [completedJobs, setCompletedJobs] = useState(mockCompletedJobs)
  const [showAllVideos, setShowAllVideos] = useState(false)
  const { theme } = useTheme()
  const { language, t } = useLanguage()

  useEffect(() => {
    // Simulate real-time updates for waiting time
    const interval = setInterval(() => {
      setPendingJobs((prev) =>
        prev.map((job) => ({
          ...job,
          waitingTime: job.waitingTime + 1,
          progress: job.status === "processing" ? Math.min(job.progress + 0.5, 95) : job.progress,
        })),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    return {
      background: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "processing":
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
      case "queued":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusText = (job: any) => {
    switch (job.status) {
      case "completed":
        return t("jobPending.completed")
      case "processing":
        return t("jobPending.processing")
      case "queued":
        return `${t("jobPending.inQueue")} (#${job.queuePosition})`
      default:
        return "Unknown"
    }
  }

  const handleVideoPlay = (videoUrl: string) => {
    window.open(videoUrl, "_blank")
  }

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("jobPending.title")}>
        <div className="container mx-auto px-6 py-8">
          {/* Back to Video Generation Button */}
          <div className="mb-6">
            <Link href="/video-generation">
              <Button variant="outline" className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回视频中心
              </Button>
            </Link>
          </div>

          {/* Pending Jobs Section */}
          <div className="mb-12">
            <h2 className={`${themeClasses.text} text-2xl font-bold mb-6`}>{t("jobPending.pendingJobs")}</h2>

            {pendingJobs.length > 0 ? (
              <div className="space-y-4">
                {pendingJobs.map((job) => (
                  <Card key={job.id} className={`${themeClasses.card}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={job.thumbnail || "/placeholder.svg"}
                          alt={job.movieTitle}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`${themeClasses.text} font-semibold text-lg`}>
                              {job.movieTitle}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(job.status)}
                              <span className={`${themeClasses.secondaryText} text-sm`}>{getStatusText(job)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <span className={`${themeClasses.secondaryText} text-sm`}>
                                {t("jobPending.waitingTime")}:
                              </span>
                              <div className={`${themeClasses.text} font-mono text-lg`}>
                                {formatTime(job.waitingTime)}
                              </div>
                            </div>
                            <div>
                              <span className={`${themeClasses.secondaryText} text-sm`}>
                                {t("jobPending.estimatedTime")}:
                              </span>
                              <div className={`${themeClasses.text} font-mono text-lg`}>
                                {formatTime(job.estimatedTime)}
                              </div>
                            </div>
                          </div>

                          {job.status === "processing" && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className={themeClasses.secondaryText}>{t("jobPending.processing")}</span>
                                <span className={themeClasses.text}>{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className={`${themeClasses.card} text-center`}>
                <CardContent className="p-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className={`${themeClasses.secondaryText} text-lg`}>
                    {t("jobPending.noPendingJobs")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Videos Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${themeClasses.text} text-2xl font-bold`}>{t("jobPending.myVideos")}</h2>
              <Button
                onClick={() => setShowAllVideos(!showAllVideos)}
                variant="outline"
                className={`${theme === "light" ? "bg-white/50 hover:bg-white/70" : "bg-white/10 hover:bg-white/20"}`}
              >
                {showAllVideos ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    {t("jobPending.hideVideos")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    {t("jobPending.showAllVideos")}
                  </>
                )}
              </Button>
            </div>

            {showAllVideos && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedJobs.map((job) => (
                  <Card key={job.id} className={`${themeClasses.card} overflow-hidden`}>
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={job.thumbnail || "/placeholder.svg"}
                          alt={job.movieTitle}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => handleVideoPlay(job.videoUrl)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                        >
                          <Play className="w-12 h-12 text-white" />
                        </button>
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <Badge variant={job.quality === "HD" ? "default" : "secondary"} className="text-xs">
                            {job.quality}
                          </Badge>
                        </div>
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                          {job.duration}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className={`${themeClasses.text} font-semibold text-lg mb-2`}>
                          {job.movieTitle}
                        </h3>
                        <div className="space-y-2">
                          <div className={`flex justify-between text-xs ${themeClasses.secondaryText}`}>
                            <span>
                              {t("jobPending.completed")}: {job.completedAt}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-transparent"
                              onClick={() => handleVideoPlay(job.videoUrl)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {t("videoGeneration.play")}
                            </Button>
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                              <Download className="w-4 h-4 mr-2" />
                              {t("videoGeneration.download")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!showAllVideos && (
              <Card className={`${themeClasses.card} text-center`}>
                <CardContent className="p-6">
                  <p className={`${themeClasses.secondaryText}`}>
                    {t("jobPending.completedVideosCount", { count: completedJobs.length })}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
