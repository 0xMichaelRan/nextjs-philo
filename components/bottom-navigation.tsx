"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

interface BottomNavigationProps {
  onBack?: () => void
  onNext?: () => void
  backLabel?: string
  nextLabel?: string
  nextDisabled?: boolean
  backDisabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function BottomNavigation({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  nextDisabled = false,
  backDisabled = false,
  className = "",
  children
}: BottomNavigationProps) {
  const { theme } = useTheme()
  const { language } = useLanguage()

  const defaultBackLabel = language === "zh" ? "上一步" : "Previous"
  const defaultNextLabel = language === "zh" ? "下一步" : "Next"

  return (
    <>
      {/* Bottom padding to prevent content from being hidden behind fixed navigation */}
      <div className="h-20"></div>
      
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10 z-40">
        <div className={`container mx-auto flex justify-between items-center ${className}`}>
          {onBack ? (
            <Button
              onClick={onBack}
              variant="outline"
              disabled={backDisabled}
              className="bg-transparent border-white/30 text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel || defaultBackLabel}
            </Button>
          ) : (
            <div></div>
          )}

          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}

          {onNext ? (
            <Button
              onClick={onNext}
              disabled={nextDisabled}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
            >
              {nextLabel || defaultNextLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </>
  )
}
