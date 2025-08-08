"use client"

import { useState, useEffect } from "react"
import { Play, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { usePageTitle } from "@/hooks/use-page-title"

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0)
  const { language, t } = useLanguage()

  // Set page title
  usePageTitle("home")

  const sections = [
    {
      title: language === "zh" ? "电影哲学家" : "Movie Philosopher",
      subtitle: language === "zh" ? "AI驱动的电影分析视频生成器" : "AI-Powered Movie Analysis Video Generator",
      description:
        language === "zh" ? "让人工智能为您创作深度电影分析视频" : "Let AI create deep movie analysis videos for you",
    },
    {
      title: language === "zh" ? "深度分析" : "Deep Analysis",
      subtitle: language === "zh" ? "专业的电影解读" : "Professional Movie Interpretation",
      description:
        language === "zh"
          ? "从多个维度解析电影的艺术价值和深层含义"
          : "Analyze artistic value and deep meanings from multiple dimensions",
    },
    {
      title: language === "zh" ? "个性定制" : "Personalized",
      subtitle: language === "zh" ? "量身打造的分析风格" : "Tailored Analysis Style",
      description:
        language === "zh"
          ? "选择您喜欢的叙述语调、分析角度和配音风格"
          : "Choose your preferred narrative tone, analysis angle, and voice style",
    },
    {
      title: language === "zh" ? "一键生成" : "One-Click Generation",
      subtitle: language === "zh" ? "简单快捷的创作流程" : "Simple and Fast Creation Process",
      description:
        language === "zh" ? "几分钟内获得专业级的电影分析视频" : "Get professional movie analysis videos in minutes",
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
                {language === "zh" ? "电影哲学家" : "Movie Philosopher"}
              </span>
            </div>
            <Link href="/auth?redirect=movie-selection">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative z-10">
                {language === "zh" ? "登录" : "Login"}
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
                          {language === "zh" ? "选个电影" : "Pick a Movie"}
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
