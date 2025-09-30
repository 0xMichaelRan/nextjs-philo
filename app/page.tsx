"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
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
      description: t("home.description"),
      isIntro: true,
      image: "/assets/imgs/intro-hero.jpg"
    },
    {
      title: t("home.step1.title"),
      description: t("home.step1.description"),
      stepNumber: "01",
      image: "/assets/imgs/step-movie-selection.jpg"
    },
    {
      title: t("home.step2.title"),
      description: t("home.step2.description"),
      stepNumber: "02",
      image: "/assets/imgs/step-analysis-config.jpg"
    },
    {
      title: t("home.step3.title"),
      description: t("home.step3.description"),
      stepNumber: "03",
      image: "/assets/imgs/step-prompt-config.jpg"
    },
    {
      title: t("home.step4.title"),
      description: t("home.step4.description"),
      stepNumber: "04",
      image: "/assets/imgs/step-voice-selection.jpg"
    },
    {
      title: t("home.step5.title"),
      description: t("home.step5.description"),
      stepNumber: "05",
      image: "/assets/imgs/step-script-review.jpg"
    },
    {
      title: t("home.step6.title"),
      description: t("home.step6.description"),
      stepNumber: "06",
      image: "/assets/imgs/step-job-pending.jpg"
    },
    {
      title: t("home.step7.title"),
      description: t("home.step7.description"),
      stepNumber: "07",
      image: "/assets/imgs/step-video-complete.jpg"
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
        <source src="/NBA-game-promotion.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-orange-900/80" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="relative z-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  width={87}
                  height={27}
                  className="block transition-opacity duration-300"
                  alt="Philo"
                  src="/static/imgs/logo-night.svg"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`${process.env.NEXT_PUBLIC_BLOG_URL}`} rel="noopener noreferrer">
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
                  {/* Step Number */}
                  {section.stepNumber && (
                    <div className="text-4xl md:text-6xl font-bold text-white/20 mb-6 animate-pulse">
                      {section.stepNumber}
                    </div>
                  )}

                  {/* Main Image */}
                  <div className="mb-8 relative">
                    <div className="w-80 h-48 md:w-96 md:h-60 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300">
                      <Image
                        src={section.image}
                        alt={section.title}
                        width={384}
                        height={240}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg?height=240&width=384&text=" + encodeURIComponent(section.title);
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Step number badge */}
                      {section.stepNumber && (
                        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">{section.stepNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="max-w-4xl text-center">
                    <h1 className={`${section.isIntro ? 'text-5xl md:text-7xl' : 'text-4xl md:text-6xl'} font-bold text-white mb-8 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent`}>
                      {section.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">{section.description}</p>
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
                    <div className="mt-8 flex items-center gap-2 flex-wrap justify-center">
                      {Array.from({ length: 7 }, (_, i) => (
                        <div key={i} className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full transition-all duration-500 ${
                              i < parseInt(section.stepNumber) ? 'bg-orange-400 shadow-lg' : 'bg-white/20'
                            }`}
                          />
                          {i < 6 && (
                            <div
                              className={`w-6 h-0.5 mx-1 transition-all duration-500 ${
                                i < parseInt(section.stepNumber) - 1 ? 'bg-orange-400' : 'bg-white/20'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next Step Hint */}
                  {section.stepNumber && parseInt(section.stepNumber) < 7 && (
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
