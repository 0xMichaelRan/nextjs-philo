"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"

interface MobileBottomBarProps {
  children: React.ReactNode
  className?: string
  show?: boolean
}

export function MobileBottomBar({
  children,
  className = "",
  show = true
}: MobileBottomBarProps) {
  const { theme } = useTheme()

  if (!show) return null

  return (
    <>
      {/* Bottom padding to prevent content from being hidden behind fixed bar */}
      <div className="h-20 md:hidden"></div>
      
      {/* Fixed Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 p-4 safe-area-pb">
        <div className={`w-full ${className}`}>
          {children}
        </div>
      </div>
    </>
  )
}
