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

export default function MyVoicesPage() {
  const [voicesData, setVoicesData] = useState<VoicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [deletingVoice, setDeletingVoice] = useState<string | null>(null)
  const [vipStatus, setVipStatus] = useState<any>(null)

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
    fetchVipStatus()

    return () => {
      if (audioElement) {
        audioElement.pause()
      }
    }
  }, [user, router])

  const fetchVipStatus = async () => {
    if (!user) return

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.videoJobs.vipStatus()
      )

      if (response.ok) {
        const data = await response.json()
        setVipStatus(data)
      }
    } catch (error) {
      console.error("Error fetching VIP status:", error)
    }
  }

  const fetchVoices = async () => {
    try {
      setLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.custom()
      )
      
      if (response.ok) {
        const voices: CustomVoice[] = await response.json()
        // Transform API response to expected format
        const data: VoicesData = {
          voices: voices || [],
          total: voices?.length || 0,
          limits: {
            custom_voices: vipStatus?.is_svip ? 10 : vipStatus?.is_vip ? 3 : 1, // Free: 1, VIP: 3, SVIP: 10
            current_plan: vipStatus?.is_svip ? "SVIP" : vipStatus?.is_vip ? "VIP" : "Free"
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
          custom_voices: vipStatus?.is_svip ? 10 : vipStatus?.is_vip ? 2 : 0, // Free: 0, VIP: 2, SVIP: 10
          current_plan: vipStatus?.is_svip ? "SVIP" : vipStatus?.is_vip ? "VIP" : "Free"
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteVoice = async (voiceId: string) => {
    try {
      // Stop any playing audio when delete button is clicked
      if (audioElement) {
        audioElement.pause()
        setPlayingVoice(null)
        setAudioElement(null)
      }

      setDeletingVoice(voiceId)

      // Extract numeric ID from "custom_X" format or use as-is if already numeric
      let numericId: number
      if (typeof voiceId === 'string' && voiceId.startsWith('custom_')) {
        numericId = parseInt(voiceId.replace('custom_', ''))
      } else {
        numericId = parseInt(voiceId.toString())
      }

      if (isNaN(numericId)) {
        throw new Error(`Invalid voice ID: ${voiceId}`)
      }

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.deleteCustom(numericId),
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

  const playVoice = (voiceId: string, audioUrl: string) => {
    if (playingVoice === voiceId) {
      if (audioElement) {
        audioElement.pause()
      }
      setPlayingVoice(null)
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
    
    newAudio.play()
    newAudio.onended = () => setPlayingVoice(null)
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

  const maxVoices = voicesData?.limits?.custom_voices || 1

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
                <span className={`text-sm px-3 py-1 rounded-full ${theme === "light" ? "bg-indigo-100 text-indigo-700" : "bg-indigo-900/50 text-indigo-300"} font-medium`}>
                  {voicesData?.voices?.length || 0} / {maxVoices} {t("myVoices.voicesUsed")}
                </span>
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
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"
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
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {/* Voice indicator circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          playingVoice === voice.id
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                            : "border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400"
                        }`}>
                          {playingVoice === voice.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <h3 className={`${themeClasses.text} font-semibold text-lg`}>
                            {voice.display_name}
                          </h3>
                          <p className={`${themeClasses.textSecondary} text-sm`}>
                            {t("myVoices.customVoice")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant={voice.language === "zh" ? "default" : "secondary"}>
                          {voice.language === "zh" ? "中文" : "English"}
                        </Badge>
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
                          {voice.duration || "0:00"}
                        </span>
                      </div>
                    </div>

                    {/* Playing status */}
                    {playingVoice === voice.id && (
                      <div className="mt-4 text-center">
                        <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                          {t("myVoices.playing")}
                        </p>
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