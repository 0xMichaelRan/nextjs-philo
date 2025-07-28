"use client"

import Link from "next/link"
import { Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"

interface UpgradeVipCardProps {
  className?: string
}

export function UpgradeVipCard({ className = "" }: UpgradeVipCardProps) {
  const { language } = useLanguage()

  return (
    <Card className={`bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 ${className}`}>
      <CardContent className="p-6 text-center">
        <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-gray-900 text-xl font-semibold mb-2">
          {language === "zh" ? "升级VIP会员" : "Upgrade to VIP"}
        </h3>
        <p className="text-gray-700 mb-4">
          {language === "zh"
            ? "解锁无限生成、高清画质、优先处理等特权"
            : "Unlock unlimited generation, HD quality, priority processing"}
        </p>
        <Link href="/payment?plan=vip">
          <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            {language === "zh" ? "立即升级" : "Upgrade Now"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
