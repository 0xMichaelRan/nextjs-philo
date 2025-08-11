"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { User, Settings, CreditCard, Bell, Crown, Edit, Camera, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { VipBadge } from "@/components/vip-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiConfig } from "@/lib/api-config"
import { usePageTitle } from "@/hooks/use-page-title"
import { UpgradeVipCard } from "@/components/upgrade-vip-card"
import { CustomerSupportCard } from "@/components/customer-support-card"



export default function ProfilePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basics")
  const [paymentHistory, setPaymentHistory] = useState([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    password: "",
  })
  const [preferences, setPreferences] = useState({
    language: "zh",
    theme: "dark",
    autoRenewal: false,
  })
  const [notifications, setNotifications] = useState({
    videoNotifications: true,
    newsletter: false,
    promotional: false,
  })
  const [vipStatus, setVipStatus] = useState<{
    is_vip: boolean
    is_active: boolean
    days_remaining: number | null
    expiry_date: string | null
  } | null>(null)
  const [isDenouncing, setIsDenouncing] = useState(false)

  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [tempPreferences, setTempPreferences] = useState({
    language: "zh",
    theme: "dark",
  })

  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, updateUser, fetchUserProfile } = useAuth()
  const { toast } = useToast()

  // Set dynamic page title based on active tab
  const getPageTitleKey = () => {
    switch (activeTab) {
      case 'basics': return 'profileBasics'
      case 'preferences': return 'profilePreferences'
      case 'billing': return 'profileBilling'
      case 'notifications': return 'profileNotifications'
      default: return 'profile'
    }
  }
  usePageTitle(getPageTitleKey())

  // Handle URL-based tabs
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['basics', 'preferences', 'billing', 'notifications'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        password: "",
      })
    }
  }, [user])

  // Fetch payment history when billing tab is active
  useEffect(() => {
    if (activeTab === 'billing' && user) {
      fetchPaymentHistory()
    }
  }, [activeTab, user])

  // Set VIP status from user data (no separate API call needed)
  useEffect(() => {
    if (user) {
      setVipStatus({
        is_vip: user.is_vip,
        is_active: user.is_vip && user.vip_days_remaining !== null && user.vip_days_remaining !== undefined && user.vip_days_remaining > 0,
        days_remaining: user.vip_days_remaining ?? null,
        expiry_date: user.vip_expiry_date ?? null
      })
    }
  }, [user])

  // Load preferences from user data
  useEffect(() => {
    if (user && user.preferences) {
      const userLang = user.preferences.language || language
      const userTheme = user.preferences.theme || theme

      setPreferences(prev => ({
        ...prev,
        language: userLang,
        theme: userTheme,
      }))

      setTempPreferences({
        language: userLang,
        theme: userTheme,
      })
    }
  }, [user, language, theme])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    router.push(url.pathname + url.search)
  }

  const fetchPaymentHistory = async () => {
    if (!user) return

    try {
      setIsLoadingPayments(true)
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.auth.paymentHistory(),
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        setPaymentHistory(data)
      } else {
        console.error('Failed to fetch payment history')
        setPaymentHistory([])
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
      setPaymentHistory([])
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const getThemeClass = (light: string, dark: string) => {
    return theme === "light" ? light : dark
  }



  // Format VIP expiry for display
  const formatVipExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return language === "zh" ? "永久" : "Lifetime"
    try {
      const date = new Date(expiryDate)
      return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return language === "zh" ? "无效日期" : "Invalid date"
    }
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
          method: 'PUT',
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault()
      handleSaveProfile()
    }
  }

  const handleDenounceVip = async () => {
    if (!user || !user.is_vip) return

    const confirmed = window.confirm(
      language === "zh"
        ? "确定要取消VIP会员状态吗？此操作不可撤销。"
        : "Are you sure you want to denounce your VIP status? This action cannot be undone."
    )

    if (!confirmed) return

    try {
      setIsDenouncing(true)

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.payments.denounceVip(),
        { method: 'POST' }
      )

      if (response.ok) {
        // Refresh user profile to reflect changes (VIP status is included)
        await fetchUserProfile()

        // Exit editing state
        setIsEditing(false)
        setEditForm(prev => ({ ...prev, password: "" }))

        toast({
          title: language === "zh" ? "VIP状态已取消" : "VIP Status Cancelled",
          description: language === "zh"
            ? "您的VIP会员状态已成功取消。"
            : "Your VIP membership status has been successfully cancelled.",
        })
      } else {
        throw new Error('Failed to denounce VIP status')
      }
    } catch (error) {
      console.error('Error denouncing VIP:', error)
      toast({
        title: language === "zh" ? "操作失败" : "Operation Failed",
        description: language === "zh"
          ? "取消VIP状态时发生错误，请稍后重试。"
          : "An error occurred while cancelling VIP status. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDenouncing(false)
    }
  }

  const handleSavePreferences = () => {
    if (!user) return

    // Immediately apply changes to UI
    if (tempPreferences.language !== language) {
      setLanguage(tempPreferences.language as "zh" | "en")
    }
    if (tempPreferences.theme !== theme) {
      toggleTheme()
    }

    // Update the display preferences
    setPreferences(prev => ({
      ...prev,
      language: tempPreferences.language,
      theme: tempPreferences.theme,
    }))

    // Update user profile data to reflect new preferences
    const updatedPreferences = {
      ...user.preferences,
      language: tempPreferences.language,
      theme: tempPreferences.theme
    }

    // Update user data in auth context immediately
    updateUser({
      preferences: updatedPreferences
    })

    // Update localStorage to persist the changes
    localStorage.setItem("language", tempPreferences.language)
    localStorage.setItem("theme", tempPreferences.theme)

    // Exit editing state immediately
    setIsEditingPreferences(false)

    // Show success toast immediately
    toast({
      title: tempPreferences.language === "zh" ? "偏好设置已保存" : "Preferences Saved",
      description: tempPreferences.language === "zh"
        ? "您的偏好设置已成功保存。"
        : "Your preferences have been saved successfully.",
    })

    // Save to backend asynchronously without waiting for response
    apiConfig.makeAuthenticatedRequest(
      apiConfig.auth.updateUser(),
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            language: tempPreferences.language,
            theme: tempPreferences.theme
          }
        }),
      }
    ).catch(error => {
      console.error('Error saving preferences to backend:', error)
      // Silently fail - user already sees success message and UI is updated
    })
  }

  const handleCancelPreferences = () => {
    // Reset temp preferences to current saved values
    setTempPreferences({
      language: preferences.language,
      theme: preferences.theme,
    })
    setIsEditingPreferences(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setIsLoading(true)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: language === "zh" ? "文件类型错误" : "Invalid File Type",
          description: language === "zh" ? "请选择图片文件" : "Please select an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: language === "zh" ? "文件过大" : "File Too Large",
          description: language === "zh" ? "文件大小不能超过5MB" : "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('avatar', file)

      // Call backend API to upload avatar
      const response = await fetch(apiConfig.auth.uploadAvatar(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      })

      if (response.ok) {
        // Refresh user profile to get latest data with new avatar
        await fetchUserProfile()

        // Show success toast
        toast({
          title: language === "zh" ? "头像更新成功" : "Avatar Updated",
          description: language === "zh"
            ? "您的头像已成功更新"
            : "Your avatar has been updated successfully",
          variant: "default",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Avatar update failed")
      }
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        title: language === "zh" ? "头像更新失败" : "Avatar Update Failed",
        description: error instanceof Error
          ? error.message
          : (language === "zh" ? "更新头像时出错" : "Error updating avatar"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate next payment date as the last day of VIP expiration
  const nextPaymentDate = user?.is_vip && user?.vip_expiry_date
    ? new Date(user.vip_expiry_date).toLocaleDateString()
    : null
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
      <AppLayout >
        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                          <AvatarImage
                            src={user.avatar ? `${apiConfig.getBaseUrl()}${user.avatar}` : "/placeholder.svg"}
                            alt={user.name}
                          />
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
                          <VipBadge
                            isVip={user.is_vip}
                            subscriptionStatus={user.subscription_status}
                            size="md"
                          />
                        </div>
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                          {t("profile.joinDate")}: {user.created_at.split("T")[0]}
                        </p>
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                          {t("profile.totalGenerated")}: 15{t("profile.videos")}
                        </p>
                        {user.is_vip && (
                          <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                            {language === "zh"
                              ? `${user.subscription_status === "svip" ? "SVIP" : "VIP"}剩余天数`
                              : `${user.subscription_status === "svip" ? "SVIP" : "VIP"} Days Remaining`}: {
                              vipStatus?.days_remaining !== null
                                ? `${vipStatus?.days_remaining || 0} ${language === "zh" ? "天" : "days"}`
                                : (language === "zh" ? "加载中..." : "Loading...")
                            }
                          </p>
                        )}
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
                            onKeyDown={handleKeyDown}
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
                            onKeyDown={handleKeyDown}
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
                          {user.is_vip && (
                            <Button
                              onClick={handleDenounceVip}
                              disabled={isDenouncing}
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              {isDenouncing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  {language === "zh" ? "取消中..." : "Cancelling..."}
                                </>
                              ) : (
                                language === "zh" ? "取消VIP" : "Cancel VIP"
                              )}
                            </Button>
                          )}
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
                {!user.is_vip && <UpgradeVipCard />}


              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card
                className={`${getThemeClass("bg-gray-50", "bg-white/10")} ${getThemeClass("border-gray-200", "border-white/20")}`}
              >
                <CardHeader>
                  <CardTitle className={`${getThemeClass("text-gray-900", "text-white")} flex items-center justify-between`}>
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      {t("profile.preferences")}
                    </div>
                    {!isEditingPreferences && (
                      <Button
                        onClick={() => setIsEditingPreferences(true)}
                        variant="outline"
                        size="sm"
                      >
                        {language === "zh" ? "编辑" : "Edit"}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditingPreferences ? (
                    <>
                      {/* Language Preference - Edit Mode */}
                      <div className="space-y-3">
                        <Label className={getThemeClass("text-gray-900", "text-white")}>
                          {language === "zh" ? "默认语言" : "Default Language"}
                        </Label>
                        <RadioGroup
                          value={tempPreferences.language}
                          onValueChange={(value) => {
                            setTempPreferences((prev) => ({ ...prev, language: value }))
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="zh" id="lang-zh-edit" />
                            <Label htmlFor="lang-zh-edit" className={getThemeClass("text-gray-700", "text-gray-300")}>
                              中文 (Chinese)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="en" id="lang-en-edit" />
                            <Label htmlFor="lang-en-edit" className={getThemeClass("text-gray-700", "text-gray-300")}>
                              English
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Theme Preference - Edit Mode */}
                      <div className="space-y-3">
                        <Label className={getThemeClass("text-gray-900", "text-white")}>
                          {language === "zh" ? "主题模式" : "Theme Mode"}
                        </Label>
                        <RadioGroup
                          value={tempPreferences.theme}
                          onValueChange={(value) => {
                            setTempPreferences((prev) => ({ ...prev, theme: value }))
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="light" id="theme-light-edit" />
                            <Label htmlFor="theme-light-edit" className={getThemeClass("text-gray-700", "text-gray-300")}>
                              {language === "zh" ? "浅色模式" : "Light Mode"}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dark" id="theme-dark-edit" />
                            <Label htmlFor="theme-dark-edit" className={getThemeClass("text-gray-700", "text-gray-300")}>
                              {language === "zh" ? "深色模式" : "Dark Mode"}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Edit Mode Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSavePreferences}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {language === "zh" ? "保存" : "Save"}
                        </Button>
                        <Button
                          onClick={handleCancelPreferences}
                          variant="outline"
                        >
                          {language === "zh" ? "取消" : "Cancel"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Language Preference - View Mode */}
                      <div className="space-y-3">
                        <Label className={getThemeClass("text-gray-900", "text-white")}>
                          {language === "zh" ? "默认语言" : "Default Language"}
                        </Label>
                        <p className={getThemeClass("text-gray-700", "text-gray-300")}>
                          {preferences.language === "zh" ? "中文 (Chinese)" : "English"}
                        </p>
                      </div>

                      {/* Theme Preference - View Mode */}
                      <div className="space-y-3">
                        <Label className={getThemeClass("text-gray-900", "text-white")}>
                          {language === "zh" ? "主题模式" : "Theme Mode"}
                        </Label>
                        <p className={getThemeClass("text-gray-700", "text-gray-300")}>
                          {preferences.theme === "light"
                            ? (language === "zh" ? "浅色模式" : "Light Mode")
                            : (language === "zh" ? "深色模式" : "Dark Mode")
                          }
                        </p>
                      </div>
                    </>
                  )}
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
                          <p className={`${getThemeClass("text-gray-900", "text-white")} font-semibold`}>
                            {language === "zh" ? "VIP会员" : "VIP Member"}
                          </p>
                          <p className={`${getThemeClass("text-gray-600", "text-gray-300")} text-sm`}>
                            {language === "zh" ? "有效期至" : "Valid until"}: {formatVipExpiry(user.vip_expiry_date)}
                          </p>
                          {user.vip_days_remaining !== null && user.vip_days_remaining !== undefined && (
                            <p className={`${getThemeClass("text-gray-500", "text-gray-400")} text-xs`}>
                              {user.vip_days_remaining > 0
                                ? `${user.vip_days_remaining} ${language === "zh" ? "天后到期" : "days remaining"}`
                                : (language === "zh" ? "已过期" : "Expired")
                              }
                            </p>
                          )}
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
                      {isLoadingPayments ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                          <p className={getThemeClass("text-gray-600", "text-gray-400")}>
                            {language === "zh" ? "加载中..." : "Loading..."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {paymentHistory.map((payment: any) => (
                            <div
                              key={payment.id}
                              className={`flex items-center justify-between p-4 ${getThemeClass("bg-gray-100", "bg-white/5")} rounded-lg`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className={getThemeClass("text-gray-900", "text-white") + " font-medium"}>
                                    {payment.plan_name}
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
                                    {new Date(payment.created_at).toLocaleDateString()} · {new Date(payment.created_at).toLocaleTimeString()}
                                  </span>
                                  <span className={getThemeClass("text-gray-900", "text-white") + " font-semibold"}>
                                    ¥{payment.amount}
                                  </span>
                                </div>
                                <p className={`${getThemeClass("text-gray-500", "text-gray-500")} text-xs mt-1`}>
                                  {language === "zh" ? "订单号" : "Order ID"}: {payment.id}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isLoadingPayments && paymentHistory.length === 0 && (
                        <div className="text-center py-8">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className={getThemeClass("text-gray-600", "text-gray-400")}>
                            {language === "zh" ? "暂无支付记录" : "No payment history"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* VIP Promotion */}
                {!user.is_vip && <UpgradeVipCard />}

                {/* Customer Support */}
                <CustomerSupportCard />

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

          {/* Profile Footer Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {/* Help & Support Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="/help"
                  className={`${getThemeClass("text-gray-700 hover:text-purple-600", "text-gray-400 hover:text-purple-400")} text-sm font-medium transition-colors duration-200 flex items-center justify-center sm:justify-start p-3 rounded-lg ${getThemeClass("hover:bg-gray-50", "hover:bg-white/5")}`}
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {language === "zh" ? "帮助中心" : "Help Center"}
                </a>

                <a
                  href="/blog"
                  className={`${getThemeClass("text-gray-700 hover:text-purple-600", "text-gray-400 hover:text-purple-400")} text-sm font-medium transition-colors duration-200 flex items-center justify-center sm:justify-start p-3 rounded-lg ${getThemeClass("hover:bg-gray-50", "hover:bg-white/5")}`}
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  {language === "zh" ? "博客" : "Blog"}
                </a>

                <a
                  href="/terms"
                  className={`${getThemeClass("text-gray-700 hover:text-purple-600", "text-gray-400 hover:text-purple-400")} text-sm font-medium transition-colors duration-200 flex items-center justify-center sm:justify-start p-3 rounded-lg ${getThemeClass("hover:bg-gray-50", "hover:bg-white/5")}`}
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {language === "zh" ? "条款与条件" : "Terms & Conditions"}
                </a>
              </div>

              {/* Additional Links */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-2">
                <a
                  href="/privacy"
                  className={`${getThemeClass("text-gray-600 hover:text-gray-800", "text-gray-500 hover:text-gray-300")} text-xs transition-colors duration-200`}
                >
                  {language === "zh" ? "隐私政策" : "Privacy Policy"}
                </a>
                <span className={`${getThemeClass("text-gray-400", "text-gray-600")} text-xs`}>•</span>
                <a
                  href="/contact"
                  className={`${getThemeClass("text-gray-600 hover:text-gray-800", "text-gray-500 hover:text-gray-300")} text-xs transition-colors duration-200`}
                >
                  {language === "zh" ? "联系我们" : "Contact Us"}
                </a>
                <span className={`${getThemeClass("text-gray-400", "text-gray-600")} text-xs`}>•</span>
                <a
                  href="/faq"
                  className={`${getThemeClass("text-gray-600 hover:text-gray-800", "text-gray-500 hover:text-gray-300")} text-xs transition-colors duration-200`}
                >
                  {language === "zh" ? "常见问题" : "FAQ"}
                </a>
              </div>

              {/* App Version & Copyright */}
              <div className="text-center pt-3">
                <p className={`${getThemeClass("text-gray-500", "text-gray-600")} text-xs`}>
                  {language === "zh" ? "版本 1.0.0 • © 2025 Philo AI" : "Version 1.0.0 • © 2025 Philo AI"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
