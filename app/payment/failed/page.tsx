"use client"

import { XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

export default function PaymentFailedPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { language, t } = useLanguage()

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-red-50 via-pink-50 to-rose-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    return {
      background: "bg-gradient-to-br from-red-900 via-pink-900 to-rose-900",
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
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className={`${themeClasses.text} text-2xl font-bold mb-2`}>{t("payment.failed")}</h2>
                  <p className={`${themeClasses.secondaryText} mb-4`}>
                    {language === "zh"
                      ? "支付过程中出现问题，请重试或联系客服。"
                      : "There was an issue with your payment. Please try again or contact support."}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button onClick={() => router.push("/payment")} className="w-full bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === "zh" ? "重新支付" : "Try Again"}
                  </Button>

                  <Button onClick={() => router.push("/vip")} variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("common.back")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
