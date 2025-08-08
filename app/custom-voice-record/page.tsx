"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Mic, Play, Pause, Save, ArrowLeft, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

export default function CustomVoiceRecordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [recordingName, setRecordingName] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [step, setStep] = useState<"record" | "review" | "save">("record")
  const [isSaving, setIsSaving] = useState(false)
  const [recordLanguage, setRecordLanguage] = useState<"zh" | "en">("zh")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()

  const sampleText = {
    zh: "电影是艺术与技术的完美结合，每一帧画面都承载着导演的情感与思考。",
    en: "Movies are the perfect blend of art and technology, with every frame carrying the director's emotions and thoughts.",
  }

  // Check VIP status
  useEffect(() => {
    if (!user || !user.is_vip) {
      router.push(`/voice-selection?${searchParams.toString()}`)
    }
    // Set record language to match UI language
    setRecordLanguage(language as "zh" | "en")
  }, [user, router, searchParams, language])

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

  const startRecording = async () => {
    try {
      // Enhanced browser compatibility checks
      const getUserMedia = navigator.mediaDevices?.getUserMedia ||
                          (navigator as any).webkitGetUserMedia ||
                          (navigator as any).mozGetUserMedia ||
                          (navigator as any).msGetUserMedia

      if (!getUserMedia) {
        alert(language === "zh" ? "您的浏览器不支持录音功能" : "Your browser doesn't support audio recording")
        return
      }

      if (!window.MediaRecorder) {
        alert(language === "zh" ? "您的浏览器不支持MediaRecorder" : "Your browser doesn't support MediaRecorder")
        return
      }

      // More compatible audio constraints for mobile and PC
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // More conservative settings for mobile compatibility
          sampleRate: { ideal: 44100, min: 8000 },
          channelCount: { ideal: 1 }, // Mono for better compatibility
          latency: { ideal: 0.01 }
        }
      }

      let stream: MediaStream
      if (navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } else {
        // Fallback for older browsers
        stream = await new Promise((resolve, reject) => {
          (getUserMedia as any).call(navigator, constraints.audio, resolve, reject)
        })
      }

      // Determine best supported MIME type for cross-platform compatibility
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav'
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        setAudioBlob(blob)
        setStep("review")
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        alert(language === "zh" ? "录音过程中出现错误" : "Error during recording")
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
      }

      // Start recording with smaller time slices for better mobile performance
      mediaRecorder.start(250)
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          // Auto-stop at 12 seconds
          if (newTime >= 12) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert(language === "zh" ? "请允许访问麦克风权限" : "Please allow microphone access")
        } else if (error.name === 'NotFoundError') {
          alert(language === "zh" ? "未找到麦克风设备" : "No microphone found")
        } else if (error.name === 'NotSupportedError') {
          alert(language === "zh" ? "您的设备不支持录音功能" : "Your device doesn't support recording")
        } else {
          alert(language === "zh" ? "录音启动失败，请检查麦克风设置" : "Failed to start recording, please check microphone settings")
        }
      }
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
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
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

  const discardRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setStep("record")
    setIsPlaying(false)
  }

  const saveRecording = async () => {
    if (!audioBlob || !recordingName.trim() || !user) return

    setIsSaving(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Determine file extension based on blob type
      const fileExtension = audioBlob.type.includes('webm') ? 'webm' :
                           audioBlob.type.includes('mp4') ? 'mp4' :
                           audioBlob.type.includes('ogg') ? 'ogg' : 'webm'

      formData.append('audio', audioBlob, `${recordingName}.${fileExtension}`)
      formData.append('name', recordingName)
      formData.append('language', recordLanguage)
      formData.append('user_id', user.id.toString())
      formData.append('username', (user as any).username || user.email || `user_${user.id}`)

      // Upload to backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voices/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      })

      if (response.ok) {
        setStep("save")
        setTimeout(() => {
          router.push(`/voice-selection?${searchParams.toString()}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save recording')
      }
    } catch (error) {
      console.error("Error saving recording:", error)
      alert(language === "zh" ? "保存失败，请重试" : "Save failed, please try again")
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user || !user.is_vip) {
    return null // Will redirect in useEffect
  }

  return (
    <AppLayout title={language === "zh" ? "录制专属声音" : "Record Custom Voice"}>
      <div className={`min-h-screen ${themeClasses.background}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/voice-selection?${searchParams.toString()}`)}
              className={`${themeClasses.text} hover:bg-white/10`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "zh" ? "返回声音选择" : "Back to Voice Selection"}
            </Button>

            <div className="flex items-center space-x-4">
              {/* Language Switch */}
              <div className="flex items-center space-x-1 bg-white/10 dark:bg-black/20 rounded-lg p-1">
                <Button
                  variant={recordLanguage === "zh" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setRecordLanguage("zh")}
                  className="text-sm px-3"
                >
                  中文
                </Button>
                <Button
                  variant={recordLanguage === "en" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setRecordLanguage("en")}
                  className="text-sm px-3"
                >
                  English
                </Button>
              </div>

              <Badge className="bg-yellow-500 text-black">VIP</Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            {step === "record" && (
              <Card className={themeClasses.card}>
                <CardHeader>
                  <CardTitle className={`${themeClasses.text} text-center`}>
                    {language === "zh" ? "录制您的声音" : "Record Your Voice"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sample Text */}
                  <div>
                    <Label className={`${themeClasses.text} text-lg font-semibold`}>
                      {language === "zh" ? "请朗读以下文本：" : "Please read the following text:"}
                    </Label>
                    <Card className={`${themeClasses.card} mt-3`}>
                      <CardContent className="p-4">
                        <p className={`${themeClasses.text} leading-relaxed text-base`}>
                          {sampleText[recordLanguage]}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recording Controls */}
                  <div className="text-center space-y-4">
                    {isRecording && (
                      <div className="space-y-2">
                        <div className={`${themeClasses.text} text-2xl font-mono`}>
                          {formatTime(recordingTime)}
                        </div>
                        <Progress value={(recordingTime / 12) * 100} className="w-full" />
                      </div>
                    )}

                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      size="lg"
                      className={`w-32 h-32 rounded-full ${
                        isRecording 
                          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      } text-white`}
                    >
                      <Mic className="w-8 h-8" />
                    </Button>

                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {isRecording 
                        ? (language === "zh" ? "点击停止录制" : "Click to stop recording")
                        : (language === "zh" ? "点击开始录制" : "Click to start recording")
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "review" && audioBlob && (
              <Card className={themeClasses.card}>
                <CardHeader>
                  <CardTitle className={`${themeClasses.text} text-center`}>
                    {language === "zh" ? "预览录音" : "Preview Recording"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recording Info */}
                  <div className="text-center">
                    <div className={`${themeClasses.text} text-lg font-semibold mb-2`}>
                      {language === "zh" ? "录音时长：" : "Duration: "}{formatTime(recordingTime)}
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={isPlaying ? pauseRecording : playRecording}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      {isPlaying 
                        ? (language === "zh" ? "暂停" : "Pause")
                        : (language === "zh" ? "播放" : "Play")
                      }
                    </Button>
                  </div>

                  {/* Voice Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="voiceName" className={`${themeClasses.text} font-semibold`}>
                      {language === "zh" ? "声音名称" : "Voice Name"}
                    </Label>
                    <Input
                      id="voiceName"
                      value={recordingName}
                      onChange={(e) => setRecordingName(e.target.value)}
                      placeholder={language === "zh" ? "例如：我的声音" : "e.g., My Voice"}
                      className={`${themeClasses.card} ${themeClasses.text}`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={discardRecording}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {language === "zh" ? "重新录制" : "Re-record"}
                    </Button>
                    <Button
                      onClick={saveRecording}
                      disabled={!recordingName.trim() || isSaving}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {language === "zh" ? "保存中..." : "Saving..."}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {language === "zh" ? "保存" : "Save"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "save" && (
              <Card className={themeClasses.card}>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className={`${themeClasses.text} text-xl font-semibold`}>
                      {language === "zh" ? "保存成功！" : "Saved Successfully!"}
                    </h3>
                    <p className={`${themeClasses.secondaryText}`}>
                      {language === "zh" 
                        ? "您的专属声音已保存，正在返回声音选择页面..."
                        : "Your custom voice has been saved. Returning to voice selection..."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Audio Element */}
          <audio 
            ref={audioRef} 
            onEnded={() => setIsPlaying(false)}
            onError={() => setIsPlaying(false)}
          />
        </div>
      </div>
    </AppLayout>
  )
}
