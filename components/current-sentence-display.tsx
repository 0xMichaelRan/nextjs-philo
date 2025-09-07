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
    background: theme === 'dark' ? 'theme-bg-elevated' : 'theme-bg-elevated',
    border: theme === 'dark' ? 'border-white/20' : 'border-gray-200',
    text: 'theme-text-primary',
    secondaryText: 'theme-text-secondary',
    mutedText: 'theme-text-muted',
    brandColor: 'theme-brand-primary',
    progressBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200',
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
        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-2 ${theme === 'dark' ? 'border-white' : 'border-gray-900'}`}></div>
        <span className={`text-sm ${themeClasses.secondaryText}`}>
          {t('videoGeneration.loadingSubtitles') || 'Loading subtitles...'}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} text-center py-4`}>
        <p className={`text-sm theme-status-error`}>
          {error}
        </p>
      </div>
    )
  }

  if (!currentSubtitle) {
    return (
      <div className={`${className} text-center py-4`}>
        <p className={`text-sm ${themeClasses.mutedText}`}>
          {t('videoGeneration.noCurrentSubtitle') || 'No current subtitle'}
        </p>
      </div>
    )
  }

  return (
    <div className={`${className} ${themeClasses.background} ${themeClasses.border} border rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium ${themeClasses.text} opacity-75`}>
          {t('videoGeneration.currentSubtitle') || 'Current Sentence'}
        </span>
        <span className={`text-xs ${themeClasses.mutedText}`}>
          #{currentSubtitle.id}
        </span>
      </div>

      <p className={`${themeClasses.text} leading-relaxed mb-4 text-lg font-medium`}>
        {currentSubtitle.text}
      </p>

      {/* Progress bar for current subtitle */}
      <div className={`w-full ${themeClasses.progressBg} rounded-full h-2 mb-2`}>
        <div
          className={`h-2 rounded-full transition-all duration-300 ${themeClasses.brandColor}`}
          style={{
            width: `${getSubtitleProgress(currentSubtitle, currentTime)}%`,
            backgroundColor: theme === 'dark' ? 'var(--brand-primary)' : 'var(--brand-primary)'
          }}
        />
      </div>

      <div className="flex justify-between">
        <span className={`text-xs ${themeClasses.mutedText}`}>
          {Math.floor(currentSubtitle.startTime)}s
        </span>
        <span className={`text-xs ${themeClasses.mutedText}`}>
          {Math.floor(currentSubtitle.endTime)}s
        </span>
      </div>
    </div>
  )
}
