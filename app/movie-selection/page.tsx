"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"

const popularMovies = [
  {
    id: 1,
    titleCn: "肖申克的救赎",
    titleEn: "The Shawshank Redemption",
    year: "1994",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.7,
  },
  {
    id: 2,
    titleCn: "霸王别姬",
    titleEn: "Farewell My Concubine",
    year: "1993",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.6,
  },
  {
    id: 3,
    titleCn: "阿甘正传",
    titleEn: "Forrest Gump",
    year: "1994",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.5,
  },
  {
    id: 4,
    titleCn: "泰坦尼克号",
    titleEn: "Titanic",
    year: "1997",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.4,
  },
  {
    id: 5,
    titleCn: "这个杀手不太冷",
    titleEn: "Léon: The Professional",
    year: "1994",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.4,
  },
  {
    id: 6,
    titleCn: "千与千寻",
    titleEn: "Spirited Away",
    year: "2001",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.4,
  },
  {
    id: 7,
    titleCn: "辛德勒的名单",
    titleEn: "Schindler's List",
    year: "1993",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.6,
  },
  {
    id: 8,
    titleCn: "盗梦空间",
    titleEn: "Inception",
    year: "2010",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.3,
  },
]

const recentSearches = ["肖申克的救赎", "黑暗骑士", "教父", "盗梦空间"]

const recommendedKeywords = [
  { keyword: "黑暗骑士", keywordEn: "The Dark Knight" },
  { keyword: "教父", keywordEn: "The Godfather" },
  { keyword: "低俗小说", keywordEn: "Pulp Fiction" },
  { keyword: "星际穿越", keywordEn: "Interstellar" },
  { keyword: "楚门的世界", keywordEn: "The Truman Show" },
  { keyword: "美丽人生", keywordEn: "Life is Beautiful" },
]

export default function MovieSelectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMovies, setFilteredMovies] = useState(popularMovies)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredMovies(popularMovies)
    } else {
      setFilteredMovies(
        popularMovies.filter(
          (movie) =>
            movie.titleCn.toLowerCase().includes(query.toLowerCase()) ||
            movie.titleEn.toLowerCase().includes(query.toLowerCase()),
        ),
      )
    }
  }

  const handleSearchFocus = () => {
    setShowSearchSuggestions(true)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    handleSearch(keyword)
    setShowSearchSuggestions(false)
  }

  const getTextClasses = () => {
    if (theme === "light") {
      return "text-gray-800"
    }
    return "text-white"
  }

  const getCardClasses = () => {
    if (theme === "light") {
      return "bg-white/80 border-gray-200/50 hover:bg-white/90"
    }
    return "bg-white/10 border-white/20 hover:bg-white/20"
  }

  const getInputClasses = () => {
    if (theme === "light") {
      return "bg-white/80 border-gray-200/50 text-gray-800 placeholder:text-gray-500"
    }
    return "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
  }

  const getSuggestionClasses = () => {
    if (theme === "light") {
      return "bg-white/95 border-gray-200/50 shadow-lg"
    }
    return "bg-gray-900/95 border-white/20 shadow-lg"
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold ${getTextClasses()} mb-4`}>{t("movieSelection.title")}</h2>
          {/* <p className={`text-lg ${theme === "light" ? "text-gray-600" : "text-gray-300"} mb-6`}>
            {t("movieSelection.subtitle")}
          </p> */}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
            />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t("movieSelection.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleSearchFocus}
              className={`pl-10 ${getInputClasses()}`}
            />
          </div>

          {/* Search Suggestions */}
          {showSearchSuggestions && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${getSuggestionClasses()} rounded-lg border z-50`}>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-4 border-b border-gray-200/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${getTextClasses()}`}>
                      {t("movieSelection.recentSearches")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleKeywordClick(search)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          theme === "light"
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            : "bg-white/10 hover:bg-white/20 text-gray-300"
                        }`}
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Keywords */}
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm font-medium ${getTextClasses()}`}>
                    {t("movieSelection.recommendedKeywords")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {recommendedKeywords.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeywordClick(language === "zh" ? item.keyword : item.keywordEn)}
                      className={`p-2 text-sm rounded-lg text-left transition-colors ${
                        theme === "light"
                          ? "hover:bg-purple-50 text-gray-700 hover:text-purple-700"
                          : "hover:bg-purple-900/20 text-gray-300 hover:text-purple-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <span>{language === "zh" ? item.keyword : item.keywordEn}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Link key={movie.id} href={`/movie/${movie.id}`}>
              <Card className={`${getCardClasses()} transition-all duration-300 cursor-pointer group overflow-hidden`}>
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={movie.poster || "/placeholder.svg"}
                      alt={language === "zh" ? movie.titleCn : movie.titleEn}
                      width={200}
                      height={300}
                      className="w-full h-64 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-orange-500 text-white font-bold">{movie.rating}</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold ${getTextClasses()} text-sm mb-1 line-clamp-1`}>
                      {language === "zh" ? movie.titleCn : movie.titleEn}
                    </h3>
                    <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} text-xs mb-2 line-clamp-1`}>
                      {language === "zh" ? movie.titleEn : movie.titleCn}
                    </p>
                    <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} text-xs`}>{movie.year}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} text-lg mb-4`}>
              {t("movieSelection.noResults")}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {recommendedKeywords.slice(0, 3).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleKeywordClick(language === "zh" ? item.keyword : item.keywordEn)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    theme === "light"
                      ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                      : "bg-purple-900/20 hover:bg-purple-900/40 text-purple-300"
                  }`}
                >
                  {language === "zh" ? item.keyword : item.keywordEn}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
