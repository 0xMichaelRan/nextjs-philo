"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Crown, ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()


  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    return {
      background: "bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
    }
  }

  const themeClasses = getThemeClasses()

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

  // Calculate days remaining
  const calculateDaysRemaining = (expiryDate: string | undefined) => {
    if (!expiryDate) return null
    try {
      const expiry = new Date(expiryDate)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    } catch {
      return null
    }
  }

  return (
    <AppLayout>
      <div className={themeClasses.background}>
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

                    <p className={`${themeClasses.text} text-lg font-semibold mb-2 text-center`}>
                      {formatVipExpiry(user.vip_expiry_date)}
                    </p>

                    {calculateDaysRemaining(user.vip_expiry_date) !== null && (
                      <p className={`${themeClasses.secondaryText} text-center`}>
                        {calculateDaysRemaining(user.vip_expiry_date)! > 0
                          ? `${calculateDaysRemaining(user.vip_expiry_date)} ${language === "zh" ? "天有效期" : "days remaining"}`
                          : (language === "zh" ? "今日到期" : "Expires today")
                        }
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Link href="/video-generation">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {language === "zh" ? "开始创作视频" : "Start Creating Videos"}
                    </Button>
                  </Link>

                  <Link href="/profile">
                    <Button variant="outline" className="w-full bg-transparent">
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
