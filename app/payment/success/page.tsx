"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Crown, ArrowRight } from "lucide-react"
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

  useEffect(() => {
    // Redirect if not logged in or not VIP
    if (!user || !user.isVip) {
      router.push("/vip")
    }
  }, [user, router])

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

                {user && (
                  <div className={`${themeClasses.card} p-4 rounded-lg mb-6`}>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className={`${themeClasses.text} font-semibold`}>VIP {t("nav.memberStatus")}</span>
                    </div>
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {language === "zh" ? "有效期至" : "Valid until"}: {user.vipExpiry}
                    </p>
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
