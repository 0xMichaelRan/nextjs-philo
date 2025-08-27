"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Crown, Check, Video, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useFlow } from "@/hooks/use-flow"
import { usePageTitle } from "@/hooks/use-page-title"
import { VipUpgradeModal } from "@/components/vip-upgrade-modal"

const resolutionOptions = [
  {
    value: 480,
    label: "480p",
    name: "标清",
    nameEn: "SD",
    description: "适合快速预览和分享",
    descriptionEn: "Perfect for quick preview and sharing",
    free: true,
    quality: "basic",
    fileSize: "小",
    fileSizeEn: "Small",
    features: ["快速处理", "节省流量", "兼容性好"],
    featuresEn: ["Fast processing", "Data saving", "High compatibility"]
  },
  {
    value: 720,
    label: "720p",
    name: "高清",
    nameEn: "HD",
    description: "平衡画质与文件大小",
    descriptionEn: "Balanced quality and file size",
    free: false,
    quality: "good",
    fileSize: "中",
    fileSizeEn: "Medium",
    features: ["清晰画质", "适中文件", "流畅播放"],
    featuresEn: ["Clear quality", "Moderate size", "Smooth playback"]
  },
  {
    value: 1080,
    label: "1080p",
    name: "全高清",
    nameEn: "Full HD",
    description: "专业级画质体验",
    descriptionEn: "Professional quality experience",
    free: false,
    quality: "excellent",
    fileSize: "大",
    fileSizeEn: "Large",
    features: ["极致画质", "专业效果", "细节丰富"],
    featuresEn: ["Ultimate quality", "Professional effects", "Rich details"]
  }
]

export default function ResolutionSelectionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get('jobId')
  const returnTo = searchParams.get('returnTo') || `/voice-selection/${jobId}`
  
  const [showVipModal, setShowVipModal] = useState(false)

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { flowState, updateFlowState } = useFlow()

  // Set page title
  usePageTitle("resolutionSelection")

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 backdrop-blur-sm border-gray-200",
        cardHover: "hover:shadow-xl hover:scale-105",
        selectedCard: "ring-2 ring-purple-500 shadow-xl bg-purple-50/80",
        hoverCard: "hover:bg-gray-50/80",
        button: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
        filterButton: "bg-white/60 border-gray-300 text-gray-700 hover:bg-white/80",
        activeFilterButton: "bg-purple-100 border-purple-300 text-purple-700"
      }
    }
    return {
      background: "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/5 backdrop-blur-sm border-white/10",
      cardHover: "hover:shadow-2xl hover:scale-105",
      selectedCard: "ring-2 ring-purple-400 shadow-2xl bg-purple-900/20",
      hoverCard: "hover:bg-white/10",
      button: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
      filterButton: "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20",
      activeFilterButton: "bg-purple-900/50 border-purple-400 text-purple-300"
    }
  }

  const themeClasses = getThemeClasses()

  const handleBack = () => {
    router.back()
  }



  const handleResolutionSelect = (resolution: number) => {
    if (!user?.is_vip && resolution > 480) {
      setShowVipModal(true)
      return
    }

    // Update flow state with selected resolution
    updateFlowState({
      resolution: `${resolution}p`
    })

    // Navigate back immediately
    router.push(returnTo)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "basic": return "bg-gray-500"
      case "good": return "bg-blue-500"
      case "excellent": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <AppLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className={`mr-4 ${themeClasses.text} hover:bg-white/10`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "zh" ? "返回" : "Back"}
            </Button>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-purple-500 mr-3" />
              <h1 className={`text-3xl md:text-4xl font-bold ${themeClasses.text}`}>
                {language === "zh" ? "选择视频分辨率" : "Select Video Resolution"}
              </h1>
            </div>
            <p className={`text-lg ${themeClasses.secondaryText} max-w-2xl mx-auto`}>
              {language === "zh" 
                ? "选择适合您需求的视频分辨率。免费用户可使用480p，VIP用户享受更高分辨率。"
                : "Choose the video resolution that fits your needs. Free users can use 480p, VIP users enjoy higher resolutions."
              }
            </p>
          </div>

          {/* Resolution Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {resolutionOptions.map((option) => (
              <Card
                key={option.value}
                className={`${themeClasses.card} ${themeClasses.cardHover} ${
                  flowState.resolution === `${option.value}p` ? themeClasses.selectedCard : themeClasses.hoverCard
                } cursor-pointer transition-all duration-300 relative overflow-hidden`}
                onClick={() => handleResolutionSelect(option.value)}
              >
                {!option.free && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-black text-xs font-semibold">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-16 h-16 rounded-full ${getQualityColor(option.quality)} flex items-center justify-center text-white font-bold text-lg`}>
                      {option.label}
                    </div>
                  </div>
                  <CardTitle className={`text-xl ${themeClasses.text}`}>
                    {language === "zh" ? option.name : option.nameEn}
                  </CardTitle>
                  <p className={`text-sm ${themeClasses.secondaryText}`}>
                    {language === "zh" ? option.description : option.descriptionEn}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${themeClasses.secondaryText}`}>
                        {language === "zh" ? "文件大小" : "File Size"}
                      </span>
                      <Badge variant="outline" className={`text-xs ${themeClasses.text} border-gray-300 dark:border-gray-600`}>
                        {language === "zh" ? option.fileSize : option.fileSizeEn}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {(language === "zh" ? option.features : option.featuresEn).map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className={`text-sm ${themeClasses.text}`}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResolutionSelect(option.value)
                      }}
                      variant={flowState.resolution === `${option.value}p` ? "default" : "outline"}
                      className={`w-full mt-4 ${
                        flowState.resolution === `${option.value}p`
                          ? `${themeClasses.button} text-white`
                          : !option.free && !user?.is_vip
                            ? "opacity-50 cursor-not-allowed border-gray-400 text-gray-400"
                            : `border-gray-300 dark:border-gray-600 ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800`
                      }`}
                      disabled={!option.free && !user?.is_vip}
                    >
                      {flowState.resolution === `${option.value}p`
                        ? (language === "zh" ? "已选择" : "Selected")
                        : !option.free && !user?.is_vip
                          ? (language === "zh" ? "需要VIP" : "VIP Required")
                          : (language === "zh" ? "选择" : "Select")
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* VIP Benefits Section */}
          {!user?.is_vip && (
            <Card className={`${themeClasses.card} mb-8`}>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-yellow-500 mr-3" />
                  <h3 className={`text-2xl font-bold ${themeClasses.text}`}>
                    {language === "zh" ? "升级VIP，解锁高清画质" : "Upgrade to VIP, Unlock HD Quality"}
                  </h3>
                </div>
                <p className={`text-lg ${themeClasses.secondaryText} mb-6 max-w-2xl mx-auto`}>
                  {language === "zh" 
                    ? "VIP会员享受720p和1080p高清分辨率，让您的视频更加清晰专业。"
                    : "VIP members enjoy 720p and 1080p HD resolutions, making your videos clearer and more professional."
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-500 mr-2" />
                    <span className={themeClasses.text}>
                      {language === "zh" ? "720p高清画质" : "720p HD Quality"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-500 mr-2" />
                    <span className={themeClasses.text}>
                      {language === "zh" ? "1080p全高清画质" : "1080p Full HD Quality"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowVipModal(true)}
                  className={`${themeClasses.button} text-white px-8 py-3 text-lg`}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  {language === "zh" ? "立即升级VIP" : "Upgrade to VIP Now"}
                </Button>
              </CardContent>
            </Card>
          )}


        </div>

        {/* VIP Upgrade Modal */}
        <VipUpgradeModal
          isOpen={showVipModal}
          onClose={() => setShowVipModal(false)}
          feature={language === "zh" ? "高清分辨率" : "HD Resolution"}
        />
      </AppLayout>
    </div>
  )
}
