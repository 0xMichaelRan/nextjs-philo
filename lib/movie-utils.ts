/**
 * Movie Title Utility Functions
 * 
 * Shared utilities for handling movie titles across the application.
 * Provides consistent movie title retrieval with proper fallbacks.
 */

export interface MovieTitleData {
  movie_id?: string
  movie_title_json?: { en?: string; zh?: string } | null
  movie_title_en?: string
  movie_title_zh?: string
  title?: string
  title_en?: string
  title_zh?: string
}

/**
 * Get the appropriate movie title based on language preference
 * 
 * @param movieData - Movie data object with various title fields
 * @param language - Language preference ('zh' or 'en')
 * @returns The appropriate movie title or movie ID as fallback
 */
export function getMovieTitle(movieData: MovieTitleData, language: 'zh' | 'en' = 'zh'): string {
  if (!movieData) {
    return 'Unknown Movie'
  }

  // Priority 1: Use movie_title_json if available
  if (movieData.movie_title_json && typeof movieData.movie_title_json === 'object') {
    const title = language === 'zh' 
      ? movieData.movie_title_json.zh || movieData.movie_title_json.en
      : movieData.movie_title_json.en || movieData.movie_title_json.zh
    
    if (title) return title
  }

  // Priority 2: Use specific language title fields
  if (language === 'zh') {
    if (movieData.movie_title_zh) return movieData.movie_title_zh
    if (movieData.title_zh) return movieData.title_zh
    if (movieData.movie_title_en) return movieData.movie_title_en
    if (movieData.title_en) return movieData.title_en
    if (movieData.title) return movieData.title
  } else {
    if (movieData.movie_title_en) return movieData.movie_title_en
    if (movieData.title_en) return movieData.title_en
    if (movieData.movie_title_zh) return movieData.movie_title_zh
    if (movieData.title_zh) return movieData.title_zh
    if (movieData.title) return movieData.title
  }

  // Fallback: Use movie_id if no title is available
  return movieData.movie_id || 'Unknown Movie'
}

/**
 * Get both English and Chinese movie titles
 * 
 * @param movieData - Movie data object with various title fields
 * @returns Object with both English and Chinese titles
 */
export function getMovieTitles(movieData: MovieTitleData): { en: string; zh: string } {
  const enTitle = getMovieTitle(movieData, 'en')
  const zhTitle = getMovieTitle(movieData, 'zh')
  
  return {
    en: enTitle,
    zh: zhTitle
  }
}

/**
 * Format movie title for display with fallback handling
 * 
 * @param movieData - Movie data object
 * @param language - Language preference
 * @param showBothLanguages - Whether to show both languages if available
 * @returns Formatted movie title string
 */
export function formatMovieTitle(
  movieData: MovieTitleData, 
  language: 'zh' | 'en' = 'zh',
  showBothLanguages: boolean = false
): string {
  if (!movieData) {
    return 'Unknown Movie'
  }

  if (showBothLanguages) {
    const titles = getMovieTitles(movieData)
    
    // If both titles are the same or one is missing, show only one
    if (titles.en === titles.zh || !titles.zh || !titles.en) {
      return getMovieTitle(movieData, language)
    }
    
    // Show both titles with appropriate formatting
    return language === 'zh' 
      ? `${titles.zh} (${titles.en})`
      : `${titles.en} (${titles.zh})`
  }

  return getMovieTitle(movieData, language)
}

/**
 * Check if movie data has valid title information
 * 
 * @param movieData - Movie data object
 * @returns True if movie has at least one valid title
 */
export function hasValidMovieTitle(movieData: MovieTitleData): boolean {
  if (!movieData) return false

  // Check movie_title_json
  if (movieData.movie_title_json && typeof movieData.movie_title_json === 'object') {
    if (movieData.movie_title_json.en || movieData.movie_title_json.zh) {
      return true
    }
  }

  // Check individual title fields
  return !!(
    movieData.movie_title_en ||
    movieData.movie_title_zh ||
    movieData.title_en ||
    movieData.title_zh ||
    movieData.title
  )
}

/**
 * Create movie title JSON object for API requests
 * 
 * @param enTitle - English title
 * @param zhTitle - Chinese title
 * @returns Movie title JSON object
 */
export function createMovieTitleJson(enTitle?: string, zhTitle?: string): { en?: string; zh?: string } | null {
  if (!enTitle && !zhTitle) return null
  
  const result: { en?: string; zh?: string } = {}
  if (enTitle) result.en = enTitle
  if (zhTitle) result.zh = zhTitle
  
  return result
}

/**
 * Extract movie titles from various data formats for backward compatibility
 * 
 * @param movieData - Movie data in various formats
 * @returns Standardized movie title data
 */
export function normalizeMovieTitleData(movieData: any): MovieTitleData {
  if (!movieData) return {}

  const normalized: MovieTitleData = {
    movie_id: movieData.movie_id || movieData.id || movieData.imdb_id,
  }

  // Handle movie_title_json
  if (movieData.movie_title_json) {
    normalized.movie_title_json = movieData.movie_title_json
  }

  // Handle individual title fields
  if (movieData.movie_title_en) normalized.movie_title_en = movieData.movie_title_en
  if (movieData.movie_title_zh) normalized.movie_title_zh = movieData.movie_title_zh
  if (movieData.title_en) normalized.title_en = movieData.title_en
  if (movieData.title_zh) normalized.title_zh = movieData.title_zh
  if (movieData.title) normalized.title = movieData.title

  // Handle legacy array format (backward compatibility)
  if (Array.isArray(movieData.movie_title)) {
    if (movieData.movie_title[0]) normalized.movie_title_en = movieData.movie_title[0]
    if (movieData.movie_title[1]) normalized.movie_title_zh = movieData.movie_title[1]
  }

  return normalized
}

/**
 * Hook for using movie title utilities in React components
 */
export function useMovieTitle(movieData: MovieTitleData, language: 'zh' | 'en' = 'zh') {
  const getTitle = (lang?: 'zh' | 'en') => getMovieTitle(movieData, lang || language)
  const getTitles = () => getMovieTitles(movieData)
  const formatTitle = (showBoth?: boolean) => formatMovieTitle(movieData, language, showBoth)
  const hasValidTitle = () => hasValidMovieTitle(movieData)

  return {
    getTitle,
    getTitles,
    formatTitle,
    hasValidTitle,
    title: getTitle(),
    titles: getTitles()
  }
}
