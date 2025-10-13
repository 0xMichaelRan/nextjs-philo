/**
 * Qiniu OSS Configuration
 * 
 * Configuration for accessing movie images directly from Qiniu OSS.
 */

export const QINIU_DOMAIN = process.env.NEXT_PUBLIC_QINIU_DOMAIN || 'http://t3zidpqew.hb-bkt.clouddn.com'
export const QINIU_POSTER_PREFIX = 'static/posters_w360'
export const QINIU_BACKDROP_PREFIX = 'static/backdrops_w360'

/**
 * Generate Qiniu OSS URL for movie poster image
 * 
 * @param movieId - The IMDB ID or movie ID
 * @returns Full URL to the poster image on Qiniu OSS
 */
export function getQiniuPosterUrl(movieId: string): string {
  if (!movieId) return '/placeholder.svg'
  return `${QINIU_DOMAIN}/${QINIU_POSTER_PREFIX}/${movieId}.jpg`
}

/**
 * Generate Qiniu OSS URL for movie backdrop image
 * 
 * @param movieId - The IMDB ID or movie ID
 * @returns Full URL to the backdrop image on Qiniu OSS
 */
export function getQiniuBackdropUrl(movieId: string): string {
  if (!movieId) return '/placeholder.svg'
  return `${QINIU_DOMAIN}/${QINIU_BACKDROP_PREFIX}/${movieId}.jpg`
}

/**
 * Generate Qiniu OSS URL for movie image (poster or backdrop)
 * 
 * @param movieId - The IMDB ID or movie ID
 * @param type - Image type: 'poster' or 'backdrop'
 * @returns Full URL to the image on Qiniu OSS
 */
export function getQiniuImageUrl(movieId: string, type: 'poster' | 'backdrop' = 'poster'): string {
  if (!movieId) return '/placeholder.svg'
  
  const prefix = type === 'poster' ? QINIU_POSTER_PREFIX : QINIU_BACKDROP_PREFIX
  return `${QINIU_DOMAIN}/${prefix}/${movieId}.jpg`
}
