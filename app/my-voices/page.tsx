"use client"

import { useState, useEffect } from "react"
import { Mic, Plus, Trash2, Play, Pause, Volume2, Calendar, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { usePageTitle } from "@/hooks/use-page-title"
import { useToast } from "@/hooks/use-toast"
import { apiConfig } from "@/lib/api-config"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CustomVoice {
  id: number
  name: string
  display_name: string
  language: string
  created_at: string
  file_size_mb: number
  audio_url: string
}

interface VoicesData {
  voices: CustomVoice[]
  total: number
  limits: {
    vip_limit: number
    svip_limit: number
    current_plan: string
  }
}

export default function MyVoicesPage() {
  const [voicesData, setVoicesData] = useState<VoicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingVoice, setPlayingVoice] = useState<number | null>(null)
  const [deletingVoice, setDeletingVoice] = useState<number | null>(null)
  
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  // Set page title
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
  }, [user, router])

  const fetchVoices = async () => {
    try {
      setLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.voices.custom()
      )
      
      if (response.ok) {
        const data: VoicesData = await response.json()
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
    } finally {
      setLoading(false)
    }
  }

  const deleteVoice = async (voiceId: number) => {
    try {
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
        fetchVoices() // Refresh the list
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

  const playVoice = (voiceId: number, audioUrl: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null)
      // Stop audio if playing
    } else {
      setPlayingVoice(voiceId)
      // Play audio
      const audio = new Audio(audioUrl)
      audio.play()
      audio.onended = () => setPlayingVoice(null)
    }
  }

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
    return null // Will redirect in useEffect
  }

  const canAddMore = voicesData ? 
    voicesData.voices.length < (voicesData.limits.current_plan === "svip" ? voicesData.limits.svip_limit : voicesData.limits.vip_limit) : 
    false

  const maxVoices = voicesData?.limits.current_plan === "svip" ? voicesData.limits.svip_limit : voicesData?.limits.vip_limit || 1

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("myVoices.title")}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                {t("myVoices.title")}
              </h1>
              <p className={themeClasses.textSecondary}>
                {t("myVoices.subtitle")}
              </p>
            </div>
            
            {canAddMore && (
              <Link href="/custom-voice-record">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("myVoices.addNew")}
                </Button>
              </Link>
            )}
          </div>

          {/* Usage Stats */}
          <Card className={`${themeClasses.card} mb-8`}>
            <CardHeader>
              <CardTitle className={`${themeClasses.text} flex items-center`}>
                <Volume2 className="w-5 h-5 mr-2" />
                {t("myVoices.usage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={themeClasses.textSecondary}>
                    {t("myVoices.voicesUsed")}
                  </span>
                  <span className={themeClasses.text}>
                    {voicesData?.voices.length || 0} / {maxVoices}
                  </span>
                </div>
                <Progress 
                  value={((voicesData?.voices.length || 0) / maxVoices) * 100} 
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={themeClasses.textSecondary}>
                    {t("myVoices.plan")}: {voicesData?.limits.current_plan.toUpperCase()}
                  </span>
                  {!canAddMore && (
                    <Link href="/payment">
                      <Button variant="outline" size="sm">
                        {t("myVoices.upgrade")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voices List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className={`${themeClasses.textSecondary} mt-4`}>
                {t("common.loading")}
              </p>
            </div>
          ) : voicesData?.voices.length === 0 ? (
            <Card className={themeClasses.card}>
              <CardContent className="text-center py-12">
                <Mic className={`w-16 h-16 ${themeClasses.textSecondary} mx-auto mb-4`} />
                <h3 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>
                  {t("myVoices.noVoices")}
                </h3>
                <p className={`${themeClasses.textSecondary} mb-6`}>
                  {t("myVoices.noVoicesDesc")}
                </p>
                <Link href="/custom-voice-record">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("myVoices.createFirst")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {voicesData?.voices.map((voice) => (
                <Card key={voice.id} className={themeClasses.card}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`${themeClasses.text} text-lg`}>
                        {voice.display_name}
                      </CardTitle>
                      <Badge variant={voice.language === "zh" ? "default" : "secondary"}>
                        {voice.language === "zh" ? "中文" : "English"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Voice Info */}
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
                          {t("myVoices.size")}
                        </span>
                        <span className={themeClasses.text}>
                          {voice.file_size_mb} MB
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  )
}
