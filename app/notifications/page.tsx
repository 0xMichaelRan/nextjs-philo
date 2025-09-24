"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Video, CreditCard, Newspaper, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"
import { usePageTitle } from "@/hooks/use-page-title"
import { Button } from "@/components/ui/button"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { newsDataManager, type NewsItem } from "@/lib/news-data"

// Types for notifications from backend API
interface Notification {
  id: number
  user_id: number
  title_zh: string
  title_en?: string
  message_zh: string
  message_en?: string
  type: string
  cta_url?: string
  is_read: boolean
  created_at: string
}

interface NotificationList {
  notifications: Notification[]
  unread_count: number
}



export default function NotificationsPage() {
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()

  // Notifications page doesn't require authentication
  useAuthGuard({ requireAuth: false })

  const [activeTab, setActiveTab] = useState(user ? "notifications" : "news")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const notificationsPerPage = 10

  // Set page title
  usePageTitle('notifications')

  // Load news data
  const loadNewsData = () => {
    setNewsLoading(true)
    try {
      const news = newsDataManager.getAllNews()
      setNewsItems(news)
    } catch (err) {
      console.error('Error loading news data:', err)
    } finally {
      setNewsLoading(false)
    }
  }

  // Load news data on component mount
  useEffect(() => {
    loadNewsData()
  }, [])

  // Update active tab based on user login status
  useEffect(() => {
    if (!user && activeTab === "notifications") {
      // If user logs out and is on notifications tab, switch to news
      setActiveTab("news")
    }
    // Don't automatically switch logged-in users away from news tab
  }, [user, activeTab])

  // Fetch notifications from backend API
  const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true)
      }
      setError(null)

      const offset = (page - 1) * notificationsPerPage
      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.notifications.list()}?limit=${notificationsPerPage}&offset=${offset}`
      )

      if (response.ok) {
        const data: NotificationList = await response.json()

        if (append) {
          setNotifications(prev => [...prev, ...data.notifications])
        } else {
          setNotifications(data.notifications)
        }

        setUnreadCount(data.unread_count)
        setHasMore(data.notifications.length === notificationsPerPage)
        setTotalNotifications(data.unread_count + data.notifications.filter(n => n.is_read).length)
      } else {
        throw new Error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError("Failed to load notifications")
      // Set empty state on error
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    // First update the UI immediately for better UX
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    // Then update the backend asynchronously
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.notifications.markRead(notificationId),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_read: true }),
        }
      )

      if (!response.ok) {
        // If backend update fails, revert the UI change
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: false }
              : notification
          )
        )
        setUnreadCount(prev => prev + 1)
        console.error("Failed to mark notification as read")
      }
    } catch (error) {
      // If network error, revert the UI change
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: false }
            : notification
        )
      )
      setUnreadCount(prev => prev + 1)
      console.error("Error marking notification as read:", error)
    }
  }

  // Handle CTA button click with navigation stack clearing
  const handleCtaClick = (ctaUrl: string) => {
    // Clear navigation stack and navigate to the CTA URL
    window.history.replaceState(null, '', ctaUrl)
    router.push(ctaUrl)
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // First update the UI immediately for better UX
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, is_read: true }))
    )
    setUnreadCount(0)

    // Then update the backend asynchronously
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.notifications.markAllRead(),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        // If backend update fails, reload notifications to get correct state
        fetchNotifications()
        console.error("Failed to mark all notifications as read")
      }
    } catch (error) {
      // If network error, reload notifications to get correct state
      fetchNotifications()
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Load notifications on component mount and when user changes
  useEffect(() => {
    if (user) {
      setCurrentPage(1)
      fetchNotifications(1, false)
    }
  }, [user])

  // Load more notifications when page changes
  useEffect(() => {
    if (user && currentPage > 1) {
      fetchNotifications(currentPage, true)
    }
  }, [currentPage])

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "theme-text-primary",
        secondaryText: "theme-text-secondary",
        card: "theme-bg-elevated border-gray-200/50",
        accent: "theme-brand-primary",
      }
    }
    return {
      background: "theme-gradient-hero",
      text: "theme-text-primary",
      secondaryText: "theme-text-secondary",
      card: "theme-surface-elevated border-white/20",
      accent: "theme-brand-primary",
    }
  }

  const themeClasses = getThemeClasses()

  const getIcon = (type: string) => {
    const iconColors = theme === "light"
      ? {
          video: "theme-status-success",
          payment: "theme-status-info",
          profile: "theme-brand-primary",
          default: "theme-text-muted"
        }
      : {
          video: "theme-status-success",
          payment: "theme-status-info",
          profile: "theme-brand-primary",
          default: "theme-text-muted"
        }

    switch (type) {
      case "video_completed":
      case "video_processing":
        return <Video className={`w-5 h-5 ${iconColors.video}`} />
      case "payment_success":
      case "success":
        return <CreditCard className={`w-5 h-5 ${iconColors.payment}`} />
      case "profile_update":
        return <User className={`w-5 h-5 ${iconColors.profile}`} />
      default:
        return <Bell className={`w-5 h-5 ${iconColors.default}`} />
    }
  }

  // Format timestamp for display - returns object with date and time
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const dateStr = date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      const timeStr = date.toLocaleTimeString(language === "zh" ? "zh-CN" : "en-US", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      return { date: dateStr, time: timeStr }
    } catch {
      return { date: timestamp, time: '' }
    }
  }

  // Product news don't have read/unread status

  return (
    <div className={themeClasses.background}>
      <AppLayout >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div
              className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r ${themeClasses.accent} mb-4`}
            >
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className={`${themeClasses.text} text-2xl sm:text-3xl font-bold mb-2`}>
              {language === "zh" ? "通知中心" : "Notification Center"}
            </h1>
            <p className={`${themeClasses.secondaryText} text-sm sm:text-base`}>
              {language === "zh" ? "及时了解您的视频状态和产品动态" : "Stay updated with your videos and product news"}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${user ? 'grid-cols-2' : 'grid-cols-1'} mb-8 ${theme === "light" ? "bg-white/50" : "bg-white/10"}`}>
              {user && (
                <TabsTrigger value="notifications" className={`${themeClasses.text} relative py-3 px-6 text-sm font-medium transition-all`}>
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>{language === "zh" ? "系统通知" : "Notifications"}</span>
                    {unreadCount > 0 && (
                      <Badge className="ml-1 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              )}
              <TabsTrigger value="news" className={`${themeClasses.text} relative py-3 px-6 text-sm font-medium transition-all`}>
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-4 h-4" />
                  <span>{language === "zh" ? "产品资讯" : "Product News"}</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              {/* Notifications Header with Mark All as Read */}
              {!isLoading && !error && notifications.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`${themeClasses.text} text-lg font-semibold`}>
                    {language === "zh" ? "通知列表" : "Notifications"}
                  </h2>
                  {unreadCount > 0 && (
                    <Button
                      onClick={markAllAsRead}
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    >
                      {language === "zh" ? "全部标记为已读" : "Mark All as Read"}
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {isLoading ? (
                  <Card className={`${themeClasses.card} text-center`}>
                    <CardContent className="p-12">
                      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4 ${theme === "light" ? "border-purple-600" : "border-violet-400"}`}></div>
                      <p className={`${themeClasses.secondaryText}`}>
                        {language === "zh" ? "加载中..." : "Loading..."}
                      </p>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card className={`${themeClasses.card} text-center`}>
                    <CardContent className="p-12">
                      <Bell className={`w-16 h-16 mx-auto mb-4 ${theme === "light" ? "text-red-600" : "text-red-400"}`} />
                      <h3 className={`${themeClasses.text} text-xl font-semibold mb-2`}>
                        {language === "zh" ? "加载失败" : "Failed to load"}
                      </h3>
                      <p className={`${themeClasses.secondaryText} mb-4`}>
                        {error}
                      </p>
                      <button
                        onClick={() => fetchNotifications()}
                        className={`px-4 py-2 rounded-lg transition-colors text-white ${theme === "light" ? "bg-purple-600 hover:bg-purple-700" : "bg-violet-500 hover:bg-violet-600"}`}
                      >
                        {language === "zh" ? "重试" : "Retry"}
                      </button>
                    </CardContent>
                  </Card>
                ) : notifications.length > 0 ? (
                  <div className="grid gap-4 md:gap-6">
                    {notifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={`${themeClasses.card} ${
                          !notification.is_read
                            ? `ring-2 shadow-lg border ${theme === "light" ? "ring-purple-400 bg-purple-50/50 border-purple-200" : "ring-violet-400 bg-violet-900/20 border-violet-500/30"}`
                            : ""
                        } transition-all duration-200 hover:shadow-lg ${notification.cta_url ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-pointer'} relative group`}
                        onClick={() => {
                          if (!notification.is_read) {
                            markAsRead(notification.id)
                          }
                          if (notification.cta_url) {
                            handleCtaClick(notification.cta_url)
                          }
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4 h-full">
                            <div className={`p-3 rounded-full flex-shrink-0 ${theme === "light" ? "bg-gray-100" : "bg-white/10"}`}>
                              {getIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col h-full">
                              {/* Header with title and timestamp */}
                              <div className="flex items-start justify-between mb-3">
                                <h3 className={`${themeClasses.text} font-semibold text-base leading-tight line-clamp-2 flex-1 pr-2`}>
                                  {language === "zh"
                                    ? notification.title_zh
                                    : (notification.title_en || notification.title_zh)
                                  }
                                </h3>
                                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                                  {!notification.is_read && (
                                    <div className="flex items-center space-x-1">
                                      <div className={`w-2 h-2 rounded-full animate-pulse ${theme === "light" ? "bg-purple-500" : "bg-violet-400"}`}></div>
                                      <span className={`text-xs font-medium ${theme === "light" ? "text-purple-600" : "text-violet-400"}`}>
                                        {language === "zh" ? "新" : "NEW"}
                                      </span>
                                    </div>
                                  )}
                                  <div className={`${themeClasses.secondaryText} text-xs text-right`}>
                                    {(() => {
                                      const { date, time } = formatTimestamp(notification.created_at)
                                      return (
                                        <>
                                          <div className="whitespace-nowrap">{date}</div>
                                          <div className="whitespace-nowrap">{time}</div>
                                        </>
                                      )
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* Message content */}
                              <p className={`${themeClasses.secondaryText} leading-relaxed text-sm line-clamp-3 flex-1`}>
                                {language === "zh"
                                  ? notification.message_zh
                                  : (notification.message_en || notification.message_zh)
                                }
                              </p>

                              {/* CTA indicator for clickable cards */}
                              {notification.cta_url && (
                                <div className="mt-3 flex items-center justify-between">
                                  <span className={`text-xs ${theme === "light" ? "text-purple-600" : "text-violet-400"} font-medium`}>
                                    {language === "zh" ? "点击查看详情" : "Click to view details"}
                                  </span>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${theme === "light" ? "bg-purple-100 text-purple-600" : "bg-violet-900/50 text-violet-400"} group-hover:scale-110 transition-transform`}>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className={`${themeClasses.card} text-center`}>
                    <CardContent className="p-12">
                      <Bell className={`w-16 h-16 mx-auto mb-4 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`} />
                      <h3 className={`${themeClasses.text} text-xl font-semibold mb-2`}>
                        {language === "zh" ? "暂无通知" : "No notifications"}
                      </h3>
                      <p className={`${themeClasses.secondaryText}`}>
                        {language === "zh"
                          ? "当有新的视频生成或支付完成时，您会在这里收到通知"
                          : "You'll receive notifications here when videos are generated or payments are completed"}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Pagination Controls */}
                {notifications.length > 0 && hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={isLoading}
                      variant="outline"
                      className="px-8 py-3"
                    >
                      {isLoading
                        ? (language === "zh" ? "加载中..." : "Loading...")
                        : (language === "zh" ? "加载更多" : "Load More")
                      }
                    </Button>
                    <p className={`${themeClasses.secondaryText} text-sm mt-2`}>
                      {language === "zh"
                        ? `已显示 ${notifications.length} 条通知`
                        : `Showing ${notifications.length} notifications`
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news">
              {newsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className={`ml-3 ${themeClasses.text}`}>
                    {language === "zh" ? "加载中..." : "Loading..."}
                  </span>
                </div>
              ) : (
                <div className="grid gap-4 md:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {newsItems.map((news) => (
                    <Card
                      key={news.id}
                      className={`${themeClasses.card} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden relative cursor-pointer group h-[280px] flex flex-col`}
                      onClick={() => {
                        window.open(news.url, '_blank')
                      }}
                    >
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${news.image})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
                      </div>

                      <CardContent className="p-6 relative z-10 flex flex-col h-full">
                        {/* Header with date and click indicator */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Newspaper className="w-4 h-4 text-white/80" />
                            <span className="text-white/80 text-xs font-medium">
                              {new Date(news.publishedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}
                            </span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>

                        {/* Title - Limited to 2 lines */}
                        <h3 className="text-white text-lg font-bold leading-tight line-clamp-2 mb-3 flex-shrink-0">
                          {language === "zh" ? news.title : news.titleEn}
                        </h3>

                        {/* Summary - Limited to 2 lines */}
                        <p className="text-white/90 leading-relaxed text-sm line-clamp-2 flex-1">
                          {language === "zh" ? news.summary : news.summaryEn}
                        </p>

                        {/* Click indicator */}
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20">
                          <span className="text-white/80 text-xs font-medium">
                            {language === "zh" ? "点击阅读全文" : "Click to read more"}
                          </span>
                          <div className="flex items-center space-x-1 text-white/60">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>
                  ))}

                  {newsItems.length === 0 && !newsLoading && (
                    <Card className={`${themeClasses.card} text-center`}>
                      <CardContent className="p-12">
                        <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className={`${themeClasses.text} text-xl font-semibold mb-2`}>
                          {language === "zh" ? "暂无资讯" : "No news"}
                        </h3>
                        <p className={`${themeClasses.secondaryText}`}>
                          {language === "zh"
                            ? "我们会在这里发布产品更新和重要资讯"
                            : "We'll post product updates and important news here"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </div>
  )
}
