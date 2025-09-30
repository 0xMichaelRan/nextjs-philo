"use client"

import { useState, useEffect } from "react"
import { Mic, Plus, Trash2, Play, Pause, Calendar, HardDrive, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { usePageTitle } from "@/hooks/use-page-title"
import { useToast } from "@/hooks/use-toast"
import { apiConfig } from "@/lib/api-config"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Voice } from "@/types/voice"

interface VoicesData {
  voices: Voice[]
  total: number
  limits: {
    custom_voices: number
    current_plan: string
  }
}

interface UserLimits {
  plan: string
  is_vip: boolean
  is_svip: boolean
  limits: {
    max_custom_voices: number
  }
  custom_voices: {
    used: number
    limit: number
    remaining: number
  }
}

export default function MyVoicesPage() {
  const [voicesData, setVoicesData] = useState<VoicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingVoice, setPlayingVoice] = useState<number | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [deletingVoice, setDeletingVoice] = useState<number | null>(null)
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Removed returnTo and showSelectButton logic - selection only happens in voice-selection page
  
  usePageTitle("myVoices")

  useEffect(() => {
    if (!user) {
      router.push("/auth?redirect=my-voices")
      return
    }
    
    if (!user.is_vip) {
      router.push("/payment")
      return
    }
    
    fetchVoices()
    fetchUserLimits()

    return () => {
      if (audioElement) {
        audioElement.pause()
        setPlayingVoice(null)
        setCurrentTime(0)
        setDuration(0)
      }
    }
  }, [user, router])

  const fetchUserLimits = async () => {
    if (!user) return

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.auth.userLimits()
      )

      if (response.ok) {
        const data = await response.json()
        setUserLimits(data)
      }
    } catch (error) {
      console.error("Error fetching user limits:", error)
    }
  }

  const fetchVoices = async () => {
    try {
      setLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.custom()
      )

      if (response.ok) {
        const voices: Voice[] = await response.json()
        // Transform API response to expected format
        const data: VoicesData = {
          voices: voices || [],
          total: voices?.length || 0,
          limits: {
            custom_voices: userLimits?.limits?.max_custom_voices || 1,
            current_plan: userLimits?.plan || "Free"
          }
        }
        setVoicesData(data)
      } else {
        throw new Error("Failed to fetch voices")
      }
    } catch (error) {
      console.error("Error fetching voices:", error)
      toast({
        title: t("common.error"),
        description: t("myVoices.fetchError"),
        variant: "destructive",
      })
      // Set empty data on error to prevent map errors
      setVoicesData({
        voices: [],
        total: 0,
        limits: {
          custom_voices: userLimits?.limits?.max_custom_voices || 1,
          current_plan: userLimits?.plan || "Free"
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteVoice = async (voiceId: number) => {
    try {
      // Stop any playing audio when delete button is clicked
      if (audioElement) {
        audioElement.pause()
        setPlayingVoice(null)
        setAudioElement(null)
        setCurrentTime(0)
        setDuration(0)
      }

      setDeletingVoice(voiceId)

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.deleteCustom(voiceId),
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        toast({
          title: t("myVoices.deleteSuccess"),
          description: t("myVoices.voiceDeleted"),
          variant: "success",
        })
        fetchVoices()
      } else {
        throw new Error("Failed to delete voice")
      }
    } catch (error) {
      console.error("Error deleting voice:", error)
      toast({
        title: t("common.error"),
        description: t("myVoices.deleteError"),
        variant: "destructive",
      })
    } finally {
      setDeletingVoice(null)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playVoice = (voiceId: number, audioUrl: string) => {
    if (playingVoice === voiceId) {
      if (audioElement) {
        audioElement.pause()
      }
      setPlayingVoice(null)
      setCurrentTime(0)
      setDuration(0)
      return
    }

    if (audioElement) {
      audioElement.pause()
    }

    // Check if audioUrl is valid
    if (!audioUrl) {
      console.error('Audio URL is undefined or empty')
      return
    }

    // Ensure the audio URL is absolute
    const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${apiConfig.getBaseUrl()}${audioUrl}`
    const newAudio = new Audio(fullAudioUrl)
    setAudioElement(newAudio)
    setPlayingVoice(voiceId)

    // Set up audio event listeners
    newAudio.addEventListener('loadedmetadata', () => {
      setDuration(newAudio.duration)
    })

    newAudio.addEventListener('timeupdate', () => {
      setCurrentTime(newAudio.currentTime)
    })

    newAudio.addEventListener('ended', () => {
      setPlayingVoice(null)
      setCurrentTime(0)
      setDuration(0)
    })

    newAudio.play()
  }

  // Removed selectVoice function - selection only happens in voice-selection page

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50",
        card: "bg-white/80 border-purple-200",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
      }
    }
    return {
      background: "bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900",
      card: "bg-white/10 border-purple-500/30",
      text: "text-white",
      textSecondary: "text-gray-300",
    }
  }

  const themeClasses = getThemeClasses()

  if (!user || !user.is_vip) {
    return null
  }

  const canAddMore = voicesData && voicesData.voices ?
    voicesData.voices.length < voicesData.limits.custom_voices :
    false

  const maxVoices = userLimits?.limits?.max_custom_voices || 1

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("myVoices.title")}>
        <div className="container mx-auto px-6 py-8">
          {/* Removed back button - no longer needed since selection only happens in voice-selection page */}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                {t("myVoices.title")}
              </h1>
              <div className="flex items-center space-x-4">
                <p className={themeClasses.textSecondary}>
                  {t("myVoices.subtitle")}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm px-3 py-1 rounded-full ${theme === "light" ? "bg-indigo-100 text-indigo-700" : "bg-indigo-900/50 text-indigo-300"} font-medium`}>
                    {voicesData?.voices?.length || 0} / {maxVoices} {t("myVoices.voicesUsed")}
                  </span>
                  {/* Limited-time free offering tag for free users */}
                  {userLimits?.plan === "Free" && userLimits?.limits?.max_custom_voices > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${theme === "light" ? "bg-green-100 text-green-700 border border-green-200" : "bg-green-900/50 text-green-300 border border-green-700"}`}>
                      {language === "zh" ? "限免" : "Limited Time"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className={`${themeClasses.textSecondary} mt-4`}>
                {t("common.loading")}
              </p>
            </div>
          ) : voicesData?.voices?.length === 0 ? (
            <Card className={themeClasses.card}>
              <CardContent className="text-center py-12">
                <Mic className={`w-16 h-16 ${themeClasses.textSecondary} mx-auto mb-4`} />
                <h3 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>
                  {t("myVoices.noVoices")}
                </h3>
                <p className={`${themeClasses.textSecondary} mb-6`}>
                  {t("myVoices.noVoicesDesc")}
                </p>
                {/* <Link href="/custom-voice-record?returnTo=my-voices">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("myVoices.createFirstVoice")}
                  </Button>
                </Link> */}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {voicesData?.voices.map((voice) => (
                <Card
                  key={voice.id}
                  className={`${themeClasses.card} transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl border-2 ${
                    playingVoice === voice.id
                      ? theme === 'light'
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50"
                        : "border-purple-400 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 shadow-lg shadow-purple-500/20"
                      : "border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                  }`}
                  onClick={() => {
                    if (voice.voice_file) {
                      // voice_file already contains the full path with user ID prefix (e.g., "uid11/filename.wav")
                      const audioUrl = `/static/new_voices/${voice.voice_file}`
                      playVoice(voice.id, audioUrl)
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Voice indicator circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          playingVoice === voice.id
                            ? theme === 'light'
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                              : "bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-lg shadow-purple-500/30"
                            : theme === 'light'
                              ? "border-2 border-dashed border-gray-300 text-gray-400 hover:border-purple-300 hover:text-purple-500"
                              : "border-2 border-dashed border-gray-600 text-gray-400 hover:border-purple-400 hover:text-purple-400"
                        }`}>
                          {playingVoice === voice.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className={`${themeClasses.text} font-semibold text-lg truncate`}>
                            {voice.display_name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteVoice(voice.id)
                          }}
                          disabled={deletingVoice === voice.id}
                          className="opacity-70 hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Voice details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={themeClasses.textSecondary}>
                          {new Date(voice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span className={themeClasses.textSecondary}>
                          {playingVoice === voice.id && duration > 0
                            ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                            : voice.duration || "0:00"
                          }
                        </span>
                      </div>
                    </div>

                    {/* Playing status */}
                    {playingVoice === voice.id && (
                      <div className="mt-4 text-center">
                        <p className={`text-sm font-medium ${
                          theme === 'light'
                            ? 'text-purple-600'
                            : 'text-purple-300'
                        }`}>
                          {t("myVoices.playing")}
                        </p>
                        {duration > 0 && (
                          <div className="mt-2">
                            <div className={`w-full rounded-full h-1.5 ${
                              theme === 'light'
                                ? 'bg-gray-200'
                                : 'bg-gray-700/50'
                            }`}>
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  theme === 'light'
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                    : 'bg-gradient-to-r from-purple-400 to-indigo-400 shadow-sm'
                                }`}
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {canAddMore && voicesData && (
            <div className="text-center mt-8">
              <Link href="/custom-voice-record?returnTo=my-voices">
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("myVoices.addVoice")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  )
}