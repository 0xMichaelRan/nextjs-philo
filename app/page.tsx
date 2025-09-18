"use client"

import { useState, useEffect } from "react"
import { Play, ChevronDown, Film, Users, Settings, Mic, ArrowRight } from "lucide-react"
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
      icon: Play,
      isIntro: true,
    },
    {
      title: t("home.step1.title"),
      subtitle: t("home.step1.subtitle"),
      description: t("home.step1.description"),
      icon: Film,
      stepNumber: "01",
    },
    {
      title: t("home.step2.title"),
      subtitle: t("home.step2.subtitle"),
      description: t("home.step2.description"),
      icon: Users,
      stepNumber: "02",
    },
    {
      title: t("home.step3.title"),
      subtitle: t("home.step3.subtitle"),
      description: t("home.step3.description"),
      icon: Settings,
      stepNumber: "03",
    },
    {
      title: t("home.step4.title"),
      subtitle: t("home.step4.subtitle"),
      description: t("home.step4.description"),
      icon: Mic,
      stepNumber: "04",
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
            <div className="flex items-center space-x-4">
              <Link href={`${process.env.NEXT_PUBLIC_BLOG_URL}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative z-10">
                  {language === "zh" ? "博客" : "Blog"}
                </Button>
              </Link>
              <Link href="/auth?redirect=movie-selection">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative z-10">
                  {t("home.login")}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-5xl mx-auto px-6">
            <div
              className="transition-all duration-1000 ease-in-out"
              style={{
                transform: `translateY(${-currentSection * 100}vh)`,
                height: `${sections.length * 100}vh`,
              }}
            >
              {sections.map((section, index) => (
                <div key={index} className="h-screen flex flex-col justify-center items-center">
                  {/* Step Number and Icon */}
                  <div className="mb-8 flex flex-col items-center">
                    {section.stepNumber && (
                      <div className="text-6xl md:text-8xl font-bold text-white/10 mb-4 animate-pulse">
                        {section.stepNumber}
                      </div>
                    )}
                    <div className="relative">
                      {/* Animated background rings */}
                      <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 animate-ping" />
                      <div className="absolute inset-1 w-22 h-22 md:w-30 md:h-30 rounded-full bg-gradient-to-r from-orange-400/30 via-pink-400/30 to-purple-400/30 animate-pulse" />

                      {/* Main icon container */}
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 flex items-center justify-center mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                        <section.icon className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" />
                      </div>

                      {section.stepNumber && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-orange-400">
                          <span className="text-sm font-bold text-gray-800">{section.stepNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="max-w-3xl">
                    <h1 className={`${section.isIntro ? 'text-5xl md:text-7xl' : 'text-4xl md:text-6xl'} font-bold text-white mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent`}>
                      {section.title}
                    </h1>
                    <h2 className="text-xl md:text-2xl text-orange-300 mb-6 font-light">{section.subtitle}</h2>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">{section.description}</p>
                  </div>

                  {/* Action Button */}
                  {index === sections.length - 1 && (
                    <div className="mt-12">
                      <Link href="/auth?redirect=movie-selection">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                        >
                          {t("home.pickMovie")}
                          <ArrowRight className="w-6 h-6" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Progress Indicator for Steps */}
                  {section.stepNumber && (
                    <div className="mt-8 flex items-center gap-2">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full transition-all duration-500 ${
                              i < parseInt(section.stepNumber) ? 'bg-orange-400 shadow-lg' : 'bg-white/20'
                            }`}
                          />
                          {i < 3 && (
                            <div
                              className={`w-8 h-0.5 mx-1 transition-all duration-500 ${
                                i < parseInt(section.stepNumber) - 1 ? 'bg-orange-400' : 'bg-white/20'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next Step Hint */}
                  {section.stepNumber && parseInt(section.stepNumber) < 4 && (
                    <div className="mt-6 text-sm text-white/60 animate-bounce">
                      <ChevronDown className="w-5 h-5 mx-auto" />
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
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`group flex items-center transition-all duration-300 ${
                index === currentSection ? "scale-110" : "hover:scale-105"
              }`}
              title={section.title}
            >
              <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSection ? "bg-orange-400 shadow-lg" : "bg-white/30 hover:bg-white/50"
              }`} />
              {section.stepNumber && (
                <span className={`ml-3 text-xs font-semibold transition-all duration-300 ${
                  index === currentSection ? "text-orange-400 opacity-100" : "text-white/60 opacity-0 group-hover:opacity-100"
                }`}>
                  {section.stepNumber}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
