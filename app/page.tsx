"use client"

import { useState, useEffect } from "react"
import { Play, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { usePageTitle } from "@/hooks/use-page-title"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0)
  const { language, t } = useLanguage()

  // Home page doesn't require authentication
  useAuthGuard({ requireAuth: false })

  // Set page title
  usePageTitle("home")

  const sections = [
    {
      title: t("home.title"),
      subtitle: t("home.subtitle"),
      description: t("home.description"),
    },
    {
      title: t("home.deepAnalysis.title"),
      subtitle: t("home.deepAnalysis.subtitle"),
      description: t("home.deepAnalysis.description"),
    },
    {
      title: t("home.personalized.title"),
      subtitle: t("home.personalized.subtitle"),
      description: t("home.personalized.description"),
    },
    {
      title: t("home.oneClick.title"),
      subtitle: t("home.oneClick.subtitle"),
      description: t("home.oneClick.description"),
    },
  ]

  const handleScroll = (direction: "up" | "down") => {
    if (direction === "down" && currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1)
    } else if (direction === "up" && currentSection > 0) {
      setCurrentSection((prev) => prev - 1)
    }
  }

  useEffect(() => {
    let startY = 0
    let isScrolling = false

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return

      const endY = e.changedTouches[0].clientY
      const deltaY = startY - endY
      const threshold = 50

      if (Math.abs(deltaY) > threshold) {
        isScrolling = true
        if (deltaY > 0) {
          handleScroll("down")
        } else {
          handleScroll("up")
        }

        setTimeout(() => {
          isScrolling = false
        }, 800)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return

      e.preventDefault()
      isScrolling = true

      if (e.deltaY > 0) {
        handleScroll("down")
      } else {
        handleScroll("up")
      }

      setTimeout(() => {
        isScrolling = false
      }, 800)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return

      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        isScrolling = true
        handleScroll("down")
        setTimeout(() => {
          isScrolling = false
        }, 800)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        isScrolling = true
        handleScroll("up")
        setTimeout(() => {
          isScrolling = false
        }, 800)
      }
    }

    // Add event listeners
    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentSection, sections.length])

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/2544523-hd_1920_1080_24fps.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-orange-900/80" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="relative z-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Play className="w-8 h-8 text-orange-400" />
              <span className="text-white font-bold text-xl">
                {t("home.title")}
              </span>
            </div>
            <Link href="/auth?redirect=movie-selection">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative z-10">
                {t("home.login")}
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-6">
            <div
              className="transition-all duration-1000 ease-in-out"
              style={{
                transform: `translateY(${-currentSection * 100}vh)`,
                height: `${sections.length * 100}vh`,
              }}
            >
              {sections.map((section, index) => (
                <div key={index} className="h-screen flex flex-col justify-center">
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {section.title}
                  </h1>
                  <h2 className="text-2xl md:text-3xl text-orange-300 mb-8 font-light">{section.subtitle}</h2>
                  <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">{section.description}</p>

                  {index === sections.length - 1 && (
                    <div className="mt-12">
                      <Link href="/movie-selection">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                          {t("home.pickMovie")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {currentSection < sections.length - 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60" />
          </div>
        )}

        {/* Section Indicators */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSection ? "bg-orange-400 scale-125" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
