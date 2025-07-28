"use client"

import { useState } from "react"
import { MessageCircle, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"

interface CustomerSupportCardProps {
  className?: string
}

export function CustomerSupportCard({ className = "" }: CustomerSupportCardProps) {
  const { language } = useLanguage()
  const [showQRCode, setShowQRCode] = useState(false)

  return (
    <Card className={`bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 ${className}`}>
      <CardContent className="p-6 text-center">
        <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-gray-900 text-xl font-semibold mb-2">
          {language === "zh" ? "客服支持" : "Customer Support"}
        </h3>
        <p className="text-gray-700 mb-4">
          {language === "zh" ? "遇到问题？联系我们的客服团队" : "Need help? Contact our support team"}
        </p>
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              <QrCode className="w-4 h-4 mr-2" />
              {language === "zh" ? "客服二维码" : "Support QR Code"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="text-center p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {language === "zh" ? "客服二维码" : "Customer Support QR Code"}
              </h3>
              <div className="bg-white p-4 rounded-lg border inline-block">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-500 text-sm">
                    {language === "zh" ? "客服二维码" : "Support QR Code"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {language === "zh"
                  ? "扫描二维码联系客服"
                  : "Scan QR code to contact support"}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
