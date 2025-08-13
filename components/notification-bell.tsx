"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
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

  // Check for new notifications
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

  // Check for new notifications on mount and periodically
  useEffect(() => {
    if (user) {
      checkNewNotifications()
      
      // Check every 30 seconds for new notifications
      const interval = setInterval(checkNewNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Listen for storage events to sync across tabs
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
        {hasNew && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </Button>
    </Link>
  )
}
