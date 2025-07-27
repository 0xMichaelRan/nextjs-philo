"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Play, Pause, Edit, RefreshCw, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

const mockScript = {
  title: "《肖申克的救赎》深度分析",
  titleEn: "The Shawshank Redemption - Deep Analysis",
  sections: [
    {
      id: 1,
      title: "开篇：希望的种子",
      titleEn: "Opening: Seeds of Hope",
      content:
        "在这部被誉为影史最伟大的电影之一的作品中，导演弗兰克·德拉邦特用细腻的镜头语言为我们展现了一个关于希望、友谊和救赎的永恒故事。影片开场，安迪·杜弗雷恩坐在车中，手握酒瓶和手枪，这个画面暗示着绝望与毁灭的可能性。",
      contentEn:
        "In this masterpiece hailed as one of the greatest films in cinema history, director Frank Darabont uses delicate cinematography to present us with an eternal story about hope, friendship, and redemption. The film opens with Andy Dufresne sitting in his car, holding a bottle and a gun, an image that hints at the possibility of despair and destruction.",
      duration: "45秒",
      durationEn: "45s",
    },
    {
      id: 2,
      title: "监狱生活：制度化的恐怖",
      titleEn: "Prison Life: The Horror of Institutionalization",
      content:
        "肖申克监狱不仅仅是一个关押罪犯的场所，更是一个制度化压迫的象征。瑞德的那句'制度化'深刻揭示了监狱系统如何逐渐剥夺人的自由意志。通过对比老布和瑞德的不同结局，影片探讨了个体在强大制度面前的挣扎与选择。",
      contentEn:
        "Shawshank Prison is not merely a place to confine criminals, but a symbol of institutional oppression. Red's famous line about being 'institutionalized' profoundly reveals how the prison system gradually strips away one's free will. Through contrasting the different fates of Brooks and Red, the film explores the struggle and choices individuals face against powerful institutions.",
      duration: "1分20秒",
      durationEn: "1m 20s",
    },
    {
      id: 3,
      title: "友谊的力量：超越种族与阶层",
      titleEn: "The Power of Friendship: Beyond Race and Class",
      content:
        "安迪与瑞德的友谊是影片的核心情感线索。两个来自不同背景的男人，在绝望的环境中建立起深厚的友谊。这种友谊超越了种族、阶层和时间的界限，成为他们在黑暗中的光明。",
      contentEn:
        "The friendship between Andy and Red is the core emotional thread of the film. Two men from different backgrounds establish a deep friendship in a desperate environment. This friendship transcends the boundaries of race, class, and time, becoming their light in the darkness.",
      duration: "1分10秒",
      durationEn: "1m 10s",
    },
    {
      id: 4,
      title: "救赎的真谛：内心的自由",
      titleEn: "The True Meaning of Redemption: Inner Freedom",
      content:
        "真正的救赎不是肉体的解脱，而是精神的自由。安迪通过音乐、图书馆、教育等方式，在监狱中创造了精神的绿洲。他的逃脱不仅是对肉体束缚的挣脱，更是对精神自由的追求和实现。",
      contentEn:
        "True redemption is not physical liberation, but spiritual freedom. Andy creates a spiritual oasis in prison through music, the library, and education. His escape is not only a break from physical bondage, but also the pursuit and realization of spiritual freedom.",
      duration: "1分30秒",
      durationEn: "1m 30s",
    },
  ],
  totalDuration: "5分25秒",
  totalDurationEn: "5m 25s",
  wordCount: 1247,
}

export default function ScriptReviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState("")
  const [movieTitleEn, setMovieTitleEn] = useState("")
  const [script, setScript] = useState(mockScript)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()

  useEffect(() => {
    const title = searchParams.get("titleCn")
    const titleEn = searchParams.get("titleEn")

    if (title) setMovieTitle(title)
    if (titleEn) setMovieTitleEn(titleEn)
  }, [searchParams])

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
    router.push(`/job-pending?${searchParams.toString()}`)
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
        backgroundImage: `url(/placeholder.svg?height=1080&width=1920&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+poster)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <AppLayout title={t("scriptReview.title")}>
        <div className="container mx-auto px-6 py-8 pb-24 relative z-10">
          {/* Movie Info */}
          <div className="flex items-center space-x-4 mb-8 max-w-2xl mx-auto">
            <Image
              src={`/placeholder.svg?height=120&width=80&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+poster`}
              alt={movieTitle}
              width={80}
              height={120}
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>{movieTitle}</h2>
              <p className={themeClasses.secondaryText}>{t("scriptReview.subtitle")}</p>
            </div>
          </div>

          {/* Script Info */}
          <Card className={`${themeClasses.card} backdrop-blur-md mb-8`}>
            <CardHeader>
              <CardTitle className={themeClasses.text}>{language === "zh" ? script.title : script.titleEn}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {t("scriptReview.totalDuration")}: {language === "zh" ? script.totalDuration : script.totalDurationEn}
                </Badge>
                <Badge variant="secondary">
                  {t("scriptReview.wordCount")}: {script.wordCount}
                </Badge>
                <Badge variant="secondary">
                  {t("scriptReview.movie")}: {movieTitle}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Video Preview Player */}
          <Card className={`${themeClasses.card} backdrop-blur-md mb-8`}>
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={`/placeholder.svg?height=200&width=400&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+scene`}
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
                    <span>{language === "zh" ? script.totalDuration : script.totalDurationEn}</span>
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

          {/* Script Sections */}
          <div className="space-y-6">
            {script.sections.map((section, index) => (
              <Card key={section.id} className={`${themeClasses.card} backdrop-blur-md`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`${themeClasses.text} text-lg`}>
                      {language === "zh" ? section.title : section.titleEn}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {language === "zh" ? section.duration : section.durationEn}
                      </Badge>
                      <Button
                        onClick={() => handleEditSection(section.id)}
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
                  <p className={`${themeClasses.secondaryText} leading-relaxed`}>
                    {language === "zh" ? section.content : section.contentEn}
                  </p>
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
