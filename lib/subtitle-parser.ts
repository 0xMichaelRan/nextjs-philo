/**
 * Subtitle Parser Utility
 * 
 * Parses SRT subtitle files and provides functionality for time-based subtitle display
 */

export interface SubtitleEntry {
  id: number
  startTime: number // in seconds
  endTime: number // in seconds
  text: string
  startTimeString: string // original time string
  endTimeString: string // original time string
}

/**
 * Parse SRT subtitle content into structured data
 */
export function parseSRT(srtContent: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = []
  
  // Split by double newlines to separate subtitle blocks
  const blocks = srtContent.trim().split(/\n\s*\n/)
  
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    
    if (lines.length < 3) continue // Invalid block
    
    // Parse subtitle ID
    const id = parseInt(lines[0].trim())
    if (isNaN(id)) continue
    
    // Parse time range
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)
    if (!timeMatch) continue
    
    const startTimeString = timeMatch[1]
    const endTimeString = timeMatch[2]
    const startTime = parseTimeString(startTimeString)
    const endTime = parseTimeString(endTimeString)
    
    // Parse subtitle text (can be multiple lines)
    const text = lines.slice(2).join('\n').trim()
    
    entries.push({
      id,
      startTime,
      endTime,
      text,
      startTimeString,
      endTimeString
    })
  }
  
  return entries.sort((a, b) => a.startTime - b.startTime)
}

/**
 * Convert SRT time string (HH:MM:SS,mmm) to seconds
 */
function parseTimeString(timeString: string): number {
  const match = timeString.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
  if (!match) return 0
  
  const hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const seconds = parseInt(match[3])
  const milliseconds = parseInt(match[4])
  
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
}

/**
 * Convert seconds to SRT time string format
 */
export function formatTimeToSRT(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

/**
 * Get the current subtitle entry for a given time
 */
export function getCurrentSubtitle(subtitles: SubtitleEntry[], currentTime: number): SubtitleEntry | null {
  return subtitles.find(subtitle => 
    currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
  ) || null
}

/**
 * Get the next subtitle entry that will appear
 */
export function getNextSubtitle(subtitles: SubtitleEntry[], currentTime: number): SubtitleEntry | null {
  return subtitles.find(subtitle => subtitle.startTime > currentTime) || null
}

/**
 * Get all subtitles within a time range
 */
export function getSubtitlesInRange(
  subtitles: SubtitleEntry[], 
  startTime: number, 
  endTime: number
): SubtitleEntry[] {
  return subtitles.filter(subtitle => 
    (subtitle.startTime >= startTime && subtitle.startTime <= endTime) ||
    (subtitle.endTime >= startTime && subtitle.endTime <= endTime) ||
    (subtitle.startTime <= startTime && subtitle.endTime >= endTime)
  )
}

/**
 * Format time in seconds to display format (MM:SS)
 */
export function formatDisplayTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get subtitle context around current time (previous, current, next)
 */
export function getSubtitleContext(
  subtitles: SubtitleEntry[], 
  currentTime: number
): {
  previous: SubtitleEntry | null
  current: SubtitleEntry | null
  next: SubtitleEntry | null
} {
  const current = getCurrentSubtitle(subtitles, currentTime)
  
  let previous: SubtitleEntry | null = null
  let next: SubtitleEntry | null = null
  
  const currentIndex = current ? subtitles.findIndex(s => s.id === current.id) : -1
  
  if (currentIndex > 0) {
    previous = subtitles[currentIndex - 1]
  } else if (currentIndex === -1) {
    // No current subtitle, find the last one before current time
    for (let i = subtitles.length - 1; i >= 0; i--) {
      if (subtitles[i].endTime < currentTime) {
        previous = subtitles[i]
        break
      }
    }
  }
  
  if (currentIndex >= 0 && currentIndex < subtitles.length - 1) {
    next = subtitles[currentIndex + 1]
  } else if (currentIndex === -1) {
    // No current subtitle, find the next one after current time
    next = getNextSubtitle(subtitles, currentTime)
  }
  
  return { previous, current, next }
}

/**
 * Calculate progress percentage for current subtitle
 */
export function getSubtitleProgress(subtitle: SubtitleEntry, currentTime: number): number {
  if (currentTime < subtitle.startTime) return 0
  if (currentTime > subtitle.endTime) return 100
  
  const duration = subtitle.endTime - subtitle.startTime
  const elapsed = currentTime - subtitle.startTime
  
  return Math.min(100, Math.max(0, (elapsed / duration) * 100))
}

/**
 * Fetch and parse SRT file from URL
 */
export async function fetchAndParseSRT(url: string): Promise<SubtitleEntry[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch subtitles: ${response.status}`)
    }
    
    const srtContent = await response.text()
    return parseSRT(srtContent)
  } catch (error) {
    console.error('Error fetching SRT file:', error)
    return []
  }
}
