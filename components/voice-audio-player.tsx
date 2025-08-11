"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface VoiceAudioPlayerProps {
  voiceId: string
  audioUrl: string
  isPlaying: boolean
  onPlay: (voiceId: string, audioUrl: string) => void
  showProgressBar?: boolean
  audioProgress?: number
  audioDuration?: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function VoiceAudioPlayer({
  voiceId,
  audioUrl,
  isPlaying,
  onPlay,
  showProgressBar = false,
  audioProgress = 0,
  audioDuration = 0,
  className = "",
  size = "sm"
}: VoiceAudioPlayerProps) {
  const { language } = useLanguage()

  const getSizeClasses = () => {
    switch (size) {
      case "md":
        return "w-12 h-12 p-0"
      case "lg":
        return "w-14 h-14 p-0"
      default:
        return "w-10 h-10 p-0"
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "md":
        return "w-5 h-5"
      case "lg":
        return "w-6 h-6"
      default:
        return "w-4 h-4"
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlay(voiceId, audioUrl)
  }

  if (isPlaying && showProgressBar) {
    return (
      <div className={`flex-1 space-y-2 mr-2 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-800 dark:text-white">
            {language === "zh" ? "正在播放..." : "Playing..."}
          </span>
          <span className="text-gray-600 dark:text-gray-300">
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
            onClick={handleClick}
            size="sm"
            variant="ghost"
            className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Pause className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={`${getSizeClasses()} ${className}`}
    >
      {isPlaying ? (
        <Pause className={getIconSize()} />
      ) : (
        <Play className={getIconSize()} />
      )}
    </Button>
  )
}
