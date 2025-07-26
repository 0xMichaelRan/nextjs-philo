"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Mic, Play, Pause, Save, Trash2, ArrowLeft, Crown, Shield, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

export default function CustomVoicePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVip, setIsVip] = useState(false) // This would come from user context
  const [recordingName, setRecordingName] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [existingVoice, setExistingVoice] = useState<any>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { theme } = useTheme()
  const { language, t } = useLanguage()

  const sampleText = {
    zh: "在这个充满可能性的世界里，每一部电影都是一扇通往不同人生的窗户。通过深入的分析和思考，我们能够发现隐藏在镜头背后的深层含义，感受导演想要传达的情感和思想。",
    en: "In this world full of possibilities, every movie is a window to different lives. Through deep analysis and reflection, we can discover the hidden meanings behind the lens and feel the emotions and thoughts the director wants to convey.",
  }

  useEffect(() => {
    // Simulate checking for existing voice recording
    const mockExistingVoice = {
      id: "user-voice-1",
      name: "我的声音",
      nameEn: "My Voice",
      createdAt: "2024-01-20",
      duration: "45秒",
      audioUrl: "/user-voice-sample.mp3",
    }
    // setExistingVoice(mockExistingVoice)
  }, [])

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    return {
      background: "bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const saveVoice = () => {
    if (audioBlob && recordingName.trim()) {
      // Here you would upload the audio blob to your backend
      console.log("Saving voice:", recordingName, audioBlob)

      // Simulate saving
      const newVoice = {
        id: "user-voice-1",
        name: recordingName,
        createdAt: new Date().toISOString().split("T")[0],
        duration: `${recordingTime}秒`,
        audioBlob: audioBlob,
      }
      setExistingVoice(newVoice)
      setAudioBlob(null)
      setRecordingName("")
      setRecordingTime(0)
    }
  }

  const deleteVoice = () => {
    setExistingVoice(null)
  }

  const handleBack = () => {
    const params = new URLSearchParams()
    searchParams.forEach((value, key) => {
      params.set(key, value)
    })
    router.push(`/voice-selection?${params.toString()}`)
  }

  const handleIHaveVip = () => {
    setIsVip(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isVip) {
    return (
      <div className={themeClasses.background}>
        <AppLayout title={t("customVoice.title")}>
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <Card className={`${themeClasses.card} text-center`}>
                <CardContent className="p-8">
                  <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                  <h2 className={`${themeClasses.text} text-2xl font-bold mb-4`}>{t("customVoice.vipRequired")}</h2>
                  <p className={`${themeClasses.secondaryText} mb-6`}>{t("customVoice.upgradePrompt")}</p>
                  <div className="flex space-x-4">
                    <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t("common.back")}
                    </Button>
                    <Button onClick={handleIHaveVip} variant="outline" className="flex-1 bg-transparent">
                      <Crown className="w-4 h-4 mr-2" />
                      {language === "zh" ? "我已有VIP" : "I already have VIP"}
                    </Button>
                    <Link href="/vip" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        <Crown className="w-4 h-4 mr-2" />
                        {t("nav.upgradeVip")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("customVoice.title")}>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Back Button */}
            <Button onClick={handleBack} variant="ghost" className={`${themeClasses.text} hover:bg-white/10`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>

            {/* Existing Voice */}
            {existingVoice && (
              <Card className={themeClasses.card}>
                <CardHeader>
                  <CardTitle className={`${themeClasses.text} flex items-center justify-between`}>
                    {language === "zh" ? existingVoice.name : existingVoice.nameEn || existingVoice.name}
                    <Badge variant="secondary">{existingVoice.duration}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`${themeClasses.secondaryText} text-sm`}>
                    {language === "zh" ? "创建时间" : "Created"}: {existingVoice.createdAt}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        if (existingVoice.audioUrl && audioRef.current) {
                          audioRef.current.src = existingVoice.audioUrl
                          audioRef.current.play()
                        }
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {t("customVoice.playRecording")}
                    </Button>
                    <Button onClick={deleteVoice} variant="destructive" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("customVoice.deleteVoice")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recording Section */}
            {!existingVoice && (
              <>
                {/* Sample Text */}
                <Card className={themeClasses.card}>
                  <CardHeader>
                    <CardTitle className={themeClasses.text}>{t("customVoice.recordingTip")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`${themeClasses.secondaryText} leading-relaxed p-4 bg-black/10 rounded-lg`}>
                      {sampleText[language]}
                    </div>
                  </CardContent>
                </Card>

                {/* Recording Controls */}
                <Card className={themeClasses.card}>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recordingName" className={themeClasses.text}>
                        {t("customVoice.recordingName")}
                      </Label>
                      <Input
                        id="recordingName"
                        value={recordingName}
                        onChange={(e) => setRecordingName(e.target.value)}
                        placeholder={t("customVoice.namePlaceholder")}
                        className={`${theme === "light" ? "bg-gray-50 border-gray-300" : "bg-white/5 border-white/20 text-white"}`}
                      />
                    </div>

                    {/* Recording Status */}
                    {isRecording && (
                      <div className="text-center space-y-2">
                        <div className={`${themeClasses.text} text-lg font-semibold`}>
                          {t("customVoice.recordingInProgress")}
                        </div>
                        <div className={`${themeClasses.secondaryText} text-2xl font-mono`}>
                          {formatTime(recordingTime)}
                        </div>
                        <Progress value={(recordingTime / 60) * 100} className="h-2" />
                      </div>
                    )}

                    {/* Recording Button */}
                    <div className="text-center">
                      {!isRecording ? (
                        <Button
                          onClick={startRecording}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={!recordingName.trim()}
                        >
                          <Mic className="w-5 h-5 mr-2" />
                          {t("customVoice.startRecording")}
                        </Button>
                      ) : (
                        <Button onClick={stopRecording} size="lg" className="bg-gray-600 hover:bg-gray-700 text-white">
                          <Pause className="w-5 h-5 mr-2" />
                          {t("customVoice.stopRecording")}
                        </Button>
                      )}
                    </div>

                    {/* Playback Controls */}
                    {audioBlob && (
                      <div className="space-y-4 pt-4 border-t border-white/20">
                        <div className={`${themeClasses.text} text-center font-semibold`}>
                          {t("customVoice.recordingComplete")}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={isPlaying ? pauseRecording : playRecording}
                            variant="outline"
                            className="flex-1 bg-transparent"
                          >
                            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {t("customVoice.playRecording")}
                          </Button>
                          <Button onClick={() => setAudioBlob(null)} variant="outline" className="flex-1">
                            {t("customVoice.reRecord")}
                          </Button>
                        </div>
                        <Button
                          onClick={saveVoice}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={!recordingName.trim()}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {t("customVoice.saveVoice")}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Data Retention Policy */}
            <Card className={`${themeClasses.card} border-blue-500/30`}>
              <CardHeader>
                <CardTitle className={`${themeClasses.text} flex items-center text-lg`}>
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  {language === "zh" ? "数据保护政策" : "Data Protection Policy"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className={`${themeClasses.text} font-semibold mb-1`}>
                      {language === "zh" ? "语音数据存储" : "Voice Data Storage"}
                    </h4>
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {language === "zh"
                        ? "您的语音数据仅存储在您的设备上，我们不会将其上传到服务器。"
                        : "Your voice data is only stored on your device and is not uploaded to our servers."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className={`${themeClasses.text} font-semibold mb-1`}>
                      {language === "zh" ? "隐私保护" : "Privacy Protection"}
                    </h4>
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {language === "zh"
                        ? "删除语音后，所有相关数据将被永久清除，无法恢复。"
                        : "After deleting your voice, all related data will be permanently removed and cannot be recovered."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className={`${themeClasses.text} font-semibold mb-1`}>
                      {language === "zh" ? "使用限制" : "Usage Limitations"}
                    </h4>
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {language === "zh"
                        ? "每个用户只能录制一个自定义语音，系统不保存历史版本。"
                        : "Each user can only record one custom voice, and the system does not save historical versions."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Element */}
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onError={() => setIsPlaying(false)} />
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
