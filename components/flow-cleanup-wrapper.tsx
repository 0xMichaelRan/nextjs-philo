"use client"

import { useEffect } from 'react'
import { useFlowStore } from '@/lib/store'

interface FlowCleanupWrapperProps {
  children: React.ReactNode
}

/**
 * Simplified wrapper that handles automatic cleanup of expired flow data
 * Integrates cleanup directly without an extra provider layer
 */
export function FlowCleanupWrapper({ children }: FlowCleanupWrapperProps) {
  const checkAndCleanupExpired = useFlowStore((state) => state.checkAndCleanupExpired)

  useEffect(() => {
    // Check for expired data on mount
    checkAndCleanupExpired()

    // Set up periodic cleanup (every 5 minutes)
    const interval = setInterval(() => {
      checkAndCleanupExpired()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [checkAndCleanupExpired])

  // Also check when the page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAndCleanupExpired()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [checkAndCleanupExpired])

  return <>{children}</>
}
