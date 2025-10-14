"use client"

import type React from "react"
import { useTheme } from "@/contexts/theme-context"
import { GlobalFooter } from "@/components/global-footer"
import Header from "@/components/layout/Header"
import { getStandardThemeClasses } from "@/lib/theme-utils"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useTheme()
  const themeClasses = getStandardThemeClasses(theme)

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div>
        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

        {/* Global Footer */}
        <GlobalFooter />
      </div>
    </div>
  )
}
