"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Crown, ArrowRight, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { getStandardThemeClasses } from "@/lib/theme-utils"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user, fetchUserProfile } = useAuth()
  const [vipDataLoaded, setVipDataLoaded] = useState(false)

  useEffect(() => {
    // Refresh user profile to get updated VIP status and expiry date
    const refreshProfile = async () => {
      await fetchUserProfile()
      // Add a small delay to ensure data is loaded
      setTimeout(() => setVipDataLoaded(true), 1000)
    }

    refreshProfile()
  }, [])

  const themeClasses = getStandardThemeClasses(theme)
  const successBackground = theme === "light" 
    ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
    : "bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900"

  // Format VIP expiry for display
  const formatVipExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return language === "zh" ? "永久" : "Lifetime"
    try {
      const date = new Date(expiryDate)
      return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return language === "zh" ? "无效日期" : "Invalid date"
    }
  }



  return (
    <AppLayout>
      <div className={successBackground}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className={`${themeClasses.card} text-center`}>
              <CardContent className="p-8">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className={`${themeClasses.text} text-2xl font-bold mb-2`}>{t("payment.success")}</h2>
                  <p className={`${themeClasses.secondaryText} mb-4`}>
                    {language === "zh"
                      ? "恭喜您成为VIP会员！现在可以享受所有高级功能。"
                      : "Congratulations on becoming a VIP member! You can now enjoy all premium features."}
                  </p>
                </div>

                {user?.is_vip && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <Calendar className="w-6 h-6 text-orange-500 mr-2" />
                      <span className={`${themeClasses.text} font-semibold text-lg`}>
                        {language === "zh" ? "会员有效期" : "Membership Validity"}
                      </span>
                    </div>

                    {vipDataLoaded ? (
                      <>
                        <p className={`${themeClasses.text} text-lg font-semibold mb-2 text-center`}>
                          {formatVipExpiry(user.vip_expiry_date)}
                        </p>

                        {user.vip_days_remaining !== null && user.vip_days_remaining !== undefined && (
                          <p className={`${themeClasses.secondaryText} text-center`}>
                            {user.vip_days_remaining > 0
                              ? `${user.vip_days_remaining} ${language === "zh" ? "天有效期" : "days remaining"}`
                              : (language === "zh" ? "今日到期" : "Expires today")
                            }
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                        <p className={`${themeClasses.secondaryText} text-sm`}>
                          {language === "zh" ? "正在更新会员信息..." : "Updating membership information..."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {returnTo ? (
                    <Button
                      onClick={() => router.push(returnTo)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {language === "zh" ? "返回继续创作" : "Return to Continue"}
                    </Button>
                  ) : (
                    <Link href="/movie-selection">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {language === "zh" ? "开始创作吧！" : "Start Creating"}
                      </Button>
                    </Link>
                  )}
  {/* extra spacer */}
  <div className="h-2" />       {/* or h-4, h-6, etc. */}

                  <Link href="/profile">
                    <Button variant="outline" className={`w-full ${themeClasses.outlineButton}`}>
                      {t("nav.profile")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
