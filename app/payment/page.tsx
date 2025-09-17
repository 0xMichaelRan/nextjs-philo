"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Shield, Check, CreditCard, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"
import { usePageTitle } from "@/hooks/use-page-title"
import { useToast } from "@/hooks/use-toast"

// Dynamic pricing will be fetched from backend

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
  const returnTo = searchParams.get('returnTo') // Get return URL from query params
  const [selectedPlan, setSelectedPlan] = useState("vip")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [selectedPayment, setSelectedPayment] = useState("alipay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [promoCode, setPromoCode] = useState("KIMI") // Auto-fill default promo code
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [finalPrice, setFinalPrice] = useState(0)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [pricingData, setPricingData] = useState<any>(null)
  const [loadingPricing, setLoadingPricing] = useState(true)

  const { toast } = useToast()
  const { user, updateUser } = useAuth()
  const { language, t } = useLanguage()
  const { theme } = useTheme()

  // Set page title
  usePageTitle("payment")
  const [currentVipStatus, setCurrentVipStatus] = useState<{
    is_vip: boolean
    is_active: boolean
    expiry_date: string | null
    expiry_date_formatted: { zh: string; en: string }
  } | null>(null)

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

  // Set VIP status from user data (no separate API call needed)
  useEffect(() => {
    if (user) {
      setCurrentVipStatus({
        is_vip: user.is_vip,
        is_active: user.is_vip && user.vip_days_remaining !== null && user.vip_days_remaining !== undefined && user.vip_days_remaining > 0,
        expiry_date: user.vip_expiry_date ?? null,
        expiry_date_formatted: {
          zh: user.vip_expiry_date ? new Date(user.vip_expiry_date).toLocaleDateString("zh-CN") : "无",
          en: user.vip_expiry_date ? new Date(user.vip_expiry_date).toLocaleDateString("en-US") : "None"
        }
      })
    }
  }, [user])

  // Fetch pricing data from backend
  useEffect(() => {
    const fetchPricing = async () => {
      if (!user) return

      try {
        setLoadingPricing(true)
        const response = await apiConfig.makeAuthenticatedRequest(
          apiConfig.payments.pricing()
        )

        if (response.ok) {
          const data = await response.json()
          setPricingData(data)
        } else {
          console.error("Failed to fetch pricing data")
        }
      } catch (error) {
        console.error("Error fetching pricing:", error)
      } finally {
        setLoadingPricing(false)
      }
    }

    fetchPricing()
  }, [user])

  const getPrice = (plan: string, cycle: string) => {
    if (!pricingData?.pricing?.[plan]?.[cycle]) {
      return { price: 0, originalPrice: 0 }
    }

    const planData = pricingData.pricing[plan][cycle]

    // If user is VIP upgrading to SVIP, use upgrade price
    if (plan === "svip" && pricingData.current_plan === "vip" && planData.upgrade_price !== undefined) {
      return {
        price: planData.upgrade_price,
        originalPrice: planData.original_price,
        isUpgrade: true,
        proratedAmount: planData.prorated_amount,
        remainingDays: pricingData.pricing.svip.remaining_days
      }
    }

    return {
      price: planData.price,
      originalPrice: planData.original_price,
      isUpgrade: false
    }
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    /* dark-theme refactor */
    return {
      background: "theme-gradient-hero",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "theme-surface-elevated border-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  const currentPlanPricing = getPrice(selectedPlan, billingCycle)
  const currentPlanDetails = planDetails[selectedPlan as keyof typeof planDetails]
  const savings = currentPlanPricing.originalPrice - currentPlanPricing.price
  const yearlyDiscount = billingCycle === "yearly" ? 25 : 0

  // Initialize final price when plan/billing changes
  useEffect(() => {
    setFinalPrice(currentPlanPricing.price)
    setPromoDiscount(0)
    setPromoApplied(false)
    setPromoError("")
  }, [selectedPlan, billingCycle, currentPlanPricing.price])

  // Reset promo state when promo code is cleared
  useEffect(() => {
    if (!promoCode.trim()) {
      setFinalPrice(currentPlanPricing.price)
      setPromoDiscount(0)
      setPromoApplied(false)
      setPromoError("")
    }
  }, [promoCode, currentPlanPricing.price])

  // Get current VIP status display
  const getCurrentVipDisplay = () => {
    if (!currentVipStatus) {
      return language === "zh" ? "加载中..." : "Loading..."
    }

    if (!currentVipStatus.is_vip || !currentVipStatus.expiry_date) {
      return language === "zh" ? "当前无VIP" : "No VIP currently"
    }

    const expiryDate = new Date(currentVipStatus.expiry_date)
    const today = new Date()

    if (expiryDate > today) {
      // VIP expires in the future
      const formattedDate = expiryDate.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")
      return language === "zh" ? `VIP有效期至 ${formattedDate}` : `VIP valid until ${formattedDate}`
    } else {
      // VIP expired in the past
      const formattedDate = expiryDate.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")
      return language === "zh" ? `VIP已于 ${formattedDate} 过期` : `VIP expired on ${formattedDate}`
    }
  }

  // Handle promo code validation via backend API
  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoApplied(false)
      setPromoError("")
      setFinalPrice(currentPlanPricing.price)
      setPromoDiscount(0)
      return
    }

    setPromoValidating(true)
    setPromoError("")

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.payments.validatePromo(),
        {
          method: 'POST',
          body: JSON.stringify({
            plan: selectedPlan,
            billing_cycle: billingCycle,
            promo_code: promoCode.trim()
          })
        }
      )

      if (response.ok) {
        const result = await response.json()
        setPromoApplied(result.promo_applied)
        setFinalPrice(result.final_price)
        setPromoDiscount(result.promo_discount)

        if (!result.promo_applied) {
          setPromoError(t("payment.invalidPromoCode"))
        }
      } else {
        const error = await response.json()
        setPromoError(error.detail || t("payment.promoValidationError"))
        setPromoApplied(false)
        setFinalPrice(currentPlanPricing.price)
        setPromoDiscount(0)
      }
    } catch (error) {
      console.error("Promo validation error:", error)
      setPromoError(t("payment.promoValidationError"))
      setPromoApplied(false)
      setFinalPrice(currentPlanPricing.price)
      setPromoDiscount(0)
    } finally {
      setPromoValidating(false)
    }
  }

  const currentVipDisplay = getCurrentVipDisplay()

  // Get avatar gradient based on name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-teal-500",
      "from-yellow-500 to-orange-500",
      "from-red-500 to-pink-500",
      "from-indigo-500 to-purple-500"
    ]
    const index = name.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  const handlePayment = async () => {
    if (!user) {
      router.push("/auth?redirect=payment")
      return
    }

    // Scroll to top when payment button is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' })

    setIsProcessing(true)

    try {
      // Prepare payment data
      const paymentData = {
        plan: selectedPlan, // 'vip' or 'svip'
        billing_cycle: billingCycle, // 'monthly' or 'yearly'
        payment_method: selectedPayment,
        amount: finalPrice,
        promo_code: promoApplied ? promoCode : null
      }

      // Call backend payment API
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.payments.checkout(),
        {
          method: 'POST',
          body: JSON.stringify(paymentData)
        }
      )

      if (response.ok) {
        const result = await response.json()

        if (!result.requires_payment) {
          // Free payment with promo code - immediate success
          updateUser({
            is_vip: true,
          })

          toast({
            title: t("payment.paymentSuccess"),
            description: t("payment.vipActivated"),
            variant: "success",
          })

          const successUrl = returnTo ? `/payment/success?returnTo=${encodeURIComponent(returnTo)}` : "/payment/success"
          router.push(successUrl)
        } else {
          // Regular payment processing - show QR code
          setShowQRCode(true)
          // Store payment info for later confirmation
          localStorage.setItem('pending_payment_id', result.payment_id.toString())

          // Mock payment completion after 3 seconds
          setTimeout(async () => {
            try {
              // Call backend to complete mock payment and update database
              const mockCompleteResponse = await apiConfig.makeAuthenticatedRequest(
                apiConfig.payments.mockComplete(),
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    plan: selectedPlan,
                    billing_cycle: billingCycle
                  })
                }
              )

              if (mockCompleteResponse.ok) {
                // Update local user state
                updateUser({
                  is_vip: true,
                  vip_expiry_date: new Date(Date.now() + (billingCycle === "weekly" ? 7 : billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
                })

                toast({
                  title: t("payment.paymentSuccess"),
                  description: t("payment.vipActivated"),
                  variant: "success",
                })

                // Clear any stored payment info
                localStorage.removeItem('pending_payment_id')

                const successUrl = returnTo ? `/payment/success?returnTo=${encodeURIComponent(returnTo)}` : "/payment/success"
                router.push(successUrl)
              } else {
                throw new Error("Mock payment completion failed")
              }
            } catch (error) {
              console.error("Error in mock payment:", error)
              toast({
                title: t("payment.paymentFailed"),
                description: t("payment.paymentError"),
                variant: "destructive",
              })
            }
          }, 3000)
        }
      } else {
        const error = await response.json()
        toast({
          title: t("payment.paymentFailed"),
          description: error.detail || t("payment.paymentError"),
          variant: "destructive",
        })
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

  if (loadingPricing) {
    return (
      <AppLayout>
        <div className={themeClasses.background}>
          <div className="container mx-auto px-4 py-8">
            <Card className={`${themeClasses.card} max-w-md mx-auto text-center`}>
              <CardContent className="p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h2 className={`${themeClasses.text} text-xl font-bold mb-4`}>
                  {language === "zh" ? "加载价格信息..." : "Loading pricing..."}
                </h2>
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
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-opacity-50 ${
                              selectedPlan === planId
                                ? "border-green-500 ring-2 ring-green-500/20"
                                : "border-transparent hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedPlan(planId)}
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
                        <div
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-opacity-50 ${
                            billingCycle === "weekly"
                              ? "border-green-500 ring-2 ring-green-500/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setBillingCycle("weekly")}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="weekly" id="weekly" />
                            <Label htmlFor="weekly" className={`${themeClasses.text} cursor-pointer`}>
                              {language === "zh" ? "每周付费" : "Weekly Billing"}
                            </Label>
                          </div>
                          <div className="text-right">
                            <div className={`${themeClasses.text} font-semibold`}>
                              {getPrice(selectedPlan, "weekly").price}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-opacity-50 ${
                            billingCycle === "monthly"
                              ? "border-green-500 ring-2 ring-green-500/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setBillingCycle("monthly")}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly" className={`${themeClasses.text} cursor-pointer`}>
                              {t("vip.monthlyBilling")}
                            </Label>
                          </div>
                          <div className="text-right">
                            <div className={`${themeClasses.text} font-semibold`}>
                              ¥{getPrice(selectedPlan, "monthly").price.toFixed(2)}/{t("payment.month")}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-opacity-50 ${
                            billingCycle === "yearly"
                              ? "border-green-500 ring-2 ring-green-500/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setBillingCycle("yearly")}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="yearly" id="yearly" />
                            <Label htmlFor="yearly" className={`${themeClasses.text} cursor-pointer`}>
                              {t("vip.yearlyBilling")}
                            </Label>
                            <Badge className="bg-green-500 text-white">{t("payment.save")} 25%</Badge>
                          </div>
                          <div className="text-right">
                            <div className={`${themeClasses.text} font-semibold`}>
                              ¥{getPrice(selectedPlan, "yearly").price.toFixed(2)}/{t("payment.year")}
                            </div>
                            <div className={`${themeClasses.secondaryText} text-sm line-through`}>
                              ¥{getPrice(selectedPlan, "yearly").originalPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Profile Section */}
                <Card className={`${themeClasses.card} mb-6`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={user.avatar ? `${apiConfig.getBaseUrl()}${user.avatar}` : "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(user.name)} text-white text-lg`}>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className={`${themeClasses.text} text-xl font-semibold`}>{user.name}</h3>
                        <p className={`${themeClasses.secondaryText} text-sm`}>{user.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <span className={`${themeClasses.text} text-sm`}>
                            <span className="font-medium text-green-500">
                              {currentVipDisplay}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
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

                {/* Promo Code Section */}
                <Card className={`${themeClasses.card} mb-6`}>
                  <CardHeader>
                    <CardTitle className={`${themeClasses.text} text-lg flex items-center`}>
                      <Tag className="w-5 h-5 mr-2" />
                      {t("payment.promoCode")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          placeholder={t("payment.enterPromoCode")}
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className={`${themeClasses.text} ${theme === "light" ? "bg-white border-gray-300" : "bg-gray-800 border-gray-600 text-white"}`}
                          disabled={promoValidating}
                        />
                        <Button
                          onClick={handlePromoCode}
                          variant="outline"
                          disabled={promoValidating}
                        >
                          {promoValidating ? t("common.loading") : t("payment.apply")}
                        </Button>
                      </div>
                      {promoApplied && (
                        <div className="flex items-center space-x-2 text-green-500">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">
                            {t("payment.promoApplied")}
                          </span>
                        </div>
                      )}
                      {promoError && (
                        <div className="flex items-center space-x-2 text-blue-500">
                          <span className="text-sm">{promoError}</span>
                        </div>
                      )}
                    </div>
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
                          : billingCycle === "monthly"
                            ? language === "zh"
                              ? "1个月"
                              : "1 month"
                            : language === "zh"
                              ? "1周"
                              : "1 week"}
                      </span>
                    </div>
                    {currentPlanPricing.isUpgrade && (
                      <div className="flex justify-between">
                        <span className={themeClasses.secondaryText}>
                          {language === "zh" ? "剩余VIP天数:" : "Remaining VIP days:"}
                        </span>
                        <span className={themeClasses.text}>
                          {currentPlanPricing.remainingDays} {language === "zh" ? "天" : "days"}
                        </span>
                      </div>
                    )}
                    {currentPlanPricing.isUpgrade && (
                      <div className="flex justify-between">
                        <span className={themeClasses.secondaryText}>
                          {language === "zh" ? "按比例升级费用:" : "Prorated upgrade:"}
                        </span>
                        <span className={themeClasses.text}>
                          ¥{currentPlanPricing.proratedAmount?.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={themeClasses.secondaryText}>
                        {currentPlanPricing.isUpgrade
                          ? (language === "zh" ? "升级后价格:" : "After upgrade:")
                          : t("payment.originalPrice") + ":"
                        }
                      </span>
                      <span className={`${themeClasses.secondaryText} ${!currentPlanPricing.isUpgrade ? 'line-through' : ''}`}>
                        ¥{currentPlanPricing.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    {yearlyDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>
                          {t("payment.annualDiscount")} ({yearlyDiscount}%):
                        </span>
                        <span>-¥{savings.toFixed(2)}</span>
                      </div>
                    )}
                    {promoApplied && promoDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>
                          {t("payment.promoDiscount")} ({promoCode}):
                        </span>
                        <span>-¥{promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className={`${themeClasses.text} font-semibold text-lg`}>{t("payment.total")}:</span>
                      <span className={`${themeClasses.text} font-bold text-xl ${finalPrice === 0 ? 'text-green-500' : ''}`}>
                        ¥{finalPrice.toFixed(2)}
                        {finalPrice === 0 && (
                          <span className="ml-2 text-sm font-normal">
                            ({t("payment.free")})
                          </span>
                        )}
                      </span>
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
                  {isProcessing
                    ? t("payment.processing")
                    : finalPrice === 0
                      ? t("payment.getVipFree")
                      : `${t("payment.payNow")} ¥${finalPrice.toFixed(2)}`
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
