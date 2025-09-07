"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"
import { apiConfig } from "@/lib/api-config"
import Link from "next/link"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [hasNew, setHasNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { theme } = useTheme()
  const { onNotificationUpdate } = useRealtimeNotifications()

  // Initial check for new notifications (fallback)
  const checkNewNotifications = async () => {
    if (!user || isLoading) return

    try {
      setIsLoading(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.notifications.hasNew(),
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        setHasNew(data.has_new)
      }
    } catch (error) {
      console.error('Error checking new notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notifications as seen when user clicks the bell
  const markAsSeen = async () => {
    if (!user || !hasNew) return

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.notifications.markSeen(),
        { method: 'POST' }
      )

      if (response.ok) {
        setHasNew(false)
      }
    } catch (error) {
      console.error('Error marking notifications as seen:', error)
    }
  }

  // Check for new notifications on mount (initial load only)
  useEffect(() => {
    if (user) {
      checkNewNotifications()
    }
  }, [user])

  // Subscribe to real-time notification updates
  useEffect(() => {
    if (!user) return

    const unsubscribe = onNotificationUpdate((data) => {
      setHasNew(data.has_new)
    })

    return unsubscribe
  }, [user, onNotificationUpdate])

  // Listen for storage events to sync across tabs (keep for backward compatibility)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notification_check_trigger') {
        checkNewNotifications()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleClick = () => {
    if (hasNew) {
      markAsSeen()
    }
    // Trigger storage event to sync across tabs
    localStorage.setItem('notification_check_trigger', Date.now().toString())
  }

  return (
    <Link href="/notifications" onClick={handleClick}>
      <Button
        variant="ghost"
        size="sm"
        className={`relative ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"} ${className}`}
      >
        <Bell className="w-5 h-5" />
        {/* dark-theme refactor */}
        {hasNew && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse">
            <div className="absolute inset-0 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
          </div>
        )}
      </Button>
    </Link>
  )
}
