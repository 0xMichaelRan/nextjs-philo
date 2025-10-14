"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "@/contexts/theme-context"
import { getStandardThemeClasses } from "@/lib/theme-utils"

interface PageNavigationProps {
  onPrevious?: () => void
  onNext?: () => void
  previousLabel?: string
  nextLabel?: string
  showPrevious?: boolean
  showNext?: boolean
  nextDisabled?: boolean
  previousDisabled?: boolean
  className?: string
}

export function PageNavigation({
  onPrevious,
  onNext,
  previousLabel,
  nextLabel,
  showPrevious = true,
  showNext = true,
  nextDisabled = false,
  previousDisabled = false,
  className = ""
}: PageNavigationProps) {
  const { language } = useLanguage()
  const { theme } = useTheme()

  const themeClasses = getStandardThemeClasses(theme)

  const defaultPreviousLabel = language === "zh" ? "上一步" : "Previous"
  const defaultNextLabel = language === "zh" ? "下一步" : "Next"

  return (
    <div className={`flex justify-between items-center pt-6 ${className}`}>
      {showPrevious ? (
        <Button
          onClick={onPrevious}
          disabled={previousDisabled}
          variant="outline"
          className={`${themeClasses.outlineButton} ${previousDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {previousLabel || defaultPreviousLabel}
        </Button>
      ) : (
        <div></div>
      )}

      {showNext ? (
        <Button
          onClick={onNext}
          disabled={nextDisabled}
          className={`${themeClasses.button} ${nextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {nextLabel || defaultNextLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <div></div>
      )}
    </div>
  )
}
