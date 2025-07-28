"use client"

import { useState, useEffect } from "react"
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

// Types for notifications from backend API
interface Notification {
  id: number
  user_id: string
  title_zh: string
  title_en?: string
  message_zh: string
  message_en?: string
  type: string
  is_read: boolean
  created_at: string
}

interface NotificationList {
  notifications: Notification[]
  unread_count: number
}

// Mock news data (keeping this as it's not part of the backend API yet)
const mockNews = [
  {
    id: 1,
    title: "新增SVIP会员等级",
    titleEn: "New SVIP Membership Tier",
    message: "我们推出了全新的SVIP会员等级，享受更多专属特权和高级功能，包括无限视频生成、优先处理队列、专属客服支持等。",
    messageEn: "We've launched a new SVIP membership tier with exclusive benefits and advanced features, including unlimited video generation, priority processing queue, and dedicated customer support.",
    timestamp: "2025-07-19 10:00",
    externalLink: "https://example.com/svip-announcement",
    category: "产品更新",
    categoryEn: "Product Update",
  },
  {
    id: 2,
    title: "AI分析引擎升级",
    titleEn: "AI Analysis Engine Upgrade",
    message: "我们的AI分析引擎已全面升级，采用最新的深度学习技术，生成的视频质量更高，分析更加深入准确。",
    messageEn: "Our AI analysis engine has been comprehensively upgraded with the latest deep learning technology for higher quality videos and more accurate analysis.",
    timestamp: "2025-06-18 16:30",
    externalLink: "https://example.com/ai-upgrade",
    category: "技术更新",
    categoryEn: "Tech Update",
  },
  {
    id: 3,
    title: "春节活动预告",
    titleEn: "Spring Festival Event Preview",
    message: "春节期间将有特别优惠活动，VIP会员享受额外折扣，还有限时免费试用等精彩活动，敬请期待！",
    messageEn: "Special offers coming during Spring Festival with extra discounts for VIP members and limited-time free trials. Stay tuned for exciting events!",
    timestamp: "2025-04-17 09:15",
    externalLink: "https://example.com/spring-festival-event",
    category: "活动预告",
    categoryEn: "Event Preview",
  },
]

export default function NotificationsPage() {
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState(user ? "notifications" : "news")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set page title
  usePageTitle('notifications')

  // Update active tab based on user login status
  useEffect(() => {
    if (!user && activeTab === "notifications") {
      setActiveTab("news")
    } else if (user && activeTab === "news") {
      setActiveTab("notifications")
    }
  }, [user, activeTab])

  // Fetch notifications from backend API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.notifications.list()
      )

      if (response.ok) {
        const data: NotificationList = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
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
          method: 'PATCH',
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

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [user])

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
        accent: "from-purple-500 to-pink-500",
      }
    }
    return {
      background: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
      accent: "from-purple-400 to-pink-400",
    }
  }

  const themeClasses = getThemeClasses()

  const getIcon = (type: string) => {
    switch (type) {
      case "video_completed":
      case "video_processing":
        return <Video className="w-5 h-5 text-green-500" />
      case "payment_success":
      case "success":
        return <CreditCard className="w-5 h-5 text-blue-500" />
      case "profile_update":
        return <User className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
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
      <AppLayout title={language === "zh" ? "通知中心" : "Notifications"}>
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
              <div className="space-y-4">
                {isLoading ? (
                  <Card className={`${themeClasses.card} text-center`}>
                    <CardContent className="p-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className={`${themeClasses.secondaryText}`}>
                        {language === "zh" ? "加载中..." : "Loading..."}
                      </p>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card className={`${themeClasses.card} text-center`}>
                    <CardContent className="p-12">
                      <Bell className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <h3 className={`${themeClasses.text} text-xl font-semibold mb-2`}>
                        {language === "zh" ? "加载失败" : "Failed to load"}
                      </h3>
                      <p className={`${themeClasses.secondaryText} mb-4`}>
                        {error}
                      </p>
                      <button
                        onClick={fetchNotifications}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                          ? `ring-2 ring-blue-400 shadow-lg ${theme === "light" ? "bg-blue-50/50" : "bg-blue-900/20"} border-blue-200`
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
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
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

                            <p className={`${themeClasses.secondaryText} leading-relaxed`}>
                              {language === "zh"
                                ? notification.message_zh
                                : (notification.message_en || notification.message_zh)
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className={`${themeClasses.card} text-center`}>
                    <CardContent className="p-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
              </div>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {mockNews.map((news) => (
                  <Card
                    key={news.id}
                    className={`${themeClasses.card} transition-all hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-purple-500 bg-gradient-to-r ${
                      theme === "light"
                        ? "from-purple-50 to-white hover:from-purple-100"
                        : "from-purple-900/20 to-transparent hover:from-purple-800/30"
                    }`}
                    onClick={(e) => {
                      // Only show animation, don't open link
                      e.preventDefault()
                      const readMoreBtn = e.currentTarget.querySelector('[data-read-more]') as HTMLElement
                      const target = e.target as HTMLElement
                      if (readMoreBtn && !target?.closest('[data-read-more]')) {
                        // Add highlight animation to read more button
                        readMoreBtn.classList.add('ring-2', 'ring-purple-400', 'ring-opacity-75', 'scale-105')
                        readMoreBtn.style.transition = 'all 0.2s ease-in-out'
                        setTimeout(() => {
                          readMoreBtn.classList.remove('ring-2', 'ring-purple-400', 'ring-opacity-75', 'scale-105')
                        }, 800)
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Title */}
                        <h3 className={`${themeClasses.text} text-xl font-bold leading-tight`}>
                          {language === "zh" ? news.title : news.titleEn}
                        </h3>

                        {/* Date below title */}
                        <div className="flex items-center space-x-2">
                          <span className={`${themeClasses.secondaryText} text-sm`}>
                            {news.timestamp}
                          </span>
                        </div>

                        {/* Content */}
                        <p className={`${themeClasses.secondaryText} leading-relaxed text-sm`}>
                          {language === "zh" ? news.message : news.messageEn}
                        </p>

                        {/* Category and Read more link */}
                        <div className="flex items-center justify-between pt-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            theme === "light"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-purple-800/50 text-purple-300"
                          }`}>
                            {language === "zh" ? news.category : news.categoryEn}
                          </div>

                          <button
                            data-read-more
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(news.externalLink, '_blank')
                            }}
                            className="flex items-center space-x-2 text-purple-500 hover:text-purple-600 transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-2 rounded-lg"
                          >
                            <span className="text-sm font-medium">
                              {language === "zh" ? "阅读全文" : "Read More"}
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockNews.length === 0 && (
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
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </div>
  )
}
