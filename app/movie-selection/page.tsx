"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Clock, TrendingUp, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { apiConfig } from "@/lib/api-config"

interface Movie {
  id: string
  title: string
  title_en: string
  title_zh?: string
  year?: number
  genre: string[]
  rating?: number
  poster_url?: string
  backdrop_url?: string
}

// Mock data for fallback
const fallbackMovies = [
  {
    id: "tt0111161",
    title: "肖申克的救赎",
    title_en: "The Shawshank Redemption",
    title_zh: "肖申克的救赎",
    year: 1994,
    genre: ["剧情", "犯罪"],
    rating: 9.3,
    poster_url: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "tt0068646",
    title: "教父",
    title_en: "The Godfather",
    title_zh: "教父",
    year: 1972,
    genre: ["剧情", "犯罪"],
    rating: 9.2,
    poster_url: "/placeholder.svg?height=300&width=200",
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
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()

  // Fetch popular movies on component mount
  useEffect(() => {
    fetchPopularMovies()
  }, [])

  // Handle click outside for search suggestions
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

  const fetchPopularMovies = async () => {
    setLoading(true)
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.movies.list()}?page=1&per_page=20&language=${language}`
      )

      if (response.ok) {
        const data = await response.json()
        setMovies(data.movies || [])
        setFilteredMovies(data.movies || [])
      } else {
        // Fallback to mock data
        setMovies(fallbackMovies)
        setFilteredMovies(fallbackMovies)
      }
    } catch (error) {
      console.error("Error fetching movies:", error)
      // Fallback to mock data
      setMovies(fallbackMovies)
      setFilteredMovies(fallbackMovies)
    } finally {
      setLoading(false)
    }
  }

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setFilteredMovies(movies)
      return
    }

    setSearchLoading(true)
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.movies.search()}?q=${encodeURIComponent(query)}&page=1&per_page=20`
      )

      if (response.ok) {
        const data = await response.json()
        setFilteredMovies(data.movies || [])
      } else {
        // Fallback to local filtering
        setFilteredMovies(
          movies.filter(
            (movie) =>
              movie.title.toLowerCase().includes(query.toLowerCase()) ||
              movie.title_en.toLowerCase().includes(query.toLowerCase()) ||
              (movie.title_zh && movie.title_zh.toLowerCase().includes(query.toLowerCase()))
          )
        )
      }
    } catch (error) {
      console.error("Error searching movies:", error)
      // Fallback to local filtering
      setFilteredMovies(
        movies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.title_en.toLowerCase().includes(query.toLowerCase()) ||
            (movie.title_zh && movie.title_zh.toLowerCase().includes(query.toLowerCase()))
        )
      )
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    searchMovies(query)
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
              className={`pl-10 pr-10 ${getInputClasses()}`}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setFilteredMovies(movies)
                  setShowSearchSuggestions(false)
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200/50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} text-lg`}>
              加载中...
            </p>
          </div>
        )}

        {/* Search Loading State */}
        {searchLoading && (
          <div className="text-center py-4">
            <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} text-sm`}>
              搜索中...
            </p>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <Link key={movie.id} href={`/movie/${movie.id}`}>
                <Card className={`${getCardClasses()} transition-all duration-300 cursor-pointer group overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/static/${movie.id}/image?file=poster`}
                        alt={language === "zh" ? (movie.title_zh || movie.title) : movie.title_en}
                        width={200}
                        height={300}
                        className="w-full h-64 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      {movie.rating && (
                        <Badge className="absolute top-3 right-3 bg-orange-500 text-white font-bold">
                          {movie.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className={`font-semibold ${getTextClasses()} text-sm mb-1 line-clamp-1`}>
                        {language === "zh" ? (movie.title_zh || movie.title) : movie.title_en}
                      </h3>
                      <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"} text-xs mb-2 line-clamp-1`}>
                        {language === "zh" ? movie.title_en : (movie.title_zh || movie.title)}
                      </p>
                      {movie.year && (
                        <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} text-xs`}>
                          {movie.year}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && !searchLoading && filteredMovies.length === 0 && (
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
