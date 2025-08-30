"use client"

import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

interface VipBadgeProps {
  isVip: boolean
  isSvip?: boolean
  daysRemaining?: number | null
  showDaysRemaining?: boolean
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
}

export function VipBadge({
  isVip,
  isSvip = false,
  daysRemaining,
  showDaysRemaining = false,
  size = "md",
  onClick,
  className = ""
}: VipBadgeProps) {
  const router = useRouter()
  const { language } = useLanguage()

  if (!isVip) {
    return null
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push('/vip')
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-1"
      case "lg":
        return "text-sm px-3 py-1.5"
      default:
        return "text-xs px-2.5 py-1"
    }
  }

  const getGradientClasses = () => {
    if (isSvip) {
      return "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    }
    return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
  }

  const getTierLabel = () => {
    return isSvip ? "SVIP" : "VIP"
  }

  const getDisplayText = () => {
    const tierLabel = getTierLabel()
    
    if (!showDaysRemaining || daysRemaining === null || daysRemaining === undefined) {
      return tierLabel
    }
    
    if (daysRemaining === 0) {
      return language === "zh" ? "今日到期" : "Expires today"
    }
    
    return `${tierLabel} ${daysRemaining} ${language === "zh" ? "天" : "Days"}`
  }

  return (
    <Badge
      className={`
        ${getGradientClasses()}
        ${getSizeClasses()}
        text-white
        cursor-pointer
        transition-all
        duration-200
        flex
        items-center
        gap-1
        ${className}
      `}
      onClick={handleClick}
    >
      <Crown className="w-3 h-3" />
      {getDisplayText()}
    </Badge>
  )
}
