"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Play, Pause, ArrowRight, ArrowLeft, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

const voiceOptions = [
  {
    id: "male-young",
    name: "年轻男声 - 小明",
    nameEn: "Young Male - Alex",
    description: "清晰有力，适合技术分析",
    descriptionEn: "Clear and powerful, suitable for technical analysis",
    avatar: "/placeholder.svg?height=80&width=80",
    audioSample: "/sample-audio-1.mp3",
    characteristics: ["清晰", "有力", "专业"],
    characteristicsEn: ["Clear", "Powerful", "Professional"],
  },
  {
    id: "female-warm",
    name: "温暖女声 - 小雅",
    nameEn: "Warm Female - Emma",
    description: "亲切自然，适合情感解读",
    descriptionEn: "Warm and natural, suitable for emotional interpretation",
    avatar: "/placeholder.svg?height=80&width=80",
    audioSample: "/sample-audio-2.mp3",
    characteristics: ["温暖", "亲切", "自然"],
    characteristicsEn: ["Warm", "Kind", "Natural"],
  },
  {
    id: "male-mature",
    name: "成熟男声 - 老王",
    nameEn: "Mature Male - David",
    description: "沉稳专业，适合深度分析",
    descriptionEn: "Steady and professional, suitable for deep analysis",
    avatar: "/placeholder.svg?height=80&width=80",
    audioSample: "/sample-audio-3.mp3",
    characteristics: ["沉稳", "专业", "权威"],
    characteristicsEn: ["Steady", "Professional", "Authoritative"],
  },
  {
    id: "female-elegant",
    name: "优雅女声 - 小慧",
    nameEn: "Elegant Female - Sophia",
    description: "知性温柔，适合文艺解读",
    descriptionEn: "Intellectual and gentle, suitable for artistic interpretation",
    avatar: "/placeholder.svg?height=80&width=80",
    audioSample: "/sample-audio-4.mp3",
    characteristics: ["优雅", "知性", "温柔"],
    characteristicsEn: ["Elegant", "Intellectual", "Gentle"],
  },
]

export default function VoiceSelectionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState("")
  const [movieTitleEn, setMovieTitleEn] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()

  useEffect(() => {
    const title = searchParams.get("titleCn")
    const titleEn = searchParams.get("titleEn")

    if (title) setMovieTitle(title)
    if (titleEn) setMovieTitleEn(titleEn)
  }, [searchParams])

  const handlePlayAudio = (voiceId: string, audioSample: string) => {
    if (playingVoice === voiceId) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlayingVoice(null)
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = audioSample
        audioRef.current.play()
        setPlayingVoice(voiceId)
      }
    }
  }

  const handleNext = () => {
    if (selectedVoice) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("voice", selectedVoice)
      router.push(`/script-review?${params.toString()}`)
    }
  }

  const handleBack = () => {
    router.push(`/analysis-options?${searchParams.toString()}`)
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
        cardHover: "hover:bg-white/90",
      }
    }
    return {
      background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
      cardHover: "hover:bg-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  const getCardStyle = (voiceId: string) => {
    const baseStyle = `border-2 transition-all duration-300 ${themeClasses.card} ${themeClasses.cardHover}`
    if (selectedVoice === voiceId) {
      return `${baseStyle} border-pink-500 ring-2 ring-pink-500/20`
    }
    return `${baseStyle} border-transparent hover:border-pink-300`
  }

  const getButtonStyle = (voiceId: string, type: "preview" | "select") => {
    if (type === "preview") {
      return `flex-1 ${
        theme === "light"
          ? "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
          : "bg-white/10 text-white border-white/30 hover:bg-white/20"
      }`
    }

    if (selectedVoice === voiceId) {
      return "flex-1 bg-pink-600 hover:bg-pink-700 text-white"
    }
    return `flex-1 ${
      theme === "light" ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-white/10 text-white hover:bg-white/20"
    }`
  }

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("voiceSelection.title")}>
        <div className="container mx-auto px-6 py-8 pb-32">
          {/* Movie Info */}
          <div className="flex items-center space-x-4 mb-12 max-w-2xl mx-auto">
            <Image
              src={`/placeholder.svg?height=120&width=80&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+poster`}
              alt={movieTitle}
              width={80}
              height={120}
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>{movieTitle}</h2>
              <p className={themeClasses.secondaryText}>{t("voiceSelection.subtitle")}</p>
            </div>
          </div>

          {/* Voice Options */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {voiceOptions.map((voice) => (
                <Card key={voice.id} className={getCardStyle(voice.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={voice.avatar || "/placeholder.svg"} alt={voice.name} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                          {(language === "zh" ? voice.name : voice.nameEn).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className={`${themeClasses.text} font-semibold text-lg mb-1`}>
                          {language === "zh" ? voice.name : voice.nameEn}
                        </h3>
                        <p className={`${themeClasses.secondaryText} text-sm mb-2`}>
                          {language === "zh" ? voice.description : voice.descriptionEn}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(language === "zh" ? voice.characteristics : voice.characteristicsEn).map((char, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Audio Preview and Select Buttons */}
                    <div className="flex items-center space-x-2 mt-4">
                      <Button
                        onClick={() => handlePlayAudio(voice.id, voice.audioSample)}
                        size="sm"
                        variant="outline"
                        className={getButtonStyle(voice.id, "preview")}
                      >
                        {playingVoice === voice.id ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            {t("voiceSelection.stopAudio")}
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {t("voiceSelection.tryAudio")}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setSelectedVoice(voice.id)}
                        size="sm"
                        className={getButtonStyle(voice.id, "select")}
                      >
                        {selectedVoice === voice.id ? t("voiceSelection.selected") : t("voiceSelection.select")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Voice Option */}
            <div className="mt-8">
              <Link href={`/custom-voice?${searchParams.toString()}`}>
                <Card
                  className={`${themeClasses.card} ${themeClasses.cardHover} border-2 border-dashed border-purple-400 transition-all duration-300 hover:border-purple-500`}
                >
                  <CardContent className="p-6 text-center">
                    <Mic className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className={`${themeClasses.text} font-semibold text-lg mb-2`}>
                      {t("voiceSelection.customVoice")}
                    </h3>
                    <p className={`${themeClasses.secondaryText} text-sm mb-4`}>
                      {language === "zh"
                        ? "录制您的专属声音，让AI用您的声音讲述电影故事"
                        : "Record your personal voice for AI narration"}
                    </p>
                    <Badge className="bg-yellow-500 text-black">VIP</Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Audio Element */}
          <audio ref={audioRef} onEnded={() => setPlayingVoice(null)} onError={() => setPlayingVoice(null)} />
        </div>

        {/* Bottom Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto flex space-x-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedVoice}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {t("voiceSelection.generateScript")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
