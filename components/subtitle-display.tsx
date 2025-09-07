"use client"

import React, { useEffect, useState, useRef } from 'react'
import { Clock, Download, Subtitles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { useLanguage } from '@/contexts/language-context'
import { 
  SubtitleEntry, 
  getCurrentSubtitle, 
  getSubtitleContext, 
  formatDisplayTime,
  getSubtitleProgress,
  fetchAndParseSRT
} from '@/lib/subtitle-parser'

interface SubtitleDisplayProps {
  subtitleUrl?: string
  currentTime: number
  isPlaying: boolean
  className?: string
  movieId?: string
}

export function SubtitleDisplay({ 
  subtitleUrl, 
  currentTime, 
  isPlaying,
  className = "",
  movieId 
}: SubtitleDisplayProps) {
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const themeClasses = {
    background: theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    secondaryText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    currentBg: theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100',
    currentBorder: theme === 'dark' ? 'border-purple-500' : 'border-purple-400',
    upcomingBg: theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50',
    pastBg: theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-100/50',
  }

  // Load subtitles when URL changes
  useEffect(() => {
    if (!subtitleUrl) {
      setSubtitles([])
      return
    }

    const loadSubtitles = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const parsedSubtitles = await fetchAndParseSRT(subtitleUrl)
        setSubtitles(parsedSubtitles)
      } catch (err) {
        console.error('Error loading subtitles:', err)
        setError(t('videoGeneration.noSubtitlesAvailable') || 'Failed to load subtitles')
      } finally {
        setLoading(false)
      }
    }

    loadSubtitles()
  }, [subtitleUrl, t])

  // Auto-scroll to current subtitle
  useEffect(() => {
    if (!isPlaying || subtitles.length === 0) return

    const current = getCurrentSubtitle(subtitles, currentTime)
    if (current && scrollContainerRef.current) {
      const currentElement = scrollContainerRef.current.querySelector(`[data-subtitle-id="${current.id}"]`)
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
  }, [currentTime, isPlaying, subtitles])

  const { previous, current, next } = getSubtitleContext(subtitles, currentTime)

  if (loading) {
    return (
      <div className={`${className} ${themeClasses.background} ${themeClasses.border} border rounded-lg p-6`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
          <span className={themeClasses.secondaryText}>Loading subtitles...</span>
        </div>
      </div>
    )
  }

  if (error || !subtitleUrl) {
    return (
      <div className={`${className} ${themeClasses.background} ${themeClasses.border} border rounded-lg p-6`}>
        <div className="text-center">
          <Subtitles className={`w-8 h-8 ${themeClasses.secondaryText} mx-auto mb-2`} />
          <p className={themeClasses.secondaryText}>
            {error || t('videoGeneration.noSubtitlesAvailable') || 'No subtitles available'}
          </p>
        </div>
      </div>
    )
  }

  if (subtitles.length === 0) {
    return (
      <div className={`${className} ${themeClasses.background} ${themeClasses.border} border rounded-lg p-6`}>
        <div className="text-center">
          <Subtitles className={`w-8 h-8 ${themeClasses.secondaryText} mx-auto mb-2`} />
          <p className={themeClasses.secondaryText}>
            {t('videoGeneration.noSubtitlesAvailable') || 'No subtitles available'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} ${themeClasses.background} ${themeClasses.border} border rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Subtitles className={`w-5 h-5 ${themeClasses.text}`} />
            <h3 className={`font-medium ${themeClasses.text}`}>
              {t('videoGeneration.subtitles') || 'Subtitles'}
            </h3>
            <span className={`text-sm ${themeClasses.secondaryText}`}>
              ({subtitles.length} entries)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {current && (
              <div className={`text-xs ${themeClasses.secondaryText} flex items-center gap-1`}>
                <Clock className="w-3 h-3" />
                {formatDisplayTime(current.startTime)} - {formatDisplayTime(current.endTime)}
              </div>
            )}
            
            {subtitleUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={`${themeClasses.text} hover:bg-white/10 text-xs`}
              >
                <a
                  href={subtitleUrl}
                  download={`${movieId}_subtitles.srt`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {t('videoGeneration.downloadSubtitles') || 'Download'}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Current Subtitle Display */}
      {current && (
        <div className={`p-4 ${themeClasses.currentBg} border-b ${themeClasses.currentBorder}`}>
          <div className="flex items-start justify-between mb-2">
            <span className={`text-xs font-medium ${themeClasses.text} opacity-75`}>
              {t('videoGeneration.currentSubtitle') || 'Current'}
            </span>
            <span className={`text-xs ${themeClasses.secondaryText}`}>
              #{current.id}
            </span>
          </div>
          <p className={`${themeClasses.text} leading-relaxed mb-2`}>
            {current.text}
          </p>
          
          {/* Progress bar for current subtitle */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-purple-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${getSubtitleProgress(current, currentTime)}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtitle List */}
      <div 
        ref={scrollContainerRef}
        className="max-h-64 overflow-y-auto"
      >
        {subtitles.map((subtitle) => {
          const isCurrent = current?.id === subtitle.id
          const isPast = subtitle.endTime < currentTime
          const isUpcoming = subtitle.startTime > currentTime
          
          let itemClasses = `p-3 border-b border-gray-100 dark:border-gray-800 transition-all duration-200 `
          
          if (isCurrent) {
            itemClasses += `${themeClasses.currentBg} ${themeClasses.currentBorder} border-l-4`
          } else if (isPast) {
            itemClasses += `${themeClasses.pastBg} opacity-60`
          } else if (isUpcoming) {
            itemClasses += `${themeClasses.upcomingBg}`
          }

          return (
            <div 
              key={subtitle.id}
              data-subtitle-id={subtitle.id}
              className={itemClasses}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={`text-xs ${themeClasses.secondaryText}`}>
                  {formatDisplayTime(subtitle.startTime)} - {formatDisplayTime(subtitle.endTime)}
                </span>
                <span className={`text-xs ${themeClasses.secondaryText}`}>
                  #{subtitle.id}
                </span>
              </div>
              <p className={`text-sm ${themeClasses.text} leading-relaxed ${isCurrent ? 'font-medium' : ''}`}>
                {subtitle.text}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
