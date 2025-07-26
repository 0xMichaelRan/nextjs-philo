"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Shield, Check, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

const planPrices = {
  vip: {
    monthly: { price: 29, originalPrice: 39 },
    yearly: { price: 261, originalPrice: 468 }, // 29 * 12 * 0.75 = 261
  },
  svip: {
    monthly: { price: 59, originalPrice: 79 },
    yearly: { price: 531, originalPrice: 948 }, // 59 * 12 * 0.75 = 531
  },
}

const planDetails = {
  vip: {
    name: "VIP会员",
    nameEn: "VIP Membership",
    features: ["无限视频生成", "HD高清画质", "优先处理队列", "专属客服支持", "高级分析模板", "批量下载功能"],
    featuresEn: [
      "Unlimited generation",
      "HD quality",
      "Priority queue",
      "Dedicated support",
      "Advanced templates",
      "Batch download",
    ],
  },
  svip: {
    name: "SVIP会员",
    nameEn: "SVIP Membership",
    features: ["无限视频生成", "4K超高清画质", "最高优先级处理", "24/7专属客服", "全部分析模板", "API接口访问"],
    featuresEn: [
      "Unlimited generation",
      "4K quality",
      "Highest priority",
      "24/7 support",
      "All templates",
      "API access",
    ],
  },
}

const paymentMethods = [
  {
    id: "alipay",
    name: "支付宝",
    nameEn: "Alipay",
    icon: "/placeholder.svg?height=32&width=32",
    description: "支持花呗分期付款",
    descriptionEn: "Supports installment payment",
  },
  {
    id: "wechat",
    name: "微信支付",
    nameEn: "WeChat Pay",
    icon: "/placeholder.svg?height=32&width=32",
    description: "微信扫码支付",
    descriptionEn: "WeChat QR code payment",
  },
]

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("vip")
  const [billingCycle, setBillingCycle] = useState("yearly")
  const [selectedPayment, setSelectedPayment] = useState("alipay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user, updateUser } = useAuth()

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push("/auth?redirect=payment")
      return
    }

    const plan = searchParams.get("plan")
    if (plan && (plan === "vip" || plan === "svip")) {
      setSelectedPlan(plan)
    }
  }, [searchParams, user, router])

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

  const currentPlanPricing = planPrices[selectedPlan][billingCycle]
  const currentPlanDetails = planDetails[selectedPlan]
  const savings = currentPlanPricing.originalPrice - currentPlanPricing.price
  const yearlyDiscount = billingCycle === "yearly" ? 25 : 0

  const handlePayment = async () => {
    if (!user) {
      router.push("/auth?redirect=payment")
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      if (selectedPayment === "alipay") {
        // Simulate Alipay payment
        console.log("Processing Alipay payment...")
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Mock successful payment
        const vipExpiry = new Date()
        vipExpiry.setMonth(vipExpiry.getMonth() + (billingCycle === "yearly" ? 12 : 1))

        updateUser({
          isVip: true,
          vipExpiry: vipExpiry.toISOString().split("T")[0],
        })

        router.push("/payment/success")
      } else if (selectedPayment === "wechat") {
        // Show WeChat QR code
        setShowQRCode(true)

        // Simulate QR code payment completion
        setTimeout(() => {
          const vipExpiry = new Date()
          vipExpiry.setMonth(vipExpiry.getMonth() + (billingCycle === "yearly" ? 12 : 1))

          updateUser({
            isVip: true,
            vipExpiry: vipExpiry.toISOString().split("T")[0],
          })

          router.push("/payment/success")
        }, 5000)
      }
    } catch (error) {
      console.error("Payment error:", error)
      router.push("/payment/failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className={themeClasses.background}>
          <div className="container mx-auto px-4 py-8">
            <Card className={`${themeClasses.card} max-w-md mx-auto text-center`}>
              <CardContent className="p-8">
                <h2 className={`${themeClasses.text} text-xl font-bold mb-4`}>{t("payment.loginRequired")}</h2>
                <Button onClick={() => router.push("/auth")} className="bg-purple-600 hover:bg-purple-700">
                  {t("nav.login")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (showQRCode) {
    return (
      <AppLayout>
        <div className={themeClasses.background}>
          <div className="container mx-auto px-4 py-8">
            <Card className={`${themeClasses.card} max-w-md mx-auto text-center`}>
              <CardContent className="p-8">
                <h2 className={`${themeClasses.text} text-xl font-bold mb-6`}>
                  {language === "zh" ? "微信扫码支付" : "WeChat QR Payment"}
                </h2>
                <div className="bg-white p-4 rounded-lg mb-6">
                  <Image
                    src="/placeholder.svg?height=200&width=200"
                    alt="WeChat QR Code"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <p className={`${themeClasses.secondaryText} text-sm mb-4`}>
                  {language === "zh"
                    ? "请使用微信扫描二维码完成支付"
                    : "Please scan the QR code with WeChat to complete payment"}
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  <span className="text-sm">{t("payment.processing")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className={themeClasses.background}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className={`${themeClasses.text} hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Plan Selection */}
              <div>
                <h2 className={`${themeClasses.text} text-2xl font-bold mb-6`}>{t("payment.selectPlan")}</h2>

                {/* Plan Type Selection */}
                <Card className={`${themeClasses.card} mb-6`}>
                  <CardContent className="p-4">
                    <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                      <div className="space-y-4">
                        {Object.entries(planDetails).map(([planId, plan]) => (
                          <div
                            key={planId}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedPlan === planId
                                ? "border-green-500 ring-2 ring-green-500/20"
                                : "border-transparent"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={planId} id={planId} />
                              <div className="flex-1">
                                <Label
                                  htmlFor={planId}
                                  className={`${themeClasses.text} font-semibold text-lg cursor-pointer`}
                                >
                                  {language === "zh" ? plan.name : plan.nameEn}
                                </Label>
                                <ul className="mt-2 space-y-1">
                                  {(language === "zh" ? plan.features : plan.featuresEn)
                                    .slice(0, 3)
                                    .map((feature, index) => (
                                      <li
                                        key={index}
                                        className={`${themeClasses.secondaryText} text-sm flex items-center`}
                                      >
                                        <Check className="w-3 h-3 text-green-500 mr-2" />
                                        {feature}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Billing Cycle Selection */}
                <Card className={`${themeClasses.card} mb-6`}>
                  <CardHeader>
                    <CardTitle className={`${themeClasses.text} text-lg`}>
                      {language === "zh" ? "付费周期" : "Billing Cycle"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={billingCycle} onValueChange={setBillingCycle}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly" className={`${themeClasses.text} cursor-pointer`}>
                              {t("vip.monthlyBilling")}
                            </Label>
                          </div>
                          <div className="text-right">
                            <div className={`${themeClasses.text} font-semibold`}>
                              ¥{planPrices[selectedPlan].monthly.price}/{language === "zh" ? "月" : "month"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="yearly" id="yearly" />
                            <Label htmlFor="yearly" className={`${themeClasses.text} cursor-pointer`}>
                              {t("vip.yearlyBilling")}
                            </Label>
                            <Badge className="bg-green-500 text-white">{t("payment.save")} 25%</Badge>
                          </div>
                          <div className="text-right">
                            <div className={`${themeClasses.text} font-semibold`}>
                              ¥{planPrices[selectedPlan].yearly.price}/{language === "zh" ? "年" : "year"}
                            </div>
                            <div className={`${themeClasses.secondaryText} text-sm line-through`}>
                              ¥{planPrices[selectedPlan].yearly.originalPrice}
                            </div>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Method & Summary */}
              <div>
                <h2 className={`${themeClasses.text} text-2xl font-bold mb-6`}>{t("payment.paymentMethod")}</h2>

                {/* Payment Methods */}
                <Card className={`${themeClasses.card} mb-6`}>
                  <CardContent className="p-4">
                    <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                              selectedPayment === method.id
                                ? "border-green-500 bg-green-500/10"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Image
                              src={method.icon || "/placeholder.svg"}
                              alt={method.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <Label htmlFor={method.id} className={`${themeClasses.text} font-medium cursor-pointer`}>
                                {language === "zh" ? method.name : method.nameEn}
                              </Label>
                              <p className={`${themeClasses.secondaryText} text-xs`}>
                                {language === "zh" ? method.description : method.descriptionEn}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className={`${themeClasses.card} mb-6`}>
                  <CardHeader>
                    <CardTitle className={`${themeClasses.text} text-lg`}>{t("payment.orderSummary")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className={themeClasses.secondaryText}>{t("payment.plan")}:</span>
                      <span className={themeClasses.text}>
                        {language === "zh" ? currentPlanDetails.name : currentPlanDetails.nameEn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.secondaryText}>{t("payment.duration")}:</span>
                      <span className={themeClasses.text}>
                        {billingCycle === "yearly"
                          ? language === "zh"
                            ? "1年"
                            : "1 year"
                          : language === "zh"
                            ? "1个月"
                            : "1 month"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.secondaryText}>{t("payment.originalPrice")}:</span>
                      <span className={`${themeClasses.secondaryText} line-through`}>
                        ¥{currentPlanPricing.originalPrice}
                      </span>
                    </div>
                    {yearlyDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>
                          {language === "zh" ? "年付折扣" : "Annual Discount"} ({yearlyDiscount}%):
                        </span>
                        <span>-¥{savings}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className={`${themeClasses.text} font-semibold text-lg`}>{t("payment.total")}:</span>
                      <span className={`${themeClasses.text} font-bold text-xl`}>¥{currentPlanPricing.price}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 mb-6 text-green-500">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">
                    {t("payment.securePayment")} · {t("payment.encryptedTransaction")}
                  </span>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isProcessing ? t("payment.processing") : `${t("payment.payNow")} ¥${currentPlanPricing.price}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
