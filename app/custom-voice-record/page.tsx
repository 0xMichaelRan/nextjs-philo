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
import { apiConfig } from "@/lib/api-config"

export default function CustomVoiceRecordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [recordingName, setRecordingName] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [step, setStep] = useState<"record" | "review" | "save">("record")
  const [isSaving, setIsSaving] = useState(false)
  const [recordLanguage, setRecordLanguage] = useState<"zh" | "en">("zh")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()

  // Recording time limit in seconds
  const RECORDING_TIME_LIMIT = 20

  // Auto-stop recording when time limit is reached
  useEffect(() => {
    if (isRecording && recordingTime >= RECORDING_TIME_LIMIT) {
      stopRecording()
    }
  }, [recordingTime, isRecording])

  // Use translations for sample text
  const getSampleText = () => {
    return t("customVoice.sampleText")
  }

  // Generate random voice name
  const generateRandomName = () => {
    const adjectives = language === "zh"
      ? ["温暖", "清澈", "优雅", "动听", "甜美", "磁性", "柔和", "明亮"]
      : ["Warm", "Clear", "Elegant", "Melodic", "Sweet", "Magnetic", "Gentle", "Bright"]

    const nouns = language === "zh"
      ? ["声音", "嗓音", "音色", "语调"]
      : ["Voice", "Tone", "Sound", "Vocal"]

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]

    return language === "zh" ? `${randomAdjective}的${randomNoun}` : `${randomAdjective} ${randomNoun}`
  }

  // Check VIP status
  useEffect(() => {
    if (!user || !user.is_vip) {
      const returnTo = searchParams.get("returnTo") || "/voice-selection"
      const cleanReturnTo = returnTo.startsWith('/') ? returnTo : `/${returnTo}`
      router.push(`${cleanReturnTo}?${searchParams.toString()}`)
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
      // Pause any currently playing audio
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        setIsPlaying(false)
      }

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

      // Determine best supported MIME type for TTS compatibility
      // Note: Most browsers don't support wav recording directly, so we'll use webm and convert on backend
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus'
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
        setRecordingTime(prev => prev + 1)
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
      // Auto-generate a random name and advance to review step
      setTimeout(() => {
        setRecordingName(generateRandomName())
        setStep("review")
      }, 500)
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url

      // Set duration from recording time if audio duration is not available
      if (!audioDuration && recordingTime > 0) {
        setAudioDuration(recordingTime)
      }

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

  // Update play progress
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.currentTime && !isNaN(audio.currentTime)) {
        const progress = (audio.currentTime / audio.duration) * 100
        setPlayProgress(progress)
      }
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration)
      } else if (recordingTime > 0) {
        // Fallback to recording time if audio duration is not available
        setAudioDuration(recordingTime)
      }
    }

    const handleLoadedData = () => {
      // Try to get duration when data is loaded
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setPlayProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioBlob])

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
      const fileExtension = audioBlob.type.includes('wav') ? 'wav' :
                           audioBlob.type.includes('mp4') ? 'mp4' :
                           audioBlob.type.includes('webm') ? 'webm' :
                           audioBlob.type.includes('ogg') ? 'ogg' : 'webm'

      formData.append('audio', audioBlob, `${recordingName}.${fileExtension}`)
      formData.append('name', recordingName)
      formData.append('language', recordLanguage)

      // Upload to backend API
      const response = await fetch(apiConfig.voices.uploadCustom(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData
      })

      if (response.ok) {
        setStep("save")
        setTimeout(() => {
          const returnTo = searchParams.get("returnTo") || "/my-voices"

          if (returnTo === "voice-selection" || returnTo === "/voice-selection") {
            // Return to voice-selection with the new voice selected
            const currentParams = new URLSearchParams(searchParams.toString())
            currentParams.delete('returnTo')
            // Use the actual voice ID from the response
            currentParams.set('newVoiceId', `${result.id}`)
            router.push(`/voice-selection?${currentParams.toString()}`)
          } else if (returnTo === "my-voices" || returnTo === "/my-voices") {
            // Return to my-voices
            router.push('/my-voices')
          } else {
            // Default fallback
            const cleanReturnTo = returnTo.startsWith('/') ? returnTo : `/${returnTo}`
            router.push(cleanReturnTo)
          }
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
    <AppLayout title={t("customVoice.title")}>
      <div className={`min-h-screen ${themeClasses.background}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const returnTo = searchParams.get("returnTo") || "/voice-selection"
                const cleanReturnTo = returnTo.startsWith('/') ? returnTo : `/${returnTo}`
                router.push(`${cleanReturnTo}?${searchParams.toString()}`)
              }}
              className={`${themeClasses.text} hover:bg-white/10`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {searchParams.get("returnTo") === "my-voices"
                ? (language === "zh" ? "返回我的声音" : "Back to My Voices")
                : (language === "zh" ? "返回声音选择" : "Back to Voice Selection")
              }
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
                    {t("customVoice.subtitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sample Text */}
                  <div>
                    <Label className={`${themeClasses.text} text-lg font-semibold`}>
                      {t("customVoice.recordingTip")}
                    </Label>
                    <Card className={`${themeClasses.card} mt-3`}>
                      <CardContent className="p-4">
                        <p className={`${themeClasses.text} leading-relaxed text-base`}>
                          {getSampleText()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recording Controls */}
                  <div className="text-center space-y-4">
                    {/* Time limit info */}
                    <div className={`text-sm ${themeClasses.secondaryText}`}>
                      {t("customVoice.timeLimit")}
                    </div>

                    {isRecording && (
                      <div className="space-y-2">
                        <div className={`${themeClasses.text} text-2xl font-mono`}>
                          {formatTime(recordingTime)}
                        </div>
                        <div className={`text-sm ${themeClasses.secondaryText}`}>
                          {t("customVoice.timeRemaining")}: {formatTime(RECORDING_TIME_LIMIT - recordingTime)}
                        </div>
                        <Progress value={(recordingTime / RECORDING_TIME_LIMIT) * 100} className="w-full" />
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
                        ? t("customVoice.stopRecording")
                        : t("customVoice.startRecording")
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
                  <div className="flex justify-center">
                    <Button
                      onClick={isPlaying ? pauseRecording : playRecording}
                      size="lg"
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {isPlaying
                        ? (language === "zh" ? "点击暂停播放" : "Click to pause playback")
                        : (language === "zh" ? "点击播放录音" : "Click to play recording")
                      }
                    </p>
                  </div>

                  {/* Custom Seek Bar */}
                  {(isPlaying || playProgress > 0) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={themeClasses.secondaryText}>
                          {formatTime(Math.floor((playProgress / 100) * (audioDuration || 0)))}
                        </span>
                        <span className={themeClasses.secondaryText}>
                          {formatTime(Math.floor(audioDuration || 0))}
                        </span>
                      </div>
                      {/* Video Player Style Seek Bar */}
                      <div
                        className={`relative w-full h-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded-full cursor-pointer group`}
                        onClick={(e) => {
                          if (audioRef.current && audioDuration > 0) {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const clickX = e.clientX - rect.left
                            const percentage = (clickX / rect.width) * 100
                            const newTime = (percentage / 100) * audioDuration
                            audioRef.current.currentTime = newTime
                            setPlayProgress(percentage)
                          }
                        }}
                      >
                        {/* Progress Track */}
                        <div
                          className={`absolute top-0 left-0 h-full ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'} rounded-full transition-all duration-150`}
                          style={{ width: `${playProgress}%` }}
                        />
                        {/* Hover Effect */}
                        <div className={`absolute top-0 left-0 w-full h-full rounded-full opacity-0 group-hover:opacity-20 ${theme === 'light' ? 'bg-blue-300' : 'bg-blue-600'} transition-opacity duration-150`} />
                      </div>
                    </div>
                  )}

                  {/* Voice Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="voiceName" className={`${themeClasses.text} font-semibold`}>
                      {t("customVoice.recordingName")}
                    </Label>
                    <Input
                      id="voiceName"
                      value={recordingName}
                      onChange={(e) => setRecordingName(e.target.value)}
                      placeholder={t("customVoice.namePlaceholder")}
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
                      {t("customVoice.reRecord")}
                    </Button>
                    <Button
                      onClick={saveRecording}
                      disabled={!recordingName.trim() || isSaving}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {t("customVoice.recordingInProgress")}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t("customVoice.saveVoice")}
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
                      {t("customVoice.recordingComplete")}
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
