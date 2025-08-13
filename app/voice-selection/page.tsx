"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Play, Pause, ArrowRight, Mic, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"


import { AppLayout } from "@/components/app-layout"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useFlow } from "@/hooks/use-flow"
import { apiConfig } from "@/lib/api-config"
import { usePageTitle } from "@/hooks/use-page-title"
import { VipUpgradeModal } from "@/components/vip-upgrade-modal"
import { VoiceAudioPlayer } from "@/components/voice-audio-player"



interface CustomVoice {
  id: number
  name: string
  display_name: string
  language: string
  created_at: string
  file_size_mb: number
  audio_url: string
  duration?: string
}

// Interface for default voices from API (updated for new unified response)
interface DefaultVoice {
  id: string
  voice_code: string
  voice_name: string
  display_name: string  // Localized display name
  description?: string  // Localized description
  gender: string
  language: string
  voice_file?: string
  is_active: boolean
  is_premium: boolean  // Whether this voice requires VIP/SVIP subscription
  voice_type: string
  supported_providers: string[]
  sort_order: number
  // Legacy fields for backward compatibility
  display_name_zh?: string
  display_name_en?: string
  description_zh?: string
  description_en?: string
}

export default function VoiceSelectionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState("")
  const [movieTitleEn, setMovieTitleEn] = useState("")
  const [movieTagline, setMovieTagline] = useState("")
  const [movieId, setMovieId] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [voices, setVoices] = useState<DefaultVoice[]>([])
  const [loading, setLoading] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [voiceLanguage, setVoiceLanguage] = useState<"zh" | "en">("zh")
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([])
  const [customVoicesLoading, setCustomVoicesLoading] = useState(false)
  const [voiceBalance, setVoiceBalance] = useState({ used: 0, limit: 1 })
  const [showVipModal, setShowVipModal] = useState(false)
  // Filter states
  const [languageFilter, setLanguageFilter] = useState<string | null>(null) // 'zh' | 'en' | null
  const [freeOnlyFilter, setFreeOnlyFilter] = useState(false)
  const [ttsProvider, setTtsProvider] = useState<"indexTTS" | "xfyun">("indexTTS")
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { updateFlowState } = useFlow()

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
          limit: data.limits?.custom_voices || 1
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
    const newVoiceId = searchParams.get("newVoiceId")

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

    // If a new voice was just recorded, select it
    if (newVoiceId) {
      if (newVoiceId === 'latest') {
        // Select the latest custom voice after fetching
        setTimeout(() => {
          if (customVoices.length > 0) {
            const latestVoice = customVoices[0] // Assuming voices are sorted by creation date desc
            setSelectedVoice(`custom_${latestVoice.id}`)
          }
        }, 500)
      } else {
        setSelectedVoice(`custom_${newVoiceId}`)
      }
    }
  }, [searchParams, language, user])

  // Fetch voices from API once on mount
  useEffect(() => {
    fetchVoices()
  }, [])

  // Auto-select appropriate TTS provider when voice is selected
  useEffect(() => {
    if (selectedVoice && !selectedVoice.startsWith("custom_")) {
      const selectedVoiceData = voices.find(v => v.id.toString() === selectedVoice)
      if (selectedVoiceData?.supported_providers) {
        // If current provider is not supported, switch to the first supported one
        if (!selectedVoiceData.supported_providers.includes(ttsProvider)) {
          setTtsProvider(selectedVoiceData.supported_providers[0] as "indexTTS" | "xfyun")
        }
      }
    }
  }, [selectedVoice, voices])

  const fetchVoices = async () => {
    setLoading(true)
    try {
      // Fetch all default voices regardless of language
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.default() // Remove language parameter to get all voices
      )

      if (response.ok) {
        const defaultVoices: DefaultVoice[] = await response.json()
        setVoices(defaultVoices)
      } else {
        console.error("Failed to fetch default voices")
        setVoices([])
      }
    } catch (error) {
      console.error("Error fetching voices:", error)
      setVoices([])
    } finally {
      setLoading(false)
    }
  }

  // Filter voices based on current filters
  const getFilteredVoices = () => {
    let filtered = voices

    // Apply language filter
    if (languageFilter) {
      filtered = filtered.filter(voice => voice.language === languageFilter)
    }

    // Apply free-only filter for non-VIP users
    if (freeOnlyFilter || (!user?.is_vip && freeOnlyFilter)) {
      filtered = filtered.filter(voice => !voice.is_premium)
    }

    return filtered
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
        // Ensure the audio URL is absolute
        const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${apiConfig.getBaseUrl()}${audioUrl}`
        audioRef.current.src = fullAudioUrl
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error)
          console.error("Audio source:", fullAudioUrl)
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

      const handleError = (e: Event) => {
        console.error("Audio playback error:", e)
        const audio = e.target as HTMLAudioElement
        if (audio.error) {
          console.error("Audio error details:", {
            code: audio.error.code,
            message: audio.error.message,
            src: audio.src
          })
        }
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
    // Check if user is logged in before proceeding to script review
    if (!user) {
      // Store current page for redirect after login
      localStorage.setItem('redirectAfterAuth', '/script-review')
      router.push('/auth')
      return
    }

    if (selectedVoice) {
      const params = new URLSearchParams(searchParams.toString())

      if (selectedVoice.startsWith("custom_")) {
        // Handle custom voice selection - always use indexTTS for custom voices
        const customVoiceId = selectedVoice.replace("custom_", "")
        const customVoice = customVoices.find(v => v.id.toString() === customVoiceId)

        params.set("voiceId", "custom")
        params.set("customVoiceId", customVoiceId)
        params.set("voiceName", customVoice?.display_name || "Custom Voice")
        params.set("voiceLanguage", customVoice?.language || "zh")
        params.set("ttsProvider", "indexTTS") // Custom voices always use indexTTS
      } else {
        // Handle regular voice selection
        const voice = voices.find(v => v.voice_code === selectedVoice)
        params.set("voiceId", voice?.voice_code || selectedVoice)  // Use voice_code as voiceId
        params.set("voiceName", voice?.display_name || voice?.voice_code || "")
        params.set("voiceCode", voice?.voice_code || "")
        params.set("voiceLanguage", voiceLanguage)
        params.set("ttsProvider", ttsProvider) // Use selected TTS provider
      }

      // Update flow state with voice selection
      const selectedVoiceData = voices.find(v => v.voice_code === selectedVoice)
      updateFlowState({
        voiceId: selectedVoice.startsWith("custom_") ? "custom" : (selectedVoiceData?.voice_code || selectedVoice),
        voiceName: selectedVoice.startsWith("custom_") ? "Custom Voice" : (selectedVoiceData?.display_name || selectedVoiceData?.display_name_zh || selectedVoiceData?.display_name_en || selectedVoiceData?.voice_code || ""),
        voiceLanguage: voiceLanguage,
        customVoiceId: selectedVoice.startsWith("custom_") ? selectedVoice.replace("custom_", "") : undefined,
        ttsProvider: selectedVoice.startsWith("custom_") ? "xfyun" : ttsProvider  // Changed from indexTTS to xfyun
      })

      router.push('/script-review')
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
        card: "bg-white/80 border-gray-200/50 backdrop-blur-md",
        cardHover: "hover:bg-white/90 hover:shadow-lg transition-all duration-300",
        selectedCard: "border-purple-500 bg-purple-50 ring-2 ring-purple-500/20",
        hoverCard: "hover:border-purple-300",
        button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
        accent: "text-purple-600",
      }
    }
    return {
      background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20 backdrop-blur-md",
      cardHover: "hover:bg-white/20 hover:shadow-xl transition-all duration-300",
      selectedCard: "border-purple-400 bg-purple-900/50 ring-2 ring-purple-400/60",
      hoverCard: "hover:border-purple-500",
      button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      accent: "text-purple-400",
    }
  }

  const themeClasses = getThemeClasses()

  const getCardStyle = (voiceId: string) => {
    const baseStyle = `border-2 ${themeClasses.card} ${themeClasses.cardHover}`
    if (selectedVoice === voiceId) {
      return `${baseStyle} ${themeClasses.selectedCard}`
    }
    return `${baseStyle} border-transparent ${themeClasses.hoverCard}`
  }



  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("voiceSelection.title")}>
        <div className="container mx-auto px-6 py-8 pb-32">

          {/* Voice Filters */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <Button
                variant={languageFilter === "zh" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguageFilter(languageFilter === "zh" ? null : "zh")}
                className="text-sm px-4"
              >
                {language === "zh" ? "中文语音" : "Chinese"}
              </Button>
              <Button
                variant={freeOnlyFilter ? "default" : "outline"}
                size="sm"
                onClick={() => setFreeOnlyFilter(!freeOnlyFilter)}
                className="text-sm px-4"
              >
                {language === "zh" ? "免费语音" : "Free Voices"}
              </Button>
            </div>
          </div>

          {/* TTS Provider Selection - Only show for default voices */}
          {!selectedVoice?.startsWith("custom_") && selectedVoice && (
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center space-y-2">
                <label className={`${themeClasses.text} text-sm font-medium`}>
                  {language === "zh" ? "语音合成引擎" : "TTS Engine"}
                </label>
                <div className="flex items-center space-x-1 bg-white/10 dark:bg-black/20 rounded-lg p-1">
                  {(() => {
                    const selectedVoiceData = voices.find(v => v.id.toString() === selectedVoice)
                    const supportedProviders = selectedVoiceData?.supported_providers || ['indexTTS']

                    return supportedProviders.map((provider) => (
                      <Button
                        key={provider}
                        variant={ttsProvider === provider ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTtsProvider(provider as "indexTTS" | "xfyun")}
                        className="text-sm px-4"
                      >
                        {provider === 'indexTTS' ? 'IndexTTS' : '讯飞语音'}
                      </Button>
                    ))
                  })()}
                </div>
              </div>
            </div>
          )}

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
                {getFilteredVoices().map((voice) => (
                  <Card key={voice.voice_code} className={getCardStyle(voice.voice_code)}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center space-x-4">
                        {/* Avatar on Left - 1:2 ratio (taller) */}
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-32 md:w-20 md:h-40 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">
                            {(voice.display_name || voice.display_name_zh || voice.display_name_en || voice.voice_name || "?").charAt(0)}
                          </div>
                          {/* Free/VIP Badge */}
                          <div className="absolute -top-1 -right-1">
                            <Badge className={`text-xs px-1.5 py-0.5 ${
                              voice.is_premium
                                ? "bg-yellow-500 text-black"
                                : "bg-green-500 text-white"
                            }`}>
                              {voice.is_premium ? "VIP" : (language === "zh" ? "免费" : "Free")}
                            </Badge>
                          </div>
                        </div>

                        {/* Content on Right */}
                        <div className="flex-1 min-w-0">
                          {/* Voice Info */}
                          <div className="mb-3">
                            {/* Name and Gender Badge on same row */}
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`${themeClasses.text} font-semibold text-lg`}>
                                {voice.display_name || voice.display_name_zh || voice.display_name_en || voice.voice_name}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {voice.gender === "male" ? (language === "zh" ? "男声" : "Male") :
                                 voice.gender === "female" ? (language === "zh" ? "女声" : "Female") :
                                 (language === "zh" ? "中性" : "Neutral")}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {voice.language === "zh" ? (language === "zh" ? "中文" : "Chinese") :
                                 voice.language === "en" ? (language === "zh" ? "英文" : "English") :
                                 voice.language.toUpperCase()}
                              </Badge>
                              {voice.is_premium && (
                                <Badge className="text-xs bg-yellow-500 text-black px-1.5 py-0.5">
                                  VIP
                                </Badge>
                              )}
                            </div>
                            {(voice.description || voice.description_zh || voice.description_en) && (
                              <p className={`${themeClasses.secondaryText} text-sm mb-2 line-clamp-2`}>
                                {voice.description || voice.description_zh || voice.description_en}
                              </p>
                            )}
                          </div>

                          {/* Audio Controls */}
                          <div className="space-y-2">
                            {playingVoice === voice.id.toString() ? (
                              // Audio Progress Bar + Select Button
                              <div className="space-y-3">
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
                                    onClick={() => setPlayingVoice(null)}
                                    size="sm"
                                    variant="ghost"
                                    className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                                  >
                                    <Pause className="w-3 h-3" />
                                  </Button>
                                </div>
                                {/* Select Button - Always available during playback */}
                                <Button
                                  onClick={() => {
                                    // Check VIP restriction for premium voices
                                    if (voice.is_premium && !user?.is_vip) {
                                      setShowVipModal(true)
                                      return
                                    }
                                    setSelectedVoice(voice.voice_code)
                                  }}
                                  variant={selectedVoice === voice.voice_code ? "default" : "outline"}
                                  size="sm"
                                  disabled={voice.is_premium && !user?.is_vip}
                                  className={`w-full text-xs md:text-sm px-3 py-2 h-10 ${
                                    voice.is_premium && !user?.is_vip
                                      ? "opacity-50 cursor-not-allowed"
                                      : selectedVoice === voice.voice_code
                                        ? `${themeClasses.button} text-white`
                                        : `border-gray-300 dark:border-gray-600 ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800`
                                  }`}
                                >
                                  {voice.is_premium && !user?.is_vip
                                    ? (language === "zh" ? "需要VIP" : "VIP Required")
                                    : selectedVoice === voice.voice_code
                                      ? t("voiceSelection.selected")
                                      : t("voiceSelection.select")
                                  }
                                </Button>
                              </div>
                            ) : (
                              // Play Button and Select Button
                              <div className="flex items-center space-x-3">
                                {/* Larger Circular Play Button - Now enabled for default voices */}
                                <Button
                                  onClick={() => {
                                    // Check VIP restriction for premium voices
                                    if (voice.is_premium && !user?.is_vip) {
                                      setShowVipModal(true)
                                      return
                                    }
                                    const audioUrl = `/static/voices/${voice.voice_file}`
                                    handlePlayAudio(voice.id.toString(), audioUrl)
                                  }}
                                  size="lg"
                                  disabled={voice.is_premium && !user?.is_vip}
                                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full p-0 shadow-lg flex-shrink-0 transition-all duration-200 ${
                                    voice.is_premium && !user?.is_vip
                                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                                      : "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105"
                                  } text-white`}
                                >
                                  <Play className="w-5 h-5 md:w-6 md:h-6" />
                                </Button>

                                {/* Smaller Select Button */}
                                <Button
                                  onClick={() => {
                                    // Check VIP restriction for premium voices
                                    if (voice.is_premium && !user?.is_vip) {
                                      setShowVipModal(true)
                                      return
                                    }
                                    setSelectedVoice(voice.voice_code)
                                  }}
                                  variant={selectedVoice === voice.voice_code ? "default" : "outline"}
                                  size="sm"
                                  disabled={voice.is_premium && !user?.is_vip}
                                  className={`flex-1 text-xs md:text-sm px-3 py-2 h-10 ${
                                    voice.is_premium && !user?.is_vip
                                      ? "opacity-50 cursor-not-allowed"
                                      : selectedVoice === voice.voice_code
                                        ? `${themeClasses.button} text-white`
                                        : `border-gray-300 dark:border-gray-600 ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800`
                                  }`}
                                >
                                  {voice.is_premium && !user?.is_vip
                                    ? (voiceLanguage === "zh" ? "需要VIP" : "VIP Required")
                                    : selectedVoice === voice.voice_code
                                      ? t("voiceSelection.selected")
                                      : t("voiceSelection.select")
                                  }
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
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>
                  {t("voiceSelection.myCustomVoices")}
                </h3>
                <span className={`text-sm px-3 py-1 rounded-full ${themeClasses.secondaryText} bg-gray-100 dark:bg-gray-800`}>
                  {voiceBalance.used} / {voiceBalance.limit} {t("voiceSelection.voicesUsed")}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {customVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className={`border-2 cursor-pointer ${themeClasses.card} ${themeClasses.cardHover} ${
                      selectedVoice === `custom_${voice.id}`
                        ? themeClasses.selectedCard
                        : `border-transparent ${themeClasses.hoverCard}`
                    }`}
                    onClick={() => {
                      if (selectedVoice === `custom_${voice.id}`) {
                        setSelectedVoice("")
                      } else {
                        setSelectedVoice(`custom_${voice.id}`)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${themeClasses.text} mb-1`}>
                            {`"${voice.display_name}"${t("myVoices.voiceName")}`}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={themeClasses.secondaryText}>
                              {voice.language === "zh" ? "中文" : "English"}
                            </span>
                            <span className={themeClasses.secondaryText}>
                              {t("myVoices.duration")}: {voice.duration || "0:00"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <VoiceAudioPlayer
                            voiceId={`custom_${voice.id}`}
                            audioUrl={voice.audio_url}
                            isPlaying={playingVoice === `custom_${voice.id}`}
                            onPlay={handlePlayAudio}
                            showProgressBar={playingVoice === `custom_${voice.id}`}
                            audioProgress={audioProgress}
                            audioDuration={audioDuration}
                          />
                          <Button
                            variant={selectedVoice === `custom_${voice.id}` ? "default" : "outline"}
                            size="sm"
                            className={selectedVoice === `custom_${voice.id}` ?
                              `${themeClasses.button} text-white border-0` :
                              `border-gray-300 dark:border-gray-600 ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800`
                            }
                          >
                            {selectedVoice === `custom_${voice.id}` ? t("voiceSelection.selected") : t("voiceSelection.select")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Custom Voice Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Add New Voice Button - Show if under limit */}
                {voiceBalance.used < voiceBalance.limit && (
                  <Card
                    className={`${themeClasses.card} ${themeClasses.cardHover} border-2 border-dashed border-green-400 hover:border-green-500 cursor-pointer`}
                    onClick={() => router.push(`/custom-voice-record?returnTo=voice-selection&${searchParams.toString()}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${themeClasses.text}`}>
                            {t("voiceSelection.recordNewVoice")}
                          </h4>
                          <p className={`text-sm ${themeClasses.secondaryText}`}>
                            {t("voiceSelection.addNewVoice")}
                          </p>
                        </div>
                        <ArrowRight className={`w-5 h-5 ${themeClasses.secondaryText}`} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manage All Voices Button */}
                <Card
                  className={`${themeClasses.card} ${themeClasses.cardHover} border-2 border-dashed border-purple-400 hover:border-purple-500 cursor-pointer`}
                  onClick={() => router.push('/my-voices?returnTo=voice-selection')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${themeClasses.text}`}>
                          {t("voiceSelection.manageAllVoices")}
                        </h4>
                        <p className={`text-sm ${themeClasses.secondaryText}`}>
                          {t("voiceSelection.manageVoicesDesc")}
                        </p>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${themeClasses.secondaryText}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Custom Voice Recording Option - Show only if VIP but no custom voices */}
          {user?.is_vip && customVoices.length === 0 && (
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>
                  {t("voiceSelection.customVoices")}
                </h3>
                <p className={`text-sm ${themeClasses.secondaryText}`}>
                  {t("voiceSelection.customVoicesDesc")}
                </p>
              </div>

              <Card
                className={`${themeClasses.card} ${themeClasses.cardHover} border-2 border-dashed border-green-400 transition-all duration-300 hover:border-green-500 cursor-pointer`}
                onClick={() => router.push(`/custom-voice-record?returnTo=voice-selection&${searchParams.toString()}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className={`${themeClasses.text} font-semibold text-lg mb-2`}>
                        {t("voiceSelection.recordFirstVoice")}
                      </h4>
                      <p className={`${themeClasses.secondaryText} text-sm mb-3`}>
                        {t("voiceSelection.buildVoiceLibrary")}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Badge className="bg-yellow-500 text-black">VIP</Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {t("voiceSelection.clickToRecord")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Non-VIP User - Show upgrade prompt */}
          {!user?.is_vip && (
            <div className="mt-8 max-w-4xl mx-auto">
              <Card
                className={`${themeClasses.card} ${themeClasses.cardHover} border-2 border-dashed border-gray-400 transition-all duration-300 hover:border-gray-500 cursor-pointer`}
                onClick={() => {
                  if (!user) {
                    router.push('/auth')
                  } else {
                    setShowVipModal(true)
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
            </div>
          )}

          {/* Audio Element */}
          <audio ref={audioRef} onEnded={() => setPlayingVoice(null)} onError={() => setPlayingVoice(null)} />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          onBack={handleBack}
          onNext={handleNext}
          nextDisabled={!selectedVoice}
          backLabel={t("common.back")}
          nextLabel={t("voiceSelection.generateScript")}
        />
      </AppLayout>

      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        feature="custom-voice"
        onUpgrade={() => router.push('/vip')}
      />
    </div>
  )
}
