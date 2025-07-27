"use client"

import type React from "react"

import { useState } from "react"
import { User, Settings, CreditCard, Bell, Crown, Edit, Camera, QrCode, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiConfig } from "@/lib/api-config"

const mockBillingHistory = [
  {
    id: 1,
    date: "2024-01-20",
    amount: 261,
    type: "VIP年度会员",
    method: "支付宝",
    status: "completed",
    orderId: "VIP20240120001",
  },
  {
    id: 2,
    date: "2023-12-20",
    amount: 29,
    type: "VIP月度会员",
    method: "微信支付",
    status: "completed",
    orderId: "VIP20231220001",
  },
  {
    id: 3,
    date: "2023-11-20",
    amount: 29,
    type: "VIP月度会员",
    method: "支付宝",
    status: "completed",
    orderId: "VIP20231120001",
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    password: "",
  })
  const [preferences, setPreferences] = useState({
    language: "zh",
    theme: "dark",
    autoRenewal: true,
  })
  const [notifications, setNotifications] = useState({
    videoNotifications: true,
    newsletter: false,
    promotional: false,
  })

  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, updateUser, fetchUserProfile } = useAuth()
  const { toast } = useToast()

  // Initialize form with user data
  useState(() => {
    if (user) {
      setEditForm({
        name: user.name,
        password: "",
      })
    }
  })

  const getThemeClass = (light: string, dark: string) => {
    return theme === "light" ? light : dark
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Prepare update data
      const updateData: { name?: string; password?: string } = {}
      if (editForm.name && editForm.name !== user.name) {
        updateData.name = editForm.name
      }
      if (editForm.password && editForm.password.trim() !== "") {
        updateData.password = editForm.password
      }

      // If no changes, just close editing mode
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false)
        toast({
          title: language === "zh" ? "没有更改" : "No changes",
          description: language === "zh" ? "没有检测到任何更改" : "No changes detected",
          variant: "default",
        })
        return
      }

      // Call backend API to update profile
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.auth.updateUser(),
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      )

      if (response.ok) {
        const updatedProfile = await response.json()

        // Update local user state
        updateUser({
          name: updatedProfile.name,
        })

        // Refresh user profile to get latest data
        await fetchUserProfile()

        // Show success toast
        toast({
          title: language === "zh" ? "更新成功" : "Update Successful",
          description: language === "zh"
            ? "您的个人资料已成功更新"
            : "Your profile has been updated successfully",
          variant: "default",
        })

        // Clear password field and close editing mode
        setEditForm(prev => ({ ...prev, password: "" }))
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Update failed")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: language === "zh" ? "更新失败" : "Update Failed",
        description: error instanceof Error
          ? error.message
          : (language === "zh" ? "更新个人资料时出错" : "Error updating profile"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setIsLoading(true)

      // For now, we'll simulate avatar upload by storing it locally
      // In a real implementation, you would upload to a file storage service
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const avatarData = e.target?.result as string

          // Update local user state immediately for better UX
          updateUser({
            avatar: avatarData,
          })

          // Show success toast
          toast({
            title: language === "zh" ? "头像更新成功" : "Avatar Updated",
            description: language === "zh"
              ? "您的头像已成功更新"
              : "Your avatar has been updated successfully",
            variant: "default",
          })

          // Note: In a real implementation, you would also call the backend API
          // to save the avatar URL after uploading to a storage service
        } catch (error) {
          console.error("Error updating avatar:", error)
          toast({
            title: language === "zh" ? "头像更新失败" : "Avatar Update Failed",
            description: language === "zh"
              ? "更新头像时出错"
              : "Error updating avatar",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error processing avatar file:", error)
      toast({
        title: language === "zh" ? "文件处理失败" : "File Processing Failed",
        description: language === "zh"
          ? "处理头像文件时出错"
          : "Error processing avatar file",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const nextPaymentDate = user?.is_vip ? "2024-12-20" : null
  const nextPaymentAmount = user?.is_vip ? 261 : null
  const paymentMethod = user?.is_vip ? "支付宝" : null

  // Generate gradient colors for avatar placeholder
  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ]
    const index = name.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  if (!user) {
    return (
      <AppLayout title={t("profile.title")}>
        <div
          className={`min-h-screen ${getThemeClass("bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100", "bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900")}`}
        >
          <div className="container mx-auto px-4 py-8">
            <Card
              className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")} max-w-md mx-auto text-center`}
            >
              <CardContent className="p-8">
                <h2 className={`${getThemeClass("text-gray-900", "text-white")} text-xl font-bold mb-4`}>
                  {language === "zh" ? "请先登录" : "Please login first"}
                </h2>
                <Link href="/auth">
                  <Button className="bg-purple-600 hover:bg-purple-700">{t("nav.login")}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <div
      className={`min-h-screen ${getThemeClass("bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100", "bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900")}`}
    >
      <AppLayout title={t("profile.title")}>
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className={`grid w-full grid-cols-4 mb-6 ${getThemeClass("bg-gray-100", "bg-white/10")}`}>
              <TabsTrigger value="basics" className={getThemeClass("text-gray-800", "text-white")}>
                {t("profile.basics")}
              </TabsTrigger>
              <TabsTrigger value="preferences" className={getThemeClass("text-gray-800", "text-white")}>
                {t("profile.preferences")}
              </TabsTrigger>
              <TabsTrigger value="billing" className={getThemeClass("text-gray-800", "text-white")}>
                {t("profile.billing")}
              </TabsTrigger>
              <TabsTrigger value="notifications" className={getThemeClass("text-gray-800", "text-white")}>
                {t("profile.notifications")}
              </TabsTrigger>
            </TabsList>

            {/* Basics Tab */}
            <TabsContent value="basics">
              <div className="space-y-6">
                {/* User Info Card */}
                <Card
                  className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`${getThemeClass("text-gray-900", "text-white")} flex items-center`}>
                        <User className="w-5 h-5 mr-2" />
                        {t("profile.basics")}
                      </CardTitle>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="ghost"
                        size="sm"
                        className={`${getThemeClass("text-gray-800 hover:bg-gray-200", "text-white hover:bg-white/10")}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? t("profile.cancel") : t("profile.edit")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback
                            className={`text-2xl bg-gradient-to-br ${getAvatarGradient(user.name)} text-white`}
                          >
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <label htmlFor="avatar-upload">
                          <Button
                            size="sm"
                            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700 cursor-pointer"
                            asChild
                          >
                            <span>
                              <Camera className="w-4 h-4" />
                            </span>
                          </Button>
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`${getThemeClass("text-gray-900", "text-white")} text-xl font-semibold`}>
                            {user.name}
                          </h3>
                          {user.is_vip && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                              <Crown className="w-3 h-3 mr-1" />
                              VIP
                            </Badge>
                          )}
                        </div>
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                          {t("profile.joinDate")}: {user.created_at.split("T")[0]}
                        </p>
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                          {t("profile.totalGenerated")}: 15{t("profile.videos")}
                        </p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className={getThemeClass("text-gray-900", "text-white")}>
                            {t("profile.username")}
                          </Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            className={getThemeClass(
                              "bg-gray-100 border-gray-300 text-gray-900",
                              "bg-white/5 border-white/20 text-white",
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className={getThemeClass("text-gray-900", "text-white")}>
                            {t("profile.password")}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="输入新密码（可选）"
                            value={editForm.password}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                            className={getThemeClass(
                              "bg-gray-100 border-gray-300 text-gray-900",
                              "bg-white/5 border-white/20 text-white",
                            )}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {language === "zh" ? "保存中..." : "Saving..."}
                              </>
                            ) : (
                              t("profile.save")
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditing(false)
                              setEditForm(prev => ({ ...prev, password: "" }))
                            }}
                            variant="outline"
                            disabled={isLoading}
                          >
                            {t("profile.cancel")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className={getThemeClass("text-gray-600", "text-gray-400")}>
                            Email
                          </Label>
                          <p className={getThemeClass("text-gray-900", "text-white")}>{user.email}</p>
                          <p className={`${getThemeClass("text-gray-500", "text-gray-400")} text-xs mt-1`}>
                            Email address cannot be changed
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* VIP Status */}
                {!user.is_vip && (
                  <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
                    <CardContent className="p-6 text-center">
                      <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className={`${getThemeClass("text-gray-900", "text-white")} text-xl font-semibold mb-2`}>
                        {language === "zh" ? "升级VIP会员" : "Upgrade to VIP"}
                      </h3>
                      <p className={`${getThemeClass("text-gray-600", "text-gray-300")} mb-4`}>
                        {language === "zh"
                          ? "解锁无限生成、高清画质、优先处理等特权"
                          : "Unlock unlimited generation, HD quality, priority processing"}
                      </p>
                      <Link href="/vip">
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          {language === "zh" ? "立即升级" : "Upgrade Now"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card
                className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")}`}
              >
                <CardHeader>
                  <CardTitle className={`${getThemeClass("text-gray-900", "text-white")} flex items-center`}>
                    <Settings className="w-5 h-5 mr-2" />
                    {t("profile.preferences")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language Preference */}
                  <div className="space-y-3">
                    <Label className={getThemeClass("text-gray-900", "text-white")}>
                      {language === "zh" ? "默认语言" : "Default Language"}
                    </Label>
                    <RadioGroup
                      value={preferences.language}
                      onValueChange={(value) => {
                        setPreferences((prev) => ({ ...prev, language: value }))
                        setLanguage(value as "zh" | "en")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="zh" id="lang-zh" />
                        <Label htmlFor="lang-zh" className={getThemeClass("text-gray-700", "text-gray-300")}>
                          中文 (Chinese)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="en" id="lang-en" />
                        <Label htmlFor="lang-en" className={getThemeClass("text-gray-700", "text-gray-300")}>
                          English
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Theme Preference */}
                  <div className="space-y-3">
                    <Label className={getThemeClass("text-gray-900", "text-white")}>
                      {language === "zh" ? "主题模式" : "Theme Mode"}
                    </Label>
                    <RadioGroup
                      value={preferences.theme}
                      onValueChange={(value) => {
                        setPreferences((prev) => ({ ...prev, theme: value }))
                        if (value !== theme) {
                          toggleTheme()
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light" className={getThemeClass("text-gray-700", "text-gray-300")}>
                          {language === "zh" ? "浅色模式" : "Light Mode"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark" className={getThemeClass("text-gray-700", "text-gray-300")}>
                          {language === "zh" ? "深色模式" : "Dark Mode"}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button className="bg-purple-600 hover:bg-purple-700">
                    {language === "zh" ? "保存偏好设置" : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <div className="space-y-6">
                {/* Current Subscription */}
                {user.is_vip && (
                  <Card
                    className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")}`}
                  >
                    <CardHeader>
                      <CardTitle className={`${getThemeClass("text-gray-900", "text-white")} flex items-center`}>
                        <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                        {language === "zh" ? "当前订阅" : "Current Subscription"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`${getThemeClass("text-gray-900", "text-white")} font-semibold`}>VIP会员</p>
                          <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                            {language === "zh" ? "有效期至" : "Valid until"}: {user.subscription_status || "Active"}
                          </p>
                        </div>
                        <Badge className="bg-green-500 text-white">{language === "zh" ? "活跃" : "Active"}</Badge>
                      </div>

                      {nextPaymentDate && (
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={getThemeClass("text-gray-700", "text-gray-300")}>
                              {language === "zh" ? "下次付款日期" : "Next Payment Date"}
                            </span>
                            <span className={getThemeClass("text-gray-900", "text-white")}>{nextPaymentDate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={getThemeClass("text-gray-700", "text-gray-300")}>
                              {language === "zh" ? "下次付款金额" : "Next Payment Amount"}
                            </span>
                            <span className={getThemeClass("text-gray-900", "text-white")}>¥{nextPaymentAmount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={getThemeClass("text-gray-700", "text-gray-300")}>
                              {language === "zh" ? "付款方式" : "Payment Method"}
                            </span>
                            <span className={getThemeClass("text-gray-900", "text-white")}>{paymentMethod}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={getThemeClass("text-gray-700", "text-gray-300")}>
                              {language === "zh" ? "自动续费" : "Auto Renewal"}
                            </span>
                            <Switch
                              checked={preferences.autoRenewal}
                              onCheckedChange={(checked) =>
                                setPreferences((prev) => ({ ...prev, autoRenewal: checked }))
                              }
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Payment History */}
                <Card
                  className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`${getThemeClass("text-gray-900", "text-white")} flex items-center`}>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {language === "zh" ? "支付历史" : "Payment History"}
                      </CardTitle>
                      <Button
                        onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                        variant="ghost"
                        size="sm"
                        className={getThemeClass("text-gray-600 hover:text-gray-900", "text-gray-400 hover:text-white")}
                      >
                        {showPaymentHistory ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            {language === "zh" ? "收起" : "Collapse"}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            {language === "zh" ? "展开" : "Expand"}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {showPaymentHistory && (
                    <CardContent>
                      <div className="space-y-4">
                        {mockBillingHistory.map((payment) => (
                          <div
                            key={payment.id}
                            className={`flex items-center justify-between p-4 ${getThemeClass("bg-gray-100", "bg-white/5")} rounded-lg`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className={getThemeClass("text-gray-900", "text-white") + " font-medium"}>
                                  {payment.type}
                                </p>
                                <Badge
                                  variant={payment.status === "completed" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {payment.status === "completed"
                                    ? language === "zh"
                                      ? "已完成"
                                      : "Completed"
                                    : language === "zh"
                                      ? "处理中"
                                      : "Processing"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className={getThemeClass("text-gray-600", "text-gray-400")}>
                                  {payment.date} · {payment.method}
                                </span>
                                <span className={getThemeClass("text-gray-900", "text-white") + " font-semibold"}>
                                  ¥{payment.amount}
                                </span>
                              </div>
                              <p className={`${getThemeClass("text-gray-500", "text-gray-500")} text-xs mt-1`}>
                                {language === "zh" ? "订单号" : "Order ID"}: {payment.orderId}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {mockBillingHistory.length === 0 && (
                        <div className="text-center py-8">
                          <p className={getThemeClass("text-gray-500", "text-gray-400")}>
                            {language === "zh" ? "暂无支付记录" : "No payment history"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* VIP Promotion */}
                {!user.is_vip && (
                  <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
                    <CardContent className="p-6 text-center">
                      <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className={`${getThemeClass("text-gray-900", "text-white")} text-xl font-semibold mb-2`}>
                        {language === "zh" ? "升级VIP会员" : "Upgrade to VIP"}
                      </h3>
                      <p className={`${getThemeClass("text-gray-600", "text-gray-300")} mb-4`}>
                        {language === "zh"
                          ? "解锁无限生成、高清画质、优先处理等特权"
                          : "Unlock unlimited generation, HD quality, priority processing"}
                      </p>
                      <Link href="/vip">
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          {language === "zh" ? "立即升级" : "Upgrade Now"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Customer Support */}
                <Card
                  className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")}`}
                >
                  <CardContent className="p-6 text-center">
                    <h3 className={`${getThemeClass("text-gray-900", "text-white")} text-lg font-semibold mb-2`}>
                      {language === "zh" ? "客服支持" : "Customer Support"}
                    </h3>
                    <p className={`${getThemeClass("text-gray-600", "text-gray-300")} mb-4`}>
                      {language === "zh" ? "遇到问题？联系我们的客服团队" : "Need help? Contact our support team"}
                    </p>
                    <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-transparent">
                          <QrCode className="w-4 h-4 mr-2" />
                          {language === "zh" ? "客服二维码" : "Support QR Code"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={getThemeClass("bg-white", "bg-gray-900")}>
                        <DialogHeader>
                          <DialogTitle className={getThemeClass("text-gray-900", "text-white")}>
                            {language === "zh" ? "客服二维码" : "Customer Support QR Code"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <QrCode className="w-32 h-32 text-gray-400" />
                          </div>
                          <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm text-center`}>
                            {language === "zh"
                              ? "扫描二维码添加客服微信"
                              : "Scan QR code to add customer service WeChat"}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Explanatory Text */}
                <div className={`${getThemeClass("text-gray-600", "text-gray-400")} text-sm space-y-2`}>
                  <p>
                    {language === "zh"
                      ? "• 所有支付均通过安全的第三方支付平台处理"
                      : "• All payments are processed through secure third-party payment platforms"}
                  </p>
                  <p>
                    {language === "zh"
                      ? "• 自动续费可随时在此页面关闭"
                      : "• Auto-renewal can be turned off at any time on this page"}
                  </p>
                  <p>
                    {language === "zh"
                      ? "• 如需发票或有其他问题，请联系客服"
                      : "• For invoices or other questions, please contact customer service"}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card
                className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")}`}
              >
                <CardHeader>
                  <CardTitle className={`${getThemeClass("text-gray-900", "text-white")} flex items-center`}>
                    <Bell className="w-5 h-5 mr-2" />
                    {t("profile.notifications")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className={getThemeClass("text-gray-900", "text-white")}>
                          {t("notifications.videoNotifications")}
                        </Label>
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                          {t("notifications.receiveVideoUpdates")}
                        </p>
                      </div>
                      <Switch
                        checked={notifications.videoNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({ ...prev, videoNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className={getThemeClass("text-gray-900", "text-white")}>
                          {t("notifications.newsletter")}
                        </Label>
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                          {t("notifications.receiveNewsletter")}
                        </p>
                      </div>
                      <Switch
                        checked={notifications.newsletter}
                        onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, newsletter: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className={getThemeClass("text-gray-900", "text-white")}>
                          {t("notifications.promotional")}
                        </Label>
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                          {t("notifications.receivePromotional")}
                        </p>
                      </div>
                      <Switch
                        checked={notifications.promotional}
                        onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, promotional: checked }))}
                      />
                    </div>
                  </div>

                  <Button className="bg-purple-600 hover:bg-purple-700">
                    {language === "zh" ? "保存通知设置" : "Save Notification Settings"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </div>
  )
}
