"use client"

import { useState } from "react"
import { Bell, Video, CreditCard, Newspaper } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

const mockNotifications = [
  {
    id: 1,
    type: "video_completed",
    title: "视频生成完成",
    titleEn: "Video Generation Completed",
    message: "您的电影《肖申克的救赎》分析视频已生成完成",
    messageEn: "Your analysis video for 'The Shawshank Redemption' has been completed",
    timestamp: "2024-01-21 15:30",
    read: false,
  },
  {
    id: 2,
    type: "payment_success",
    title: "支付成功",
    titleEn: "Payment Successful",
    message: "您的VIP年度会员支付已成功，会员权益已激活",
    messageEn: "Your VIP annual membership payment was successful",
    timestamp: "2024-01-20 14:20",
    read: false,
  },
  {
    id: 3,
    type: "video_processing",
    title: "视频处理中",
    titleEn: "Video Processing",
    message: "您的电影《霸王别姬》分析视频正在处理中",
    messageEn: "Your analysis video for 'Farewell My Concubine' is being processed",
    timestamp: "2024-01-21 14:45",
    read: true,
  },
]

const mockNews = [
  {
    id: 1,
    title: "新增SVIP会员等级",
    titleEn: "New SVIP Membership Tier",
    message: "我们推出了全新的SVIP会员等级，享受更多专属特权",
    messageEn: "We've launched a new SVIP membership tier with exclusive benefits",
    timestamp: "2024-01-19 10:00",
    read: false,
  },
  {
    id: 2,
    title: "AI分析引擎升级",
    titleEn: "AI Analysis Engine Upgrade",
    message: "我们的AI分析引擎已升级，生成的视频质量更高",
    messageEn: "Our AI analysis engine has been upgraded for higher quality videos",
    timestamp: "2024-01-18 16:30",
    read: true,
  },
  {
    id: 3,
    title: "春节活动预告",
    titleEn: "Spring Festival Event Preview",
    message: "春节期间将有特别优惠活动，敬请期待",
    messageEn: "Special offers coming during Spring Festival, stay tuned",
    timestamp: "2024-01-17 09:15",
    read: true,
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("notifications")
  const { theme } = useTheme()
  const { language } = useLanguage()

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
        return <CreditCard className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const unreadNotifications = mockNotifications.filter((n) => !n.read).length
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
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="news" className={`${themeClasses.text} relative`}>
                {language === "zh" ? "产品资讯" : "Product News"}
                {unreadNews > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                    {unreadNews}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`${themeClasses.card} ${
                      !notification.read ? `ring-2 ring-gradient-to-r ${themeClasses.accent}` : ""
                    } transition-all duration-200 hover:shadow-lg`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-white/10"}`}>
                          {getIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`${themeClasses.text} font-semibold`}>
                              {language === "zh" ? notification.title : notification.titleEn}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                              <span className={`${themeClasses.secondaryText} text-sm whitespace-nowrap`}>
                                {notification.timestamp}
                              </span>
                            </div>
                          </div>

                          <p className={`${themeClasses.secondaryText} leading-relaxed`}>
                            {language === "zh" ? notification.message : notification.messageEn}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockNotifications.length === 0 && (
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
              <div className="space-y-4">
                {mockNews.map((news) => (
                  <Card
                    key={news.id}
                    className={`${themeClasses.card} ${
                      !news.read ? `ring-2 ring-gradient-to-r ${themeClasses.accent}` : ""
                    } transition-all duration-200 hover:shadow-lg`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-white/10"}`}>
                          <Newspaper className="w-5 h-5 text-purple-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`${themeClasses.text} font-semibold`}>
                              {language === "zh" ? news.title : news.titleEn}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {!news.read && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                              <span className={`${themeClasses.secondaryText} text-sm whitespace-nowrap`}>
                                {news.timestamp}
                              </span>
                            </div>
                          </div>

                          <p className={`${themeClasses.secondaryText} leading-relaxed`}>
                            {language === "zh" ? news.message : news.messageEn}
                          </p>
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
