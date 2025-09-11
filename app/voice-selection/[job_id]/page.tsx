"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Play, Pause, Mic, Check, ChevronDown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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
import { Voice, VoiceConfig } from "@/types/voice"

export default function VoiceSelectionWithJobPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = params.job_id as string
  
  const [selectedVoice, setSelectedVoice] = useState("")
  const [selectedResolution, setSelectedResolution] = useState<string>("480p")
  const [selectedSpeed, setSelectedSpeed] = useState<number>(50)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [voiceLanguage, setVoiceLanguage] = useState<"zh" | "en">("zh")
  const [customVoices, setCustomVoices] = useState<Voice[]>([])
  const [customVoicesLoading, setCustomVoicesLoading] = useState(false)
  const [vipLimits, setVipLimits] = useState<any>(null)
  const [showVipModal, setShowVipModal] = useState(false)
  // Filter states
  const [languageFilter, setLanguageFilter] = useState<string | null>(null) // 'zh' | 'en' | null
  const [freeOnlyFilter, setFreeOnlyFilter] = useState(false)
  const [ttsProvider, setTtsProvider] = useState<"xfyun">("xfyun")
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { flowState, updateFlowState } = useFlow()

  // Set page title
  usePageTitle("voiceSelection")

  // Fetch custom voices for VIP users
  const fetchCustomVoices = async () => {
    if (!user?.is_vip || !user?.id) return

    try {
      setCustomVoicesLoading(true)
      // Fetch custom voices for the current user
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.custom(language, Number(user.id))
      )

      if (response.ok) {
        const data = await response.json()
        // Backend returns array directly for new voices API
        const voicesArray = Array.isArray(data) ? data : (data.voices || [])
        setCustomVoices(voicesArray)
      }
    } catch (error) {
      console.error("Error fetching custom voices:", error)
    } finally {
      setCustomVoicesLoading(false)
    }
  }

  useEffect(() => {
    // Set voice language to match UI language
    setVoiceLanguage(language as "zh" | "en")

    // Fetch custom voices if user is VIP
    if (user?.is_vip) {
      fetchCustomVoices()
    }
  }, [language, user])

  // Fetch voices from API once on mount
  useEffect(() => {
    fetchVoices()
    if (user) {
      fetchVipLimits()
    }
  }, [user])

  // Initialize selected voice, resolution, and speed from flow state
  useEffect(() => {
    if (flowState.voiceId) {
      setSelectedVoice(flowState.voiceId.toString())
    }
    if (flowState.resolution) {
      setSelectedResolution(flowState.resolution)
    }
    if (flowState.speed !== undefined) {
      setSelectedSpeed(flowState.speed)
    }
  }, [flowState.voiceId, flowState.resolution, flowState.speed])

  // Handle new voice selection from custom voice recording
  useEffect(() => {
    const newVoiceId = searchParams.get('newVoiceId')
    if (newVoiceId && voices.length > 0) {
      setSelectedVoice(newVoiceId)
      // Clear the parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('newVoiceId')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [voices, searchParams])

  const fetchVoices = async () => {
    try {
      setLoading(true)
      // Fetch system voices (default voices where user_id is NULL)
      const response = await fetch(apiConfig.voices.system(language))

      if (response.ok) {
        const data = await response.json()
        // Backend returns array directly, not wrapped in {voices: [...]}
        const voicesArray = Array.isArray(data) ? data : (data.voices || [])
        setVoices(voicesArray)
      } else {
        console.error("Failed to fetch system voices, status:", response.status)
      }
    } catch (error) {
      console.error("Error fetching system voices:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVipLimits = async () => {
    if (!user) return

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.getBaseUrl()}/auth/user/limits`
      )

      if (response.ok) {
        const data = await response.json()
        setVipLimits(data)
      }
    } catch (error) {
      console.error("Error fetching VIP limits:", error)
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

  // Filter voices based on current filters
  const getFilteredVoices = () => {
    let filtered = [...voices]

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
      localStorage.setItem('redirectAfterAuth', `/voice-selection/${jobId}`)
      router.push('/auth')
      return
    }

    if (!selectedVoice) {
      alert(language === "zh" ? "请选择一个语音后继续" : "Please select a voice to continue")
      return
    }

    // Check resolution restrictions for non-VIP users
    const resolutionValue = parseInt(selectedResolution.replace('p', ''))
    if (!user.is_vip && resolutionValue > 480) {
      alert(language === "zh" ? "免费用户只能选择480p分辨率，升级VIP可选择更高分辨率" : "Free users can only select 480p resolution. Upgrade to VIP for higher resolutions")
      setSelectedResolution("480p")
      return
    }

    // Update flow state with voice selection and job ID
    const selectedVoiceId = parseInt(selectedVoice)
    const selectedVoiceData = voices.find(v => v.id === selectedVoiceId) || customVoices.find(cv => cv.id === selectedVoiceId)
    const isCustomVoice = customVoices.some(cv => cv.id === selectedVoiceId)
    const voiceConfig = {
      voiceId: selectedVoiceId,
      vcn: isCustomVoice ? undefined : selectedVoiceData?.vcn,
      voiceName: selectedVoiceData?.display_name || "Unknown Voice",
      voiceLanguage: voiceLanguage,
      ttsProvider: "xfyun",
      analysisJobId: parseInt(jobId),
      resolution: selectedResolution,
      speed: selectedSpeed
    }

    console.log("Voice selection - Selected voice code:", selectedVoice)
    console.log("Voice selection - Voice config:", voiceConfig)

    updateFlowState(voiceConfig)

    router.push(`/script-review/${jobId}`)
  }

  // Back navigation removed - users cannot go back to modify TTS text after voice selection

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "theme-text-primary",
        secondaryText: "theme-text-secondary",
        card: "theme-bg-elevated border-gray-200/50",
        cardHover: "hover:shadow-lg transition-all duration-300",
        selectedCard: "theme-gradient-brand text-white border-indigo-500 shadow-xl",
        hoverCard: "hover:shadow-lg hover:border-gray-300",
        button: "theme-button-primary",
        filterButton: "theme-button-secondary",
        activeFilterButton: "theme-button-primary",
        accent: "theme-brand-primary",
        unselectedIndicator: "border-2 border-dashed border-gray-300"
      }
    }
    /* dark-theme refactor */
    return {
      background: "theme-gradient-hero",
      text: "theme-text-primary",
      secondaryText: "theme-text-secondary",
      card: "theme-surface-elevated border-white/20",
      cardHover: "hover:shadow-xl transition-all duration-300",
      selectedCard: "theme-gradient-brand text-white border-indigo-400 shadow-xl",
      hoverCard: "hover:shadow-xl hover:border-white/40",
      button: "theme-button-primary",
      filterButton: "theme-button-secondary",
      activeFilterButton: "theme-button-primary",
      accent: "theme-brand-primary",
      unselectedIndicator: "border-2 border-dashed border-white/30"
    }
  }

  const themeClasses = getThemeClasses()

  if (loading) {
    return (
      <AppLayout title={t("voiceSelection.title")}>
        <div className={`min-h-screen ${themeClasses.background}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className={themeClasses.text}>
                {language === "zh" ? "加载语音选项..." : "Loading voice options..."}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <AppLayout title={t("voiceSelection.title")}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl md:text-4xl font-bold ${themeClasses.text} mb-4`}>
              {t("voiceSelection.title")}
            </h2>
            <p className={`text-lg ${themeClasses.secondaryText} mb-6`}>
              {t("voiceSelection.subtitle")}
            </p>
          </div>

          {/* Resolution Selection Link */}
          <div className="mb-4 text-center">
            <Button
              onClick={() => router.push(`/resolution-selection?jobId=${jobId}&returnTo=/voice-selection/${jobId}`)}
              variant="outline"
              className={`${themeClasses.filterButton} px-6 py-3`}
            >
              {language === "zh" ? `当前分辨率: ${selectedResolution} - 点击更改` : `Current Resolution: ${selectedResolution} - Click to Change`}
            </Button>
          </div>

          {/* Speed Selection */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600">
              <label className={`text-sm font-medium ${themeClasses.text}`}>
                {language === "zh" ? "语音速度:" : "Voice Speed:"}
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs ${theme === "light" ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"}`}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    {(() => {
                      if (selectedSpeed <= 20) return language === "zh" ? "很慢" : "Very Slow";
                      if (selectedSpeed <= 30) return language === "zh" ? "慢" : "Slow";
                      if (selectedSpeed <= 40) return language === "zh" ? "较慢" : "Slower";
                      if (selectedSpeed <= 50) return language === "zh" ? "正常" : "Normal";
                      if (selectedSpeed <= 60) return language === "zh" ? "较快" : "Faster";
                      if (selectedSpeed <= 70) return language === "zh" ? "快" : "Fast";
                      return language === "zh" ? "很快" : "Very Fast";
                    })()} ({selectedSpeed})
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {[20, 30, 40, 50, 60, 70, 80].map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => setSelectedSpeed(speed)}
                      className={selectedSpeed === speed ? "bg-blue-100 dark:bg-blue-900" : ""}
                    >
                      {(() => {
                        if (speed <= 20) return language === "zh" ? "很慢" : "Very Slow";
                        if (speed <= 30) return language === "zh" ? "慢" : "Slow";
                        if (speed <= 40) return language === "zh" ? "较慢" : "Slower";
                        if (speed <= 50) return language === "zh" ? "正常" : "Normal";
                        if (speed <= 60) return language === "zh" ? "较快" : "Faster";
                        if (speed <= 70) return language === "zh" ? "快" : "Fast";
                        return language === "zh" ? "很快" : "Very Fast";
                      })()} ({speed})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <Button
              onClick={() => {
                if (languageFilter === "zh") {
                  setLanguageFilter(null)
                } else {
                  setLanguageFilter("zh")
                  setFreeOnlyFilter(false) // Clear other filters
                }
              }}
              variant="outline"
              className={`${languageFilter === "zh" ? themeClasses.activeFilterButton : themeClasses.filterButton}`}
            >
              {language === "zh" ? "中文语音" : "Chinese Voices"}
            </Button>
            <Button
              onClick={() => {
                if (languageFilter === "en") {
                  setLanguageFilter(null)
                } else {
                  setLanguageFilter("en")
                  setFreeOnlyFilter(false) // Clear other filters
                }
              }}
              variant="outline"
              className={`${languageFilter === "en" ? themeClasses.activeFilterButton : themeClasses.filterButton}`}
            >
              {language === "zh" ? "英文语音" : "English Voices"}
            </Button>
            <Button
              onClick={() => {
                if (freeOnlyFilter) {
                  setFreeOnlyFilter(false)
                } else {
                  setFreeOnlyFilter(true)
                  setLanguageFilter(null) // Clear other filters
                }
              }}
              variant="outline"
              className={`${freeOnlyFilter ? themeClasses.activeFilterButton : themeClasses.filterButton}`}
            >
              {language === "zh" ? "免费语音" : "Free Voices"}
            </Button>
          </div>

          {/* Voice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {getFilteredVoices().map((voice) => (
              <Card
                key={voice.id}
                className={`${themeClasses.card} ${themeClasses.cardHover} ${
                  selectedVoice === voice.id ? themeClasses.selectedCard : themeClasses.hoverCard
                } cursor-pointer transition-all duration-300`}
                onClick={() => {
                  if (voice.is_premium && !user?.is_vip) {
                    setShowVipModal(true)
                    return
                  }
                  setSelectedVoice(voice.id.toString())
                  // Auto-play voice sample when selected
                  if (voice.voice_file) {
                    const audioUrl = `/static/voices/${voice.voice_file}`
                    handlePlayAudio(voice.id.toString(), audioUrl)
                  }
                }}
              >
                <CardContent className="p-6">
                  {/* Selection Indicator */}
                  {selectedVoice === voice.id.toString() ? (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>
                  ) : (
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full ${themeClasses.unselectedIndicator}`} />
                  )}

                  {/* Voice Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className={`${selectedVoice === voice.id.toString() ? 'text-white' : themeClasses.text} font-semibold text-lg mb-2`}>
                        {voice.display_name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${selectedVoice === voice.id ? 'text-white border-white/50' : `${themeClasses.text} border-gray-300 dark:border-gray-600`}`}
                        >
                          {voice.language === "zh" ? "中文" : "English"}
                        </Badge>
                        {voice.gender && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${selectedVoice === voice.id ? 'text-white border-white/50' : `${themeClasses.text} border-gray-300 dark:border-gray-600`}`}
                          >
                            {voice.gender === "male" ? (language === "zh" ? "男声" : "Male") : (language === "zh" ? "女声" : "Female")}
                          </Badge>
                        )}
                        <Badge
                          className={`text-xs ${voice.is_premium ? "bg-yellow-500 text-black" : "bg-green-500 text-white"}`}
                        >
                          {voice.is_premium ? (language === "zh" ? "VIP" : "VIP") : (language === "zh" ? "免费" : "Free")}
                        </Badge>
                      </div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center">
                      {voice.is_premium && !user?.is_vip ? (
                        <span className={`text-sm ${selectedVoice === voice.id ? 'text-white/80' : themeClasses.secondaryText}`}>
                          {language === "zh" ? "需要VIP会员" : "VIP Required"}
                        </span>
                      ) : selectedVoice === voice.id ? (
                        <span className="text-white/90 text-sm font-medium">
                          {playingVoice === voice.id
                            ? (language === "zh" ? "正在播放..." : "Playing...")
                            : (language === "zh" ? "已选择" : "Selected")
                          }
                        </span>
                      ) : (
                        <span className={`text-sm ${themeClasses.secondaryText}`}>
                          {language === "zh" ? "点击选择并试听" : "Click to select and preview"}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Voice Section for VIP Users */}
          {user?.is_vip && (
            <div className="mb-8">
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                  {language === "zh" ? "自定义语音" : "Custom Voices"}
                </h3>
                <p className={`${themeClasses.secondaryText} mb-4`}>
                  {language === "zh" ? "使用您自己录制的语音" : "Use your own recorded voice"}
                </p>

                {/* VIP Limits Display */}
                {vipLimits && (
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg ${themeClasses.card} mb-4`}>
                    <span className={`text-sm ${themeClasses.secondaryText} mr-2`}>
                      {language === "zh" ? "自定义语音:" : "Custom Voices:"}
                    </span>
                    <span className={`text-sm font-semibold ${themeClasses.text}`}>
                      {customVoices.length} / {vipLimits.plan === 'SVIP' ? 10 : (vipLimits.plan === 'VIP' ? 2 : 0)}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => {
                      if (vipLimits && customVoices.length >= (vipLimits.plan === 'SVIP' ? 10 : 2)) {
                        setShowVipModal(true)
                      } else {
                        // Store current state in localStorage for return and auto-selection
                        localStorage.setItem('voiceSelectionState', JSON.stringify({
                          jobId,
                          selectedVoice,
                          selectedResolution,
                          selectedSpeed
                        }))
                        router.push(`/custom-voice-record?returnTo=/voice-selection/${jobId}`)
                      }
                    }}
                    variant="default"
                    className={`${themeClasses.button}`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {language === "zh" ? "录制新语音" : "Record New Voice"}
                  </Button>

                  {/* Removed "Manage Voices" button - management happens in dedicated my-voices page */}
                </div>
              </div>

              {/* Custom Voice Grid */}
              {customVoices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {customVoices.map((voice) => (
                    <Card
                      key={voice.id}
                      className={`${themeClasses.card} ${themeClasses.cardHover} ${
                        selectedVoice === voice.id ? themeClasses.selectedCard : themeClasses.hoverCard
                      } cursor-pointer transition-all duration-300`}
                      onClick={() => {
                        setSelectedVoice(voice.id)
                        // Auto-play custom voice sample when selected
                        if (voice.voice_file) {
                          const audioUrl = voice.voice_type === "custom"
                            ? `/static/new_voices/uid${user?.id}/${voice.voice_file}`
                            : `/static/voices/${voice.voice_file}`
                          handlePlayAudio(voice.id, audioUrl)
                        }
                      }}
                    >
                      <CardContent className="p-6">
                        {/* Selection Indicator */}
                        {selectedVoice === voice.id ? (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-indigo-600" />
                            </div>
                          </div>
                        ) : (
                          <div className={`absolute top-4 right-4 w-6 h-6 rounded-full ${themeClasses.unselectedIndicator}`} />
                        )}

                        {/* Voice Info */}
                        <div className="space-y-4">
                          <div>
                            <h3 className={`${selectedVoice === voice.id ? 'text-white' : themeClasses.text} font-semibold text-lg mb-2`}>
                              {voice.display_name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${selectedVoice === voice.id ? 'text-white border-white/50' : `${themeClasses.text} border-gray-300 dark:border-gray-600`}`}
                              >
                                {voice.language === "zh" ? "中文" : "English"}
                              </Badge>
                              <Badge className="text-xs bg-purple-500 text-white">
                                {language === "zh" ? "自定义" : "Custom"}
                              </Badge>
                              {voice.duration && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${selectedVoice === voice.id ? 'text-white border-white/50' : `${themeClasses.text} border-gray-300 dark:border-gray-600`}`}
                                >
                                  {voice.duration}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Status Text */}
                          <div className="text-center">
                            {selectedVoice === voice.id ? (
                              <span className="text-white/90 text-sm font-medium">
                                {playingVoice === voice.id
                                  ? (language === "zh" ? "正在播放..." : "Playing...")
                                  : (language === "zh" ? "已选择" : "Selected")
                                }
                              </span>
                            ) : (
                              <span className={`text-sm ${themeClasses.secondaryText}`}>
                                {language === "zh" ? "点击选择并试听" : "Click to select and preview"}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}


            </div>
          )}

          {/* Audio Element */}
          <audio ref={audioRef} onEnded={() => setPlayingVoice(null)} onError={() => setPlayingVoice(null)} />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          onNext={handleNext}
          nextDisabled={!selectedVoice}
          nextLabel={t("voiceSelection.generateScript")}
        />
      </AppLayout>

      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        feature="custom-voice"
        onUpgrade={() => router.push('/vip')}
        currentUserTier={
          !user ? 'free' :
          user.is_svip ? 'svip' :
          user.is_vip ? 'vip' :
          'free'
        }
      />
    </div>
  )
}
