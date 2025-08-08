"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Play, Pause, ArrowRight, ArrowLeft, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"
import { usePageTitle } from "@/hooks/use-page-title"

interface VoiceOption {
  id: number
  name: string
  display_name: string
  description?: string
  language: string
  gender?: string
  voice_file: string
  is_active: boolean
  is_premium: boolean
  voice_url: string
}

// Hardcoded voice entries
const hardcodedVoices: VoiceOption[] = [
  // Chinese voices
  {
    id: 1001,
    name: "xiaoli_zh",
    display_name: "小丽",
    description: "温暖知性的成熟女声，适合讲述情感类电影",
    language: "zh",
    gender: "female",
    voice_file: "09_happy_3.aac",
    is_active: true,
    is_premium: false,
    voice_url: "/static/voices/xiaoli_sample.mp3"
  },
  {
    id: 1002,
    name: "xiaoming_zh",
    display_name: "小明",
    description: "清晰明亮的年轻男声，适合讲述青春励志类电影",
    language: "zh",
    gender: "male",
    voice_file: "xiaoming_sample.mp3",
    is_active: true,
    is_premium: true,
    voice_url: "/static/voices/xiaoming_sample.mp3"
  },
  // English voices
  {
    id: 1003,
    name: "sarah_en",
    display_name: "Sarah",
    description: "Professional and warm female voice, perfect for dramatic storytelling",
    language: "en",
    gender: "female",
    voice_file: "sarah_sample.mp3",
    is_active: true,
    is_premium: false,
    voice_url: "/static/voices/sarah_sample.mp3"
  },
  {
    id: 1004,
    name: "david_en",
    display_name: "David",
    description: "Deep and authoritative male voice, ideal for action and thriller films",
    language: "en",
    gender: "male",
    voice_file: "david_sample.mp3",
    is_active: true,
    is_premium: true,
    voice_url: "/static/voices/david_sample.mp3"
  }
]

export default function VoiceSelectionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState("")
  const [movieTitleEn, setMovieTitleEn] = useState("")
  const [movieTagline, setMovieTagline] = useState("")
  const [movieId, setMovieId] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [loading, setLoading] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [voiceLanguage, setVoiceLanguage] = useState<"zh" | "en">("zh")
  const [customVoices, setCustomVoices] = useState<any[]>([])
  const [customVoicesLoading, setCustomVoicesLoading] = useState(false)
  const [voiceBalance, setVoiceBalance] = useState({ used: 0, limit: 1 })
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()

  // Set page title
  usePageTitle("voiceSelection")

  // Fetch custom voices for VIP users
  const fetchCustomVoices = async () => {
    if (!user?.is_vip) return

    try {
      setCustomVoicesLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.custom()
      )

      if (response.ok) {
        const data = await response.json()
        setCustomVoices(data.voices || [])
        setVoiceBalance({
          used: data.voices?.length || 0,
          limit: data.limits?.vip_limit || 1
        })
      }
    } catch (error) {
      console.error("Error fetching custom voices:", error)
    } finally {
      setCustomVoicesLoading(false)
    }
  }

  useEffect(() => {
    const title = searchParams.get("titleCn")
    const titleEn = searchParams.get("titleEn")
    const tagline = searchParams.get("tagline")
    const id = searchParams.get("id")

    if (title) setMovieTitle(title)
    if (titleEn) setMovieTitleEn(titleEn)
    if (tagline) setMovieTagline(tagline)
    if (id) setMovieId(id)

    // Set voice language to match UI language
    setVoiceLanguage(language as "zh" | "en")

    // Fetch custom voices if user is VIP
    if (user?.is_vip) {
      fetchCustomVoices()
    }
  }, [searchParams, language, user])

  // Fetch voices from API
  useEffect(() => {
    fetchVoices()
  }, [voiceLanguage])

  const fetchVoices = async () => {
    setLoading(true)
    try {
      // Start with hardcoded voices for the selected language
      const hardcodedForLanguage = hardcodedVoices.filter(voice => voice.language === voiceLanguage)
      setVoices(hardcodedForLanguage)
      setLoading(false)

      // Lazy load API voices in the background
      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.voices.list()}`
      )

      if (response.ok) {
        const apiVoices: VoiceOption[] = await response.json()
        // Filter API voices by selected language and append to hardcoded ones
        const filteredApiVoices = apiVoices.filter(voice => voice.language === voiceLanguage)
        setVoices([...hardcodedForLanguage, ...filteredApiVoices])
      }
    } catch (error) {
      console.error("Error fetching voices:", error)
      // Keep hardcoded voices even if API fails
      const hardcodedForLanguage = hardcodedVoices.filter(voice => voice.language === voiceLanguage)
      setVoices(hardcodedForLanguage)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAudio = (voiceId: string, audioUrl: string) => {
    if (playingVoice === voiceId) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlayingVoice(null)
      setAudioProgress(0)
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error)
          setPlayingVoice(null)
          setAudioProgress(0)
        })
        setPlayingVoice(voiceId)
      }
    }
  }

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleLoadedMetadata = () => {
        setAudioDuration(audio.duration)
      }

      const handleTimeUpdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100)
        }
      }

      const handleEnded = () => {
        setPlayingVoice(null)
        setAudioProgress(0)
      }

      const handleError = () => {
        setPlayingVoice(null)
        setAudioProgress(0)
      }

      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
      }
    }
  }, [])

  const handleNext = () => {
    if (selectedVoice) {
      const params = new URLSearchParams(searchParams.toString())

      if (selectedVoice.startsWith("custom_")) {
        // Handle custom voice selection
        const customVoiceId = selectedVoice.replace("custom_", "")
        const customVoice = customVoices.find(v => v.id.toString() === customVoiceId)

        params.set("voiceId", "custom")
        params.set("customVoiceId", customVoiceId)
        params.set("voiceName", customVoice?.display_name || "Custom Voice")
        params.set("voiceLanguage", customVoice?.language || "zh")
      } else {
        // Handle regular voice selection
        const voice = voices.find(v => v.id.toString() === selectedVoice)
        params.set("voiceId", selectedVoice)
        params.set("voiceName", voice?.name || "")
        params.set("voiceLanguage", voiceLanguage)
      }

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



  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("voiceSelection.title")}>
        <div className="container mx-auto px-6 py-8 pb-32">

          {/* Voice Language Switch */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-1 bg-white/10 dark:bg-black/20 rounded-lg p-1">
              <Button
                variant={voiceLanguage === "zh" ? "default" : "ghost"}
                size="sm"
                onClick={() => setVoiceLanguage("zh")}
                className="text-sm px-4"
              >
                中文
              </Button>
              <Button
                variant={voiceLanguage === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => setVoiceLanguage("en")}
                className="text-sm px-4"
              >
                English
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className={`${themeClasses.text} text-lg`}>加载中...</p>
            </div>
          )}

          {/* Voice Options */}
          {!loading && (
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-4 md:gap-6">
                {voices.map((voice) => (
                  <Card key={voice.id} className={getCardStyle(voice.id.toString())}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center space-x-4">
                        {/* Avatar on Left - 1:2 ratio (taller) */}
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-32 md:w-20 md:h-40 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">
                            {voice.display_name.charAt(0)}
                          </div>
                          {/* Premium Badge */}
                          <div className="absolute -top-1 -right-1">
                            {voice.is_premium ? (
                              <Badge className="text-xs bg-yellow-500 text-black px-1.5 py-0.5">
                                限免
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-green-500 text-white px-1.5 py-0.5">
                                {voiceLanguage === "zh" ? "免费" : "Free"}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Content on Right */}
                        <div className="flex-1 min-w-0">
                          {/* Voice Info */}
                          <div className="mb-3">
                            {/* Name and Gender Badge on same row */}
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`${themeClasses.text} font-semibold text-lg`}>
                                {voice.display_name}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {voice.gender === "male" ? (voiceLanguage === "zh" ? "男声" : "Male") :
                                 voice.gender === "female" ? (voiceLanguage === "zh" ? "女声" : "Female") :
                                 (voiceLanguage === "zh" ? "中性" : "Neutral")}
                              </Badge>
                            </div>
                            {voice.description && (
                              <p className={`${themeClasses.secondaryText} text-sm mb-2 line-clamp-2`}>
                                {voice.description}
                              </p>
                            )}
                          </div>

                          {/* Audio Controls */}
                          <div className="space-y-2">
                            {playingVoice === voice.id.toString() ? (
                              // Audio Progress Bar
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={themeClasses.text}>正在播放...</span>
                                  <span className={themeClasses.secondaryText}>
                                    {Math.round((audioProgress / 100) * audioDuration)}s / {Math.round(audioDuration)}s
                                  </span>
                                </div>
                                <div className="relative">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
                                      style={{ width: `${audioProgress}%` }}
                                    />
                                  </div>
                                  <Button
                                    onClick={() => handlePlayAudio(voice.id.toString(), voice.voice_url)}
                                    size="sm"
                                    variant="ghost"
                                    className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                                  >
                                    <Pause className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Play Button and Select Button
                              <div className="flex items-center space-x-3">
                                {/* Larger Circular Play Button */}
                                <Button
                                  onClick={() => handlePlayAudio(voice.id.toString(), voice.voice_url)}
                                  size="lg"
                                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-0 shadow-lg flex-shrink-0"
                                >
                                  <Play className="w-5 h-5 md:w-6 md:h-6" />
                                </Button>

                                {/* Smaller Select Button */}
                                <Button
                                  onClick={() => setSelectedVoice(voice.id.toString())}
                                  variant={selectedVoice === voice.id.toString() ? "default" : "outline"}
                                  size="sm"
                                  className={`flex-1 text-xs md:text-sm px-3 py-2 h-10 ${selectedVoice === voice.id.toString() ?
                                    "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white" :
                                    ""}`}
                                >
                                  {selectedVoice === voice.id.toString() ? t("voiceSelection.selected") : t("voiceSelection.select")}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Custom Voices Section */}
          {user?.is_vip && customVoices.length > 0 && (
            <div className="mt-8 max-w-4xl mx-auto">
              <h3 className={`text-xl font-bold ${themeClasses.text} mb-4 text-center`}>
                {language === "zh" ? "我的专属声音" : "My Custom Voices"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {customVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className={`${themeClasses.card} ${themeClasses.cardHover} border-2 transition-all duration-300 cursor-pointer ${
                      selectedVoice === `custom_${voice.id}`
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() => setSelectedVoice(`custom_${voice.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${themeClasses.text}`}>
                              {voice.display_name}
                            </h4>
                            <p className={`text-sm ${themeClasses.secondaryText}`}>
                              {voice.language === "zh" ? "中文" : "English"} • {voice.file_size_mb}MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={selectedVoice === `custom_${voice.id}` ? "default" : "outline"}
                          size="sm"
                          className={selectedVoice === `custom_${voice.id}` ?
                            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" :
                            ""
                          }
                        >
                          {selectedVoice === `custom_${voice.id}` ? t("voiceSelection.selected") : t("voiceSelection.select")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Custom Voice Recording Option */}
          <div className="mt-8 max-w-4xl mx-auto">
            {user && user.is_vip && voiceBalance.used < voiceBalance.limit ? (
              // VIP User - Show Custom Voice Button
              <Link href={`/custom-voice-record?${searchParams.toString()}`}>
                <Card
                  className={`${themeClasses.card} ${themeClasses.cardHover} border-2 border-dashed border-purple-400 transition-all duration-300 hover:border-purple-500 cursor-pointer`}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
                      <Mic className="w-12 h-12 md:w-16 md:h-16 text-purple-500 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className={`${themeClasses.text} font-semibold text-lg md:text-xl mb-2`}>
                          {language === "zh" ? "录制专属声音" : "Record Custom Voice"}
                        </h3>
                        <p className={`${themeClasses.secondaryText} text-sm md:text-base mb-3`}>
                          {language === "zh"
                            ? "录制您的专属声音，让AI用您的声音讲述电影故事"
                            : "Record your personal voice for AI narration"}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          <Badge className="bg-yellow-500 text-black">VIP</Badge>
                          <Badge variant="outline" className="text-purple-600 border-purple-600">
                            {language === "zh" ? "点击录制" : "Click to Record"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              // Non-VIP User - Show clickable upgrade/login card
              <Card
                className={`${themeClasses.card} ${themeClasses.cardHover} border-2 border-dashed border-gray-400 transition-all duration-300 hover:border-gray-500 cursor-pointer`}
                onClick={() => {
                  if (!user) {
                    router.push('/auth')
                  } else {
                    router.push('/vip')
                  }
                }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
                    <Mic className="w-12 h-12 md:w-16 md:h-16 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className={`${themeClasses.text} font-semibold text-lg md:text-xl mb-2`}>
                        {language === "zh" ? "专属声音录制" : "Custom Voice Recording"}
                      </h3>
                      <p className={`${themeClasses.secondaryText} text-sm md:text-base mb-3`}>
                        {!user
                          ? (language === "zh" ? "登录后升级到VIP会员，解锁专属声音录制功能" : "Login and upgrade to VIP to unlock custom voice recording")
                          : (language === "zh" ? "升级到VIP会员，解锁专属声音录制功能" : "Upgrade to VIP to unlock custom voice recording")
                        }
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <Badge className="bg-yellow-500 text-black">VIP 专享</Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {!user
                            ? (language === "zh" ? "点击登录" : "Click to Login")
                            : (language === "zh" ? "点击升级" : "Click to Upgrade")
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
