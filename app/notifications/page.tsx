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
  title: string
  message: string
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
  const [activeTab, setActiveTab] = useState("notifications")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { user } = useAuth()

  // Set page title
  usePageTitle('notifications')

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
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.notifications.markRead(notificationId),
        {
          method: 'PATCH',
        }
      )

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
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

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString(language === "zh" ? "zh-CN" : "en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return timestamp
    }
  }

  const unreadNews = mockNews.filter((n) => !n.read).length

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
            <TabsList className={`grid w-full grid-cols-2 mb-8 ${theme === "light" ? "bg-white/50" : "bg-white/10"}`}>
              <TabsTrigger value="notifications" className={`${themeClasses.text} relative`}>
                {language === "zh" ? "系统通知" : "Notifications"}
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
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
                        !notification.is_read ? `ring-2 ring-gradient-to-r ${themeClasses.accent}` : ""
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
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                <span className={`${themeClasses.secondaryText} text-sm whitespace-nowrap`}>
                                  {formatTimestamp(notification.created_at)}
                                </span>
                              </div>
                            </div>

                            <p className={`${themeClasses.secondaryText} leading-relaxed`}>
                              {notification.message}
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
                    className={`${themeClasses.card} transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer border-l-4 border-l-purple-500 bg-gradient-to-r ${
                      theme === "light"
                        ? "from-purple-50 to-white hover:from-purple-100"
                        : "from-purple-900/20 to-transparent hover:from-purple-800/30"
                    }`}
                    onClick={() => window.open(news.externalLink, '_blank')}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header with category and date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              theme === "light"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-purple-800/50 text-purple-300"
                            }`}>
                              {language === "zh" ? news.category : news.categoryEn}
                            </div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span className={`${themeClasses.secondaryText} text-sm`}>
                              {news.timestamp}
                            </span>
                          </div>
                          <div className={`p-2 rounded-full ${
                            theme === "light" ? "bg-purple-100" : "bg-purple-800/30"
                          }`}>
                            <Newspaper className="w-5 h-5 text-purple-500" />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className={`${themeClasses.text} text-xl font-bold leading-tight`}>
                          {language === "zh" ? news.title : news.titleEn}
                        </h3>

                        {/* Content */}
                        <p className={`${themeClasses.secondaryText} leading-relaxed text-sm`}>
                          {language === "zh" ? news.message : news.messageEn}
                        </p>

                        {/* Read more link */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2 text-purple-500 hover:text-purple-600 transition-colors">
                            <span className="text-sm font-medium">
                              {language === "zh" ? "阅读全文" : "Read More"}
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
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
