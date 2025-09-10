"use client"

import { useState, useEffect } from "react"
import { Crown, Check, Star, ChevronDown, ChevronUp, Calendar, Mic, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"

interface VipStatus {
  plan: string
  plan_code: string
  is_vip: boolean
  vip_expiry_date: string | null
  limits: {
    pending_jobs: number
    monthly_jobs: number
    custom_voices: number
    price_monthly: number
    price_yearly: number
  }
  usage: {
    pending_jobs: {
      current: number
      limit: number
      remaining: number
    }
    monthly_jobs: {
      current: number
      limit: number | null
      remaining: number | null
    }
    custom_voices: {
      current: number
      limit: number
      remaining: number
    }
  }
  next_reset_date: string
  pricing: {
    vip: any
    svip: any
  }
}

const plans = [
  {
    id: "free",
    name: "免费版",
    nameEn: "Free",
    price: 0,
    originalPrice: 0,
    period: "月",
    periodEn: "month",
    popular: false,
    features: [
      "每日1次生成",
      "SD标清画质",
      "普通处理队列",
      "社区支持",
      "基础分析模板",
      "广告展示",
      "功能受限",
      "无批量操作",
    ],
    featuresEn: [
      "1 generation/day",
      "SD quality",
      "Normal queue",
      "Community support",
      "Basic templates",
      "Ads displayed",
      "Limited features",
      "No batch operations",
    ],
  },
  {
    id: "vip",
    name: "VIP会员",
    nameEn: "VIP",
    price: 29,
    originalPrice: 39,
    period: "月",
    periodEn: "month",
    popular: true,
    features: [
      "无限视频生成",
      "HD高清画质",
      "优先处理队列",
      "专属客服支持",
      "批量下载功能",
      "无广告体验",
      "自定义配音",
      "API访问",
    ],
    featuresEn: [
      "Unlimited generation",
      "HD quality",
      "Priority queue",
      "Dedicated support",
      "Batch download",
      "Ad-free experience",
      "Custom voice",
      "API access",
    ],
  },
  {
    id: "svip",
    name: "SVIP会员",
    nameEn: "SVIP",
    price: 59,
    originalPrice: 79,
    period: "月",
    periodEn: "month",
    popular: false,
    features: [
      "无限视频生成",
      "4K超高清画质",
      "最高优先级处理",
      "24/7专属客服",
      "全部分析模板",
      "批量下载功能",
      "API访问",
      "定制化服务",
    ],
    featuresEn: [
      "Unlimited generation",
      "4K quality",
      "Highest priority",
      "24/7 support",
      "All templates",
      "Batch download",
      "API access",
      "Custom service",
    ],
  },
]

const faqData = [
  {
    question: "VIP和SVIP有什么区别？",
    questionEn: "What's the difference between VIP and SVIP?",
    answer: "VIP提供HD画质和优先处理，SVIP提供4K画质、最高优先级和API访问权限。",
    answerEn:
      "VIP offers HD quality and priority processing, while SVIP provides 4K quality, highest priority, and API access.",
  },
  {
    question: "可以随时取消订阅吗？",
    questionEn: "Can I cancel my subscription anytime?",
    answer: "是的，您可以随时在个人中心取消订阅，取消后会员权益将在当前周期结束后停止。",
    answerEn:
      "Yes, you can cancel your subscription anytime in your profile. Benefits will continue until the end of the current billing cycle.",
  },
  {
    question: "支持哪些支付方式？",
    questionEn: "What payment methods are supported?",
    answer: "我们支持支付宝和微信支付，暂不支持信用卡支付。",
    answerEn: "We support Alipay and WeChat Pay. Credit card payments are not currently supported.",
  },
  {
    question: "年付有优惠吗？",
    questionEn: "Is there a discount for annual payments?",
    answer: "是的，选择年付可享受25%的折扣优惠。",
    answerEn: "Yes, annual payments receive a 25% discount.",
  },
]

const comparisonFeatures = [
  { feature: "每日生成次数", featureEn: "Daily generations", free: "1次", vip: "无限", svip: "无限" },
  { feature: "视频画质", featureEn: "Video quality", free: "SD", vip: "HD", svip: "4K" },
  { feature: "处理优先级", featureEn: "Processing priority", free: "普通", vip: "优先", svip: "最高" },
  { feature: "客服支持", featureEn: "Customer support", free: "社区", vip: "专属", svip: "24/7专属" },
  { feature: "分析模板", featureEn: "Analysis templates", free: "基础", vip: "高级", svip: "全部" },
  { feature: "批量下载", featureEn: "Batch download", free: "❌", vip: "✅", svip: "✅" },
  { feature: "自定义配音", featureEn: "Custom voice", free: "❌", vip: "✅", svip: "✅" },
  { feature: "API访问", featureEn: "API access", free: "❌", vip: "❌", svip: "✅" },
  { feature: "广告", featureEn: "Ads", free: "有", vip: "无", svip: "无" },
]

export default function VipPage() {
  const [selectedPlan, setSelectedPlan] = useState("vip")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [vipStatus, setVipStatus] = useState<VipStatus | null>(null)
  const [showPricing, setShowPricing] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()

  const fetchVipStatus = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.videoJobs.vipStatus()
      )

      if (response.ok) {
        const data = await response.json()
        setVipStatus(data)
      }
    } catch (error) {
      console.error("Error fetching VIP status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchVipStatus()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === "zh"
      ? date.toLocaleDateString('zh-CN')
      : date.toLocaleDateString('en-US')
  }

  const getThemeClass = (lightClass: string, darkClass: string) => {
    return theme === "light" ? lightClass : darkClass
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50 backdrop-blur-md",
        cardHover: "hover:bg-white/90 hover:shadow-lg transition-all duration-300",
        button: "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700",
        accent: "text-yellow-600",
      }
    }
    /* dark-theme refactor */
    return {
      background: "theme-gradient-hero",
      text: "theme-text-primary",
      secondaryText: "theme-text-secondary",
      card: "theme-surface-elevated border-white/20",
      cardHover: "hover:bg-white/20 hover:shadow-xl transition-all duration-300",
      button: "theme-button-primary",
      accent: "theme-brand-primary",
    }
  }

  const themeClasses = getThemeClasses()

  const handleSubscribe = (planId: string) => {
    if (planId === "free") return

    // Allow access to payment page without login requirement
    router.push(`/payment?plan=${planId}`)
  }

  // Determine which plans to show based on current VIP status
  const getAvailablePlans = () => {
    // Always show all plans including free tier for comparison
    return plans
  }

  const shouldShowPricing = !user || !user.is_vip || showPricing // Show pricing for non-logged in, non-VIP, or when explicitly requested

  return (
    <div className={themeClasses.background}>
      <AppLayout title={t("vip.title")}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              {/* dark-theme refactor */}
              <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2 flex items-center justify-center gap-3`}>
                <Crown className="w-8 h-8 theme-brand-primary" />
                {t("vip.title")}
              </h1>
              <p className={`${themeClasses.secondaryText} text-lg`}>
                {language === "zh" ? "解锁所有高级功能，享受无限创作体验" : "Unlock all premium features and enjoy unlimited creative experience"}
              </p>
            </div>
          </div>

          {/* Non-logged in user notice */}
          {!user && (
            <div className="mb-8">
              <Card className={`${themeClasses.card} ${themeClasses.cardHover} border-l-4 border-yellow-500`}>
                <CardContent className="p-6 text-center">
                  {/* dark-theme refactor */}
                  <div className="w-16 h-16 theme-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`${themeClasses.text} text-xl font-bold mb-2`}>
                    {language === "zh" ? "登录查看您的VIP状态" : "Login to View Your VIP Status"}
                  </h3>
                  <p className={`${themeClasses.secondaryText} mb-4`}>
                    {language === "zh"
                      ? "登录后可查看当前会员状态、使用情况和管理订阅"
                      : "Login to view your current membership status, usage, and manage subscriptions"
                    }
                  </p>
                  <Button
                    onClick={() => router.push('/auth')}
                    className={themeClasses.button}
                  >
                    {language === "zh" ? "立即登录" : "Login Now"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* VIP Status Section - Show if user is VIP */}
          {user?.is_vip && vipStatus && (
            <div className="mb-8">
              <Card className={`${themeClasses.card} ${themeClasses.cardHover} border-l-4 border-purple-500`}>
                <CardHeader>
                  <CardTitle className={`${themeClasses.text} text-2xl flex items-center gap-2`}>
                    <Crown className="w-6 h-6 text-yellow-500" />
                    {language === "zh"
                      ? `我的${vipStatus.plan === "SVIP" ? "SVIP" : "VIP"}状态`
                      : `My ${vipStatus.plan || "VIP"} Status`}
                    <Badge className={`text-white ${
                      vipStatus.plan === "SVIP"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600"
                        : "bg-purple-600"
                    }`}>{vipStatus.plan || "VIP"}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Expiry Date */}
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h4 className={`${themeClasses.text} font-semibold mb-1`}>
                        {language === "zh" ? "到期时间" : "Expiry Date"}
                      </h4>
                      <p className={`${themeClasses.secondaryText} text-sm`}>
                        {vipStatus.vip_expiry_date ? formatDate(vipStatus.vip_expiry_date) : "N/A"}
                      </p>
                    </div>

                    {/* Custom Voices */}
                    <div className="text-center">
                      <Mic className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h4 className={`${themeClasses.text} font-semibold mb-1`}>
                        {language === "zh" ? "专属声音" : "Custom Voices"}
                      </h4>
                      <p className={`${themeClasses.secondaryText} text-sm`}>
                        {vipStatus.usage?.custom_voices?.current || 0} / {vipStatus.usage?.custom_voices?.limit || 0}
                      </p>
                      <p className={`${themeClasses.secondaryText} text-xs opacity-75`}>
                        {language === "zh" ? `剩余 ${vipStatus.usage?.custom_voices?.remaining || 0}` : `${vipStatus.usage?.custom_voices?.remaining || 0} remaining`}
                      </p>
                    </div>

                    {/* Video Jobs */}
                    <div className="text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <h4 className={`${themeClasses.text} font-semibold mb-1`}>
                        {language === "zh" ? "视频任务" : "Video Jobs"}
                      </h4>
                      <p className={`${themeClasses.secondaryText} text-sm`}>
                        {vipStatus.usage?.monthly_jobs?.current || 0} / {vipStatus.usage?.monthly_jobs?.limit || "∞"}
                      </p>
                      <p className={`${themeClasses.secondaryText} text-xs opacity-75`}>
                        {(vipStatus.usage?.monthly_jobs?.remaining !== null && vipStatus.usage?.monthly_jobs?.remaining !== undefined)
                          ? (language === "zh" ? `剩余 ${vipStatus.usage.monthly_jobs.remaining}` : `${vipStatus.usage.monthly_jobs.remaining} remaining`)
                          : (language === "zh" ? "无限制" : "Unlimited")
                        }
                      </p>
                    </div>
                  </div>

                  {/* Next Reset Date */}
                  <div className="text-center">
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {language === "zh" ? "下次重置时间: " : "Next reset: "}
                      {formatDate(vipStatus.next_reset_date)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* View Pricing Button - Outside VIP Status Box */}
          {user?.is_vip && (
            <div className="text-center mb-12">
              <Button
                variant="outline"
                onClick={() => setShowPricing(!showPricing)}
                className={`${themeClasses.card} border-2 border-purple-400 ${themeClasses.text} hover:border-purple-500 transition-all duration-300`}
              >
                {language === "zh" ? "查看价格表" : "View Pricing"}
                {showPricing ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          )}

          {/* Pricing Plans */}
          {shouldShowPricing && (
            <>
              <h2 className={`${themeClasses.text} text-2xl font-bold text-center mb-4`}>
                {!user
                  ? (language === "zh" ? "选择您的会员计划" : "Choose Your Membership Plan")
                  : user.is_vip
                    ? (language === "zh" ? "升级或续费您的会员" : "Upgrade or Renew Your Membership")
                    : (language === "zh" ? "升级到VIP会员" : "Upgrade to VIP Membership")
                }
              </h2>
              {user?.is_vip && vipStatus && (
                <p className={`${themeClasses.secondaryText} text-center mb-8`}>
                  {language === "zh"
                    ? `当前计划: ${vipStatus.plan} | 到期时间: ${vipStatus.vip_expiry_date ? new Date(vipStatus.vip_expiry_date).toLocaleDateString() : '永久'}`
                    : `Current Plan: ${vipStatus.plan} | Expires: ${vipStatus.vip_expiry_date ? new Date(vipStatus.vip_expiry_date).toLocaleDateString() : 'Lifetime'}`
                  }
                </p>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {getAvailablePlans().map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${themeClasses.card} ${themeClasses.cardHover} ${
                      plan.popular ? "ring-2 ring-yellow-500 border-l-4 border-yellow-500" : "border-l-4 border-gray-300"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white px-4 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          {t("vip.mostPopular")}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className={`${getThemeClass("text-black", "text-white")} text-2xl mb-2`}>
                        {language === "zh" ? plan.name : plan.nameEn}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={`${getThemeClass("text-black", "text-white")} text-3xl font-bold`}>
                            {`¥${plan.price}`}
                          </span>
                          <span className={getThemeClass("text-gray-500", "text-gray-400")}>
                            /{language === "zh" ? plan.period : plan.periodEn}
                          </span>
                        </div>
                        {plan.originalPrice > plan.price && plan.price > 0 && (
                          <div className="flex items-center justify-center space-x-2">
                            <span className={getThemeClass("text-gray-500 line-through", "text-gray-400 line-through")}>
                              {language === "zh" ? "原价" : "Was"} ¥{plan.originalPrice}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {t("vip.save")}
                              {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {(language === "zh" ? plan.features : plan.featuresEn).map((feature, index) => (
                          <li
                            key={index}
                            className={`flex items-center ${getThemeClass("text-gray-600", "text-gray-300")}`}
                          >
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full ${
                          plan.id === "free"
                            ? "bg-gray-500 hover:bg-gray-600"
                            : plan.popular
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              : plan.id === "svip"
                                ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                : "bg-purple-600 hover:bg-purple-700"
                        } text-white`}
                        size="lg"
                        disabled={
                          plan.id === "free" ||
                          (vipStatus?.plan === "SVIP" && plan.id === "vip") // Disable VIP for SVIP users
                        }
                      >
                        {plan.id === "free" ? (
                          t("vip.currentPlan")
                        ) : vipStatus?.plan === "SVIP" && plan.id === "vip" ? (
                          language === "zh" ? "不可降级" : "Cannot Downgrade"
                        ) : !user ? (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            {language === "zh" ? "选择此计划" : "Choose Plan"}
                          </>
                        ) : user.is_vip && plan.id === vipStatus?.plan_code?.toLowerCase() ? (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            {language === "zh" ? "续费" : "Renew"}
                          </>
                        ) : user.is_vip && vipStatus?.plan_code === "vip" && plan.id === "svip" ? (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            {language === "zh" ? "升级到SVIP" : "Upgrade to SVIP"}
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            {t("vip.subscribe")}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className={`${getThemeClass("text-black", "text-white")} text-2xl font-bold text-center mb-8`}>
              {language === "zh" ? "常见问题" : "Frequently Asked Questions"}
            </h3>
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <Card
                  key={index}
                  className={`${getThemeClass("bg-white/80 border-gray-300", "bg-white/10 border-white/20")}`}
                >
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-black/5"
                    >
                      <span className={`${getThemeClass("text-gray-800", "text-white")} font-semibold`}>
                        {language === "zh" ? faq.question : faq.questionEn}
                      </span>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-6">
                        <p className={`${getThemeClass("text-gray-600", "text-gray-300")}`}>
                          {language === "zh" ? faq.answer : faq.answerEn}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-6xl mx-auto">
            <h3 className={`${getThemeClass("text-black", "text-white")} text-2xl font-bold text-center mb-8`}>
              {t("vip.featureComparison")}
            </h3>
            <Card className={`${getThemeClass("bg-white/80 border-gray-300", "bg-white/10 border-white/20")}`}>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200/20">
                        <th className={`${getThemeClass("text-gray-800", "text-white")} p-4 text-left font-semibold`}>
                          {language === "zh" ? "功能" : "Features"}
                        </th>
                        <th className={`${getThemeClass("text-gray-800", "text-white")} p-4 text-center font-semibold`}>
                          {language === "zh" ? "免费版" : "Free"}
                        </th>
                        <th className={`${getThemeClass("text-gray-800", "text-white")} p-4 text-center font-semibold`}>
                          VIP
                        </th>
                        <th className={`${getThemeClass("text-gray-800", "text-white")} p-4 text-center font-semibold`}>
                          SVIP
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200/10">
                          <td className={`${getThemeClass("text-gray-700", "text-gray-300")} p-4`}>
                            {language === "zh" ? item.feature : item.featureEn}
                          </td>
                          <td className={`${getThemeClass("text-gray-600", "text-gray-400")} p-4 text-center`}>
                            {item.free}
                          </td>
                          <td className={`${getThemeClass("text-gray-600", "text-gray-400")} p-4 text-center`}>
                            {item.vip}
                          </td>
                          <td className={`${getThemeClass("text-gray-600", "text-gray-400")} p-4 text-center`}>
                            {item.svip}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
