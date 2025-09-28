"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, X, Mic, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "@/contexts/theme-context"

interface VipUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  onUpgrade?: () => void
  currentUserTier?: 'free' | 'vip' | 'svip'  // Add user tier information
}

export function VipUpgradeModal({ isOpen, onClose, feature, onUpgrade, currentUserTier = 'free' }: VipUpgradeModalProps) {
  const router = useRouter()
  const { language, t } = useLanguage()
  const { theme } = useTheme()

  if (!isOpen) return null

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        overlay: "bg-black/50",
        modal: "bg-white border-gray-200",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        accent: "text-purple-600",
      }
    }
    return {
      overlay: "bg-black/70",
      modal: "bg-gray-900 border-gray-700",
      text: "text-white",
      secondaryText: "text-gray-300",
      accent: "text-purple-400",
    }
  }

  const themeClasses = getThemeClasses()

  // Determine upgrade messaging based on current user tier
  const getUpgradeInfo = () => {
    if (currentUserTier === 'vip') {
      return {
        title: language === "zh" ? "升级到SVIP" : "Upgrade to SVIP",
        description: language === "zh" ? "解锁更多专属功能和更高限额" : "Unlock more exclusive features and higher limits",
        buttonText: language === "zh" ? "升级到SVIP" : "Upgrade to SVIP",
        price: "¥39",
        period: language === "zh" ? "/月" : "/month"
      }
    } else {
      return {
        title: language === "zh" ? "升级到VIP" : "Upgrade to VIP",
        description: language === "zh" ? "立即升级VIP，解锁所有专属功能" : "Upgrade to VIP now and unlock all exclusive features",
        buttonText: language === "zh" ? "立即升级" : "Upgrade Now",
        price: "¥19",
        period: language === "zh" ? "/月" : "/month"
      }
    }
  }

  const upgradeInfo = getUpgradeInfo()

  const handleUpgrade = () => {
    onClose()
    if (onUpgrade) {
      onUpgrade()
    } else {
      window.open(`${process.env.NEXT_PUBLIC_BLOG_URL}/pricing`)
    }
  }

  const getFeatureContent = () => {
    switch (feature) {
      case 'custom-voice':
        return {
          icon: <Mic className="w-12 h-12 text-purple-500" />,
          title: language === "zh" ? "专属声音录制" : "Custom Voice Recording",
          description: language === "zh" 
            ? "录制您的专属声音，让AI用您的声音来解说电影，打造独一无二的个人化体验。"
            : "Record your own voice and let AI use it to narrate movies, creating a unique personalized experience.",
          benefits: language === "zh" 
            ? [
                "录制多个专属声音",
                "高质量音频处理",
                "无限次使用",
                "专业音频优化"
              ]
            : [
                "Record multiple custom voices",
                "High-quality audio processing", 
                "Unlimited usage",
                "Professional audio optimization"
              ]
        }
      default:
        return {
          icon: <Crown className="w-12 h-12 text-purple-500" />,
          title: language === "zh" ? "VIP专属功能" : "VIP Exclusive Feature",
          description: language === "zh" 
            ? "此功能仅限VIP会员使用，升级后即可解锁更多专属特权。"
            : "This feature is exclusive to VIP members. Upgrade to unlock more exclusive privileges.",
          benefits: language === "zh" 
            ? [
                "无限视频生成",
                "高清画质输出",
                "优先处理队列",
                "专属客服支持"
              ]
            : [
                "Unlimited video generation",
                "HD quality output",
                "Priority processing queue",
                "Dedicated customer support"
              ]
        }
    }
  }

  const featureContent = getFeatureContent()

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeClasses.overlay}`}>
      <Card className={`w-full max-w-md ${themeClasses.modal} shadow-2xl`}>
        <CardHeader className="relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {featureContent.icon}
            </div>
            <CardTitle className={`text-xl font-bold ${themeClasses.text}`}>
              {featureContent.title}
            </CardTitle>
            <div className="flex justify-center mt-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                VIP {language === "zh" ? "专属" : "Exclusive"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className={`text-center ${themeClasses.secondaryText}`}>
            {featureContent.description}
          </p>

          <div className="space-y-3">
            <h4 className={`font-semibold ${themeClasses.text} flex items-center`}>
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              {language === "zh" ? "VIP特权" : "VIP Benefits"}
            </h4>
            <ul className="space-y-2">
              {featureContent.benefits.map((benefit, index) => (
                <li key={index} className={`flex items-center ${themeClasses.secondaryText}`}>
                  <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
            <div className="text-center">
              <p className={`text-sm ${themeClasses.secondaryText} mb-2`}>
                {upgradeInfo.description}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <span className={`text-lg font-bold ${themeClasses.accent}`}>
                  {upgradeInfo.price}
                </span>
                <span className={`text-sm ${themeClasses.secondaryText}`}>
                  {upgradeInfo.period}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {language === "zh" ? "稍后再说" : "Maybe Later"}
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              {upgradeInfo.buttonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
