"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

// Pages that don't require authentication
const PUBLIC_PAGES = [
  '/',
  '/notifications',
  '/movie-selection',
  '/analysis-config',
  '/auth'
]

// Pages that match patterns (like /movie/[id])
const PUBLIC_PAGE_PATTERNS = [
  /^\/movie\/[^\/]+$/,  // /movie/[id]
]

interface UseAuthGuardOptions {
  requireAuth?: boolean
  redirectTo?: string
  redirectAfterLogin?: string
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const {
    requireAuth,
    redirectTo = '/auth',
    redirectAfterLogin
  } = options

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) return

    // Determine if current page requires auth
    const isPublicPage = PUBLIC_PAGES.includes(pathname) || 
                        PUBLIC_PAGE_PATTERNS.some(pattern => pattern.test(pathname))
    
    const needsAuth = requireAuth !== undefined ? requireAuth : !isPublicPage

    // If page requires auth but user is not logged in
    if (needsAuth && !user) {
      // Store the intended destination for after login
      const returnUrl = redirectAfterLogin || pathname
      const authUrl = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`
      router.push(authUrl)
      return
    }

    // If user is logged in and on auth page, redirect to intended destination
    if (user && pathname === '/auth') {
      const urlParams = new URLSearchParams(window.location.search)
      const returnUrl = urlParams.get('returnUrl') || '/'
      router.push(returnUrl)
      return
    }
  }, [user, loading, pathname, requireAuth, redirectTo, redirectAfterLogin, router])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    requiresAuth: requireAuth !== undefined ? requireAuth : !PUBLIC_PAGES.includes(pathname) && !PUBLIC_PAGE_PATTERNS.some(pattern => pattern.test(pathname))
  }
}

// Helper function to check if authentication is required for a specific action
export function checkAuthForAction(user: any, router: any, returnUrl?: string) {
  if (!user) {
    const authUrl = `/auth${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`
    router.push(authUrl)
    return false
  }
  return true
}
