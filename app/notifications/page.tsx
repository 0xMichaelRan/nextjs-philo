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
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${themeClasses.accent} mb-4`}
            >
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className={`${themeClasses.text} text-3xl font-bold mb-2`}>
              {language === "zh" ? "通知中心" : "Notification Center"}
            </h1>
            <p className={`${themeClasses.secondaryText}`}>
              {language === "zh" ? "及时了解您的视频状态和产品动态" : "Stay updated with your videos and product news"}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${user ? 'grid-cols-2' : 'grid-cols-1'} mb-8 ${theme === "light" ? "bg-white/50" : "bg-white/10"}`}>
              {user && (
                <TabsTrigger value="notifications" className={`${themeClasses.text} relative`}>
                  {language === "zh" ? "系统通知" : "Notifications"}
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger value="news" className={`${themeClasses.text} relative`}>
                {language === "zh" ? "产品资讯" : "Product News"}
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
                  notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`${themeClasses.card} ${
                        !notification.is_read
                          ? `ring-2 shadow-lg border ${theme === "light" ? "ring-purple-400 bg-purple-50/50 border-purple-200" : "ring-violet-400 bg-violet-900/20 border-violet-500/30"}`
                          : ""
                      } transition-all duration-200 hover:shadow-lg cursor-pointer`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-white/10"}`}>
                            {getIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`${themeClasses.text} font-semibold`}>
                                {language === "zh"
                                  ? notification.title_zh
                                  : (notification.title_en || notification.title_zh)
                                }
                              </h3>
                              <div className="flex items-center space-x-2">
                                {!notification.is_read && (
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${theme === "light" ? "bg-purple-500" : "bg-violet-400"}`}></div>
                                    <span className={`text-xs font-medium ${theme === "light" ? "text-purple-600" : "text-violet-400"}`}>
                                      {language === "zh" ? "新" : "NEW"}
                                    </span>
                                  </div>
                                )}
                                <div className={`${themeClasses.secondaryText} text-sm text-right`}>
                                  {(() => {
                                    const { date, time } = formatTimestamp(notification.created_at)
                                    return (
                                      <>
                                        <div className="whitespace-nowrap">{date}</div>
                                        <div className="whitespace-nowrap text-xs">{time}</div>
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            </div>

                            <p className={`${themeClasses.secondaryText} leading-relaxed mb-3`}>
                              {language === "zh"
                                ? notification.message_zh
                                : (notification.message_en || notification.message_zh)
                              }
                            </p>

                            {/* CTA Button */}
                            {notification.cta_url && (
                              <div className="mt-4">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Mark notification as read when clicking CTA button
                                    if (!notification.is_read) {
                                      markAsRead(notification.id)
                                    }
                                    handleCtaClick(notification.cta_url!)
                                  }}
                                  size="sm"
                                  className={`text-white ${theme === "light" ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : "bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600"}`}
                                >
                                  {language === "zh" ? "查看详情" : "View Details"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                  {newsItems.map((news) => (
                    <Card
                      key={news.id}
                      className={`${themeClasses.card} transition-all hover:shadow-xl hover:scale-[1.02] border-l-4 overflow-hidden relative cursor-pointer`}
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${news.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onClick={() => {
                        window.open(news.url, '_blank')
                      }}
                    >
                      <CardContent className="p-6 relative z-10">
                        <div className="flex gap-4">
                          {/* Image placeholder */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <img
                                src={news.image}
                                alt={language === "zh" ? news.title : news.titleEn}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-700">
                                      <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                      </svg>
                                    </div>
                                  `
                                }}
                              />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-3">
                            {/* Title - Limited to 2 lines */}
                            <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">
                              {language === "zh" ? news.title : news.titleEn}
                            </h3>

                            {/* Date only */}
                            <div className="flex items-center">
                              <span className="text-white/80 text-sm">
                                {new Date(news.publishedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}
                              </span>

                            </div>

                            {/* Summary */}
                            <p className="text-white/90 leading-relaxed text-sm line-clamp-2">
                              {language === "zh" ? news.summary : news.summaryEn}
                            </p>


                          </div>
                        </div>
                      </CardContent>
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
