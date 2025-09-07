"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/theme-context'
import { useLanguage } from '@/contexts/language-context'
import { 
  SubtitleEntry, 
  getCurrentSubtitle, 
  getSubtitleProgress,
  fetchAndParseSRT
} from '@/lib/subtitle-parser'

interface CurrentSentenceDisplayProps {
  subtitleUrl?: string
  currentTime: number
  isPlaying: boolean
  videoEnded?: boolean
  className?: string
}

export function CurrentSentenceDisplay({
  subtitleUrl,
  currentTime,
  isPlaying,
  videoEnded = false,
  className = ""
}: CurrentSentenceDisplayProps) {
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const themeClasses = {
    background: theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    secondaryText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    currentBg: theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100',
    currentBorder: theme === 'dark' ? 'border-purple-500' : 'border-purple-400',
  }

  // Load subtitles when URL changes
  useEffect(() => {
    if (!subtitleUrl) {
      setSubtitles([])
      return
    }

    const loadSubtitles = async () => {
      try {
        setLoading(true)
        setError(null)
        const parsedSubtitles = await fetchAndParseSRT(subtitleUrl)
        setSubtitles(parsedSubtitles)
      } catch (err) {
        console.error('Error loading subtitles:', err)
        setError(t('videoGeneration.subtitleLoadError') || 'Failed to load subtitles')
        setSubtitles([])
      } finally {
        setLoading(false)
      }
    }

    loadSubtitles()
  }, [subtitleUrl, t])

  const currentSubtitle = getCurrentSubtitle(subtitles, currentTime)

  // Hide the component when video has ended
  if (videoEnded) {
    return null
  }

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center py-4`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
        <span className={`text-sm ${themeClasses.secondaryText}`}>
          {t('videoGeneration.loadingSubtitles') || 'Loading subtitles...'}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} text-center py-4`}>
        <p className={`text-sm ${themeClasses.secondaryText}`}>
          {error}
        </p>
      </div>
    )
  }

  if (!currentSubtitle) {
    return (
      <div className={`${className} text-center py-4`}>
        <p className={`text-sm ${themeClasses.secondaryText}`}>
          {t('videoGeneration.noCurrentSubtitle') || 'No current subtitle'}
        </p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-medium ${themeClasses.text} opacity-75`}>
          {t('videoGeneration.currentSubtitle') || 'Current Sentence'}
        </span>
        <span className={`text-xs ${themeClasses.secondaryText}`}>
          #{currentSubtitle.id}
        </span>
      </div>
      
      <p className={`${themeClasses.text} leading-relaxed mb-3 text-lg`}>
        {currentSubtitle.text}
      </p>
      
      {/* Progress bar for current subtitle */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${getSubtitleProgress(currentSubtitle, currentTime)}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${themeClasses.secondaryText}`}>
          {Math.floor(currentSubtitle.startTime)}s
        </span>
        <span className={`text-xs ${themeClasses.secondaryText}`}>
          {Math.floor(currentSubtitle.endTime)}s
        </span>
      </div>
    </div>
  )
}
