"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Clock, Film, User, Play, Search, Menu, X, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VipBadge } from "@/components/vip-badge"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"
import { NotificationBell } from "@/components/notification-bell"
import { GlobalFooter } from "@/components/global-footer"
import { apiConfig } from "@/lib/api-config"
import Header from "@/components/layout/Header"

interface UserStats {
  dailyRemaining: number
  totalGenerated: number
  failedJobs: number
  monthlyUsed: number
  monthlyLimit: number | null
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useTheme()
  const { user, logout } = useAuth()
    const { onJobUpdate } = useRealtimeNotifications()


  // Ensure cards are visible on page load
  useEffect(() => {
  }, [])
  // Subscribe to real-time job updates to refresh stats
  useEffect(() => {
    if (!user) return

    const unsubscribe = onJobUpdate((data) => {
      // Refresh stats when a job completes or fails
      if (data.status === 'completed' || data.status === 'failed') {
        fetchUserStats()
      }
    })

    return unsubscribe
  }, [user, onJobUpdate])

  const fetchUserStats = async () => {
    if (!user || statsLoading) return

    try {
      setStatsLoading(true)

      // Fetch VIP status and usage statistics
      const vipResponse = await apiConfig.makeAuthenticatedRequest(
        apiConfig.videoJobs.vipStatus(),
        { method: 'GET' }
      )

      if (vipResponse.ok) {
        const vipData = await vipResponse.json()

        // Get proper daily limits from user limits API
        const limitsResponse = await apiConfig.makeAuthenticatedRequest(
          apiConfig.auth.userLimits(),
          { method: 'GET' }
        )

        let dailyRemaining = 0
        if (limitsResponse.ok) {
          const limits = await limitsResponse.json()
          const dailyUsed = limits.daily_jobs_used || 0
          const dailyLimit = limits.limits?.daily_limit || (user.is_vip ? (user.is_svip ? 99 : 10) : 2)
          dailyRemaining = Math.max(0, dailyLimit - dailyUsed)
        } else {
          // Fallback calculation
          const monthlyUsed = vipData.usage?.monthly_jobs?.current || 0
          const monthlyLimit = vipData.usage?.monthly_jobs?.limit
          dailyRemaining = monthlyLimit ? Math.max(0, monthlyLimit - monthlyUsed) : (user.is_vip ? (user.is_svip ? 99 : 10) : 2)
        }

        // Fetch total video count
        const videosResponse = await apiConfig.makeAuthenticatedRequest(
          apiConfig.videoJobs.list(),
          { method: 'GET' }
        )

        let totalGenerated = 0
        let failedJobs = 0
        const monthlyUsed = vipData.usage?.monthly_jobs?.current || 0
        const monthlyLimit = vipData.usage?.monthly_jobs?.limit || 0

        if (videosResponse.ok) {
          const videos = await videosResponse.json()
          // Only count completed and pending jobs, ignore failed jobs
          const validJobs = videos.filter((job: any) =>
            job.status === 'completed' || job.status === 'pending' || job.status === 'processing' || job.status === 'queued'
          )
          const failedJobsList = videos.filter((job: any) => job.status === 'failed')
          totalGenerated = validJobs.length || 0
          failedJobs = failedJobsList.length || 0
        }

        setUserStats({
          dailyRemaining,
          totalGenerated,
          failedJobs,
          monthlyUsed,
          monthlyLimit
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    }
    return "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900"
  }



  const handleOutsideClick = () => {
    setIsNavOpen(false)
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div>
        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

        {/* Global Footer */}
        <GlobalFooter />
      </div>
    </div>
  )
}
