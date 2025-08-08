"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Play, Pause, Edit, RefreshCw, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { MovieHeader } from "@/components/movie-header"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"



interface MovieData {
  id: string
  title: string
  title_zh?: string
  title_en?: string
  tagline?: string
}

interface ContentBlock {
  type: 'entries' | 'clean'
  title: string
  content: string
}

export default function ScriptReviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()

  useEffect(() => {
    const movieId = searchParams.get("movieId")
    if (movieId) {
      fetchMovieData(movieId)
    }
  }, [searchParams])

  const fetchMovieData = async (movieId: string) => {
    setLoading(true)
    try {
      // Fetch movie data
      const movieResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${movieId}`)
      if (movieResponse.ok) {
        const movie = await movieResponse.json()
        setMovieData(movie)
      }

      // Fetch entries content
      const entriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/static/${movieId}/entries?lang_variant=chs`)
      let entriesContent = ""
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json()
        entriesContent = JSON.stringify(entriesData, null, 2)
      }

      // Fetch clean content
      const cleanResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/static/${movieId}/clean?lang_variant=chs`)
      let cleanContent = ""
      if (cleanResponse.ok) {
        cleanContent = await cleanResponse.text()
      }

      // Set content blocks
      const blocks: ContentBlock[] = []
      if (entriesContent) {
        blocks.push({
          type: 'entries',
          title: language === 'zh' ? '电影片段数据' : 'Movie Entries Data',
          content: entriesContent
        })
      }
      if (cleanContent) {
        blocks.push({
          type: 'clean',
          title: language === 'zh' ? '清理后文本' : 'Clean Text',
          content: cleanContent
        })
      }
      setContentBlocks(blocks)

    } catch (error) {
      console.error("Error fetching movie data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      // Pause audio logic
    } else {
      setIsPlaying(true)
      // Play audio logic
      // Simulate audio progress
      const interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            clearInterval(interval)
            return 0
          }
          return prev + 1
        })
      }, 100)
    }
  }

  const handleEditSection = (sectionId: number) => {
    router.push(`/script-edit?sectionId=${sectionId}&${searchParams.toString()}`)
  }

  const handleRegenerate = () => {
    // Check if user is logged in
    const isLoggedIn = false // This would come from your auth state

    if (!isLoggedIn) {
      router.push("/auth?redirect=script-review")
    } else {
      setIsGenerating(true)
      // Simulate regeneration
      setTimeout(() => {
        setIsGenerating(false)
      }, 3000)
    }
  }

  const handleNext = () => {
    router.push(`/job-submission?${searchParams.toString()}`)
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    return {
      background: "bg-gradient-to-br from-amber-900 via-orange-900 to-red-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div
      className={themeClasses.background}
      style={{
        backgroundImage: movieData ? `url(/placeholder.svg?height=1080&width=1920&query=${encodeURIComponent(movieData.title_en || movieData.title)}+movie+poster)` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <AppLayout title={t("scriptReview.title")}>
        <div className="container mx-auto px-6 py-8 pb-24 relative z-10">
          {/* Movie Info */}
          {loading ? (
            <div className="text-center py-8">
              <p className={themeClasses.text}>加载中...</p>
            </div>
          ) : movieData ? (
            <MovieHeader
              movieId={movieData.id}
              movieTitle={movieData.title_zh || movieData.title}
              movieTitleEn={movieData.title_en}
              movieTagline={movieData.tagline}
              subtitle={t("scriptReview.subtitle")}
              className="mb-8 max-w-2xl mx-auto"
            />
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.text}>未找到电影信息</p>
            </div>
          )}

          {/* Content Info */}
          {contentBlocks.length > 0 && (
            <Card className={`${themeClasses.card} backdrop-blur-md mb-8`}>
              <CardHeader>
                <CardTitle className={themeClasses.text}>
                  {language === "zh" ? "内容概览" : "Content Overview"}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {language === "zh" ? "内容块" : "Content Blocks"}: {contentBlocks.length}
                  </Badge>
                  {movieData && (
                    <Badge variant="secondary">
                      {language === "zh" ? "电影" : "Movie"}: {movieData.title_zh || movieData.title}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Video Preview Player */}
          <Card className={`${themeClasses.card} backdrop-blur-md mb-8`}>
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={movieData ? `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(movieData.title_en || movieData.title)}+movie+scene` : "/placeholder.svg?height=200&width=400"}
                  alt={t("scriptReview.videoPreview")}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-sm text-white mb-2">
                    <span>{t("scriptReview.videoPreview")}</span>
                    <span>{language === "zh" ? "预计时长" : "Estimated Duration"}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Blocks */}
          <div className="space-y-6">
            {contentBlocks.map((block, index) => (
              <Card key={block.type} className={`${themeClasses.card} backdrop-blur-md`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`${themeClasses.text} text-lg`}>
                      {block.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {block.type === 'entries' ? 'JSON' : 'TEXT'}
                      </Badge>
                      <Button
                        onClick={() => handleEditSection(index + 1)}
                        size="sm"
                        variant="ghost"
                        className={`${theme === "light" ? "text-gray-800 hover:bg-gray-200" : "text-white hover:bg-white/10"}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`${themeClasses.secondaryText} leading-relaxed`}>
                    {block.type === 'entries' ? (
                      <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto max-h-96">
                        {block.content}
                      </pre>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {block.content}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Note */}
          <div className="mt-8">
            <Card className={`${themeClasses.card} backdrop-blur-md`}>
              <CardContent className="p-4 text-center">
                <p className={`${themeClasses.secondaryText} text-sm italic`}>{t("scriptReview.aiNote")}</p>
              </CardContent>
            </Card>
          </div>

          {isGenerating && (
            <Card className={`${themeClasses.card} backdrop-blur-md mt-8`}>
              <CardContent className="p-6 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                <p className={themeClasses.text}>{t("scriptReview.regenerating")}</p>
              </CardContent>
            </Card>
          )}

          {/* Audio Element */}
          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onError={() => setIsPlaying(false)} />
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10 z-40">
          <div className="container mx-auto flex space-x-3">
            <Button
              onClick={handleRegenerate}
              disabled={isGenerating}
              variant="outline"
              className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              {t("scriptReview.regenerate")}
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              {t("scriptReview.generateVideo")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
