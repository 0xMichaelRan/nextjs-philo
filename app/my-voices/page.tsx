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

interface CustomVoice {
  id: string  // Changed from number to string since backend returns "custom_X" format
  name: string
  display_name: string
  language: string
  created_at: string
  file_size_mb: number
  audio_url: string
  duration?: string
}

interface VoicesData {
  voices: CustomVoice[]
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
            custom_voices: vipStatus?.is_svip ? 10 : 2, // VIP: 2, SVIP: 10
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
          custom_voices: vipStatus?.is_svip ? 10 : 2,
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
                <span className={`text-sm px-2 py-1 rounded-full ${themeClasses.textSecondary} bg-gray-100 dark:bg-gray-800`}>
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
                <Card key={voice.id} className={themeClasses.card}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`${themeClasses.text} text-lg`}>
                        {`"${voice.display_name}" ${t("myVoices.voiceName")}`}
                      </CardTitle>
                      <Badge variant={voice.language === "zh" ? "default" : "secondary"}>
                        {voice.language === "zh" ? "中文" : "English"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className={`${themeClasses.textSecondary} flex items-center`}>
                          <Calendar className="w-4 h-4 mr-1" />
                          {t("myVoices.created")}
                        </span>
                        <span className={themeClasses.text}>
                          {new Date(voice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`${themeClasses.textSecondary} flex items-center`}>
                          <HardDrive className="w-4 h-4 mr-1" />
                          {t("myVoices.duration")}
                        </span>
                        <span className={themeClasses.text}>
                          {voice.duration || "0:00"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playVoice(voice.id, voice.audio_url)}
                          className="flex-1"
                        >
                          {playingVoice === voice.id ? (
                            <Pause className="w-4 h-4 mr-1" />
                          ) : (
                            <Play className="w-4 h-4 mr-1" />
                          )}
                          {playingVoice === voice.id ? t("myVoices.pause") : t("myVoices.play")}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteVoice(voice.id)}
                          disabled={deletingVoice === voice.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Removed select button - selection only happens in voice-selection page */}
                    </div>
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