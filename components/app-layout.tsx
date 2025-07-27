"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Film, User, Play, Search, Menu, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [hideUserStats, setHideUserStats] = useState(false)
  const [hideUpgradeCTA, setHideUpgradeCTA] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, logout } = useAuth()

  // Ensure cards are visible on page load
  useEffect(() => {
    setHideUserStats(false)
    setHideUpgradeCTA(false)
  }, [])

  const getThemeClasses = () => {
    if (theme === "light") {
      return "bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400"
    }
    return "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900"
  }

  const getNavThemeClasses = () => {
    if (theme === "light") {
      return "bg-white/95 backdrop-blur-md border-gray-200/50"
    }
    return "bg-slate-900/95 backdrop-blur-md border-white/10"
  }

  const getTopBarThemeClasses = () => {
    if (theme === "light") {
      return "bg-white/90 backdrop-blur-md border-gray-200/50"
    }
    return "bg-slate-900/90 backdrop-blur-md border-white/10"
  }

  const getTextClasses = () => {
    if (theme === "light") {
      return "text-gray-800"
    }
    return "text-white"
  }

  const getCardClasses = () => {
    if (theme === "light") {
      return "bg-white/80 border-gray-200/50"
    }
    return "bg-white/10 border-white/20"
  }

  const navItems = [
    { href: "/movie-selection", icon: Search, label: t("nav.movieSelection") },
    { href: "/video-generation", icon: Film, label: t("nav.myVideos") },
  ]

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  const handleOutsideClick = () => {
    setIsNavOpen(false)
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      {/* Top Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${getTopBarThemeClasses()} border-b h-16`}>
        <div className="flex items-center justify-between h-full px-4">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavOpen(!isNavOpen)}
            className={`${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
          >
            {isNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Logo - Centered and Clickable */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <Play className={`w-6 h-6 ${theme === "light" ? "text-purple-600" : "text-orange-400"}`} />
            <span className={`font-bold text-lg ${getTextClasses()}`}>
              {language === "zh" ? "电影哲学家" : "Movie Philosopher"}
            </span>
          </Link>

          {/* Notification Button */}
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="sm"
              className={`${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
            >
              <Bell className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Overlay */}
      {isNavOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={handleOutsideClick} />}

      {/* Sidebar Navigation */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 transform transition-transform duration-300 ease-in-out ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } w-[76%] md:w-80`}
      >
        <div className={`h-full ${getNavThemeClasses()} border-r flex flex-col`}>
          {/* Navigation Items */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsNavOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 ${
                      theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User Stats - Only show when user is logged in and not hidden */}
            {user && !hideUserStats && (
              <Card className={`${getCardClasses()} mt-6 relative`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHideUserStats(true)}
                  className="absolute top-2 right-2 w-6 h-6 p-0 hover:bg-red-500/20"
                >
                  <X className="w-3 h-3" />
                </Button>
                <CardContent className="p-4">
                  <h3 className={`${getTextClasses()} font-semibold mb-3`}>{t("nav.usageStats")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className={`flex justify-between ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                      <span>{t("nav.dailyRemaining")}</span>
                      <span className={getTextClasses()}>{user.isVip ? "∞" : "0/1"}</span>
                    </div>
                    <div className={`flex justify-between ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                      <span>{t("nav.totalGenerated")}</span>
                      <span className={getTextClasses()}>15</span>
                    </div>
                    <div className={`flex justify-between ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                      <span>{t("nav.memberStatus")}</span>
                      <Badge
                        className={`text-xs ${
                          user.isVip
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {user.isVip ? "VIP" : t("nav.freeUser")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upgrade CTA - Only show for non-VIP users and not hidden */}
            {user && !user.isVip && !hideUpgradeCTA && (
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 mt-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHideUpgradeCTA(true)}
                  className="absolute top-2 right-2 w-6 h-6 p-0 hover:bg-red-500/20"
                >
                  <X className="w-3 h-3" />
                </Button>
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">👑</span>
                  </div>
                  <h3 className={`${getTextClasses()} font-semibold mb-1`}>{t("nav.upgradeVip")}</h3>
                  <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} text-xs mb-3`}>
                    {t("nav.unlimitedGeneration")} · {t("nav.hdQuality")}
                  </p>
                  <Link href="/vip" onClick={() => setIsNavOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      {t("nav.upgradeNow")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200/20">
            {/* User Profile */}
            {user ? (
              <div className="mb-4">
                <Link href="/profile" onClick={() => setIsNavOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 ${
                      theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                    }`}
                  >
                    <User className="w-5 h-5 mr-3" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>{user.phone}</p>
                    </div>
                    {user.isVip && <Badge className="bg-yellow-500 text-black text-xs">VIP</Badge>}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mb-4">
                <Link href="/auth" onClick={() => setIsNavOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 ${
                      theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                    }`}
                  >
                    <User className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">{t("nav.login")}</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Toggle Buttons */}
            <div className="space-y-2">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className={`w-full justify-start h-10 ${
                  theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">Language</span>
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                      theme === "light" ? "bg-gray-200" : "bg-white/20"
                    }`}
                  >
                    <span className={language === "zh" ? "font-semibold" : "opacity-60"}>CN</span>
                    <span className="opacity-40">|</span>
                    <span className={language === "en" ? "font-semibold" : "opacity-60"}>EN</span>
                  </div>
                </div>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className={`w-full justify-start h-10 ${
                  theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{t("nav.darkMode")}</span>
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                      theme === "light" ? "bg-gray-200" : "bg-white/20"
                    }`}
                  >
                    <span className={`${theme === "light" ? "opacity-100" : "opacity-60"}`}>☀️</span>
                    <span className="opacity-40">|</span>
                    <span className={`${theme === "dark" ? "opacity-100" : "opacity-60"}`}>🌙</span>
                  </div>
                </div>
              </Button>

              {/* Logout Button */}
              {user && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout()
                    setIsNavOpen(false)
                  }}
                  className={`w-full justify-start h-10 ${
                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm">{t("nav.logout")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        {/* Page Title */}
        {title && (
          <div className={`sticky top-16 z-30 ${getTopBarThemeClasses()} border-b`}>
            <div className="px-6 py-4">
              <h1 className={`text-xl font-bold ${getTextClasses()}`}>{title}</h1>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  )
}
