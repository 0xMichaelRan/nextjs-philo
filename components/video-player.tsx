"use client"

import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react"
import { Play, Pause, Maximize, Subtitles } from "lucide-react"
import { Button } from "@/components/ui/button"


interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  onPlay?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onPlayingStateChange?: (isPlaying: boolean) => void
  onEnded?: () => void
  subtitleSrc?: string
  showSubtitles?: boolean
  onSubtitleToggle?: (show: boolean) => void
}

export interface VideoPlayerRef {
  pause: () => void
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ src, poster, className = "", onPlay, onTimeUpdate, onPlayingStateChange, onEnded, subtitleSrc, showSubtitles = false, onSubtitleToggle }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (videoRef.current && isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }))

  // Handle subtitle state changes from parent
  useEffect(() => {
    if (videoRef.current && subtitleSrc && videoRef.current.textTracks.length > 0) {
      const track = videoRef.current.textTracks[0]
      track.mode = showSubtitles ? 'showing' : 'hidden'
      console.log('Subtitle state updated from parent:', {
        showSubtitles,
        trackMode: track.mode
      })
    }
  }, [showSubtitles, subtitleSrc])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // Notify parent that this video is starting to play
        if (onPlay) {
          onPlay()
        }
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }



  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      if (onTimeUpdate) {
        onTimeUpdate(time)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setIsLoading(false)
      setHasError(false)

      // Initialize subtitle track mode
      if (subtitleSrc && videoRef.current.textTracks.length > 0) {
        const track = videoRef.current.textTracks[0]
        track.mode = showSubtitles ? 'showing' : 'hidden'
        console.log('Subtitle track initialized:', {
          mode: track.mode,
          showSubtitles,
          src: subtitleSrc
        })
      }
    }
  }

  const handleError = () => {
    console.error('Video loading error for src:', src)
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }





  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const toggleSubtitles = () => {
    if (videoRef.current && subtitleSrc) {
      const tracks = videoRef.current.textTracks
      if (tracks.length > 0) {
        const track = tracks[0]
        const newShowState = !showSubtitles
        track.mode = newShowState ? 'showing' : 'hidden'
        console.log('Toggling subtitles:', {
          from: showSubtitles,
          to: newShowState,
          trackMode: track.mode
        })
        if (onSubtitleToggle) {
          onSubtitleToggle(newShowState)
        }
      }
    }
  }



  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onError={handleError}
        onPlay={() => {
          setIsPlaying(true)
          if (onPlayingStateChange) onPlayingStateChange(true)
        }}
        onPause={() => {
          setIsPlaying(false)
          if (onPlayingStateChange) onPlayingStateChange(false)
        }}
        onEnded={() => {
          setIsPlaying(false)
          if (onPlayingStateChange) onPlayingStateChange(false)
          if (onEnded) onEnded()
        }}
        onClick={togglePlay}
        preload="metadata"
        crossOrigin="anonymous"
      >
        {subtitleSrc && (
          <track
            kind="subtitles"
            src={subtitleSrc}
            srcLang="zh"
            label="中文字幕"
            default={showSubtitles}
            onError={(e) => {
              console.error('Subtitle track error:', e)
              console.error('Subtitle URL:', subtitleSrc)
            }}
            onLoad={() => {
              console.log('Subtitle track loaded successfully')
              console.log('Subtitle URL:', subtitleSrc)
              // Ensure proper mode is set after loading
              if (videoRef.current && videoRef.current.textTracks.length > 0) {
                const track = videoRef.current.textTracks[0]
                track.mode = showSubtitles ? 'showing' : 'hidden'
                console.log('Subtitle mode set after load:', track.mode)
              }
            }}
          />
        )}
      </video>

      {/* Loading indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-lg">Loading video...</div>
        </div>
      )}

      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="text-lg mb-2">Video loading failed</div>
            <div className="text-sm opacity-75">Please try refreshing the page</div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        {/* Progress Bar - smaller and view-only */}
        <div className="mb-2">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-white rounded-full h-1 transition-all duration-300"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {subtitleSrc && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSubtitles}
                className={`text-white hover:bg-white/20 ${showSubtitles ? 'bg-white/20' : ''}`}
              >
                <Subtitles className="w-4 h-4" />
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

VideoPlayer.displayName = "VideoPlayer"
