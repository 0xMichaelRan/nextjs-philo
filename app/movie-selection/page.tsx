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
import { useFlow } from "@/hooks/use-flow"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { getQiniuPosterUrl } from "@/lib/qiniu-config"

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

// Removed fallbackMovies - show empty list if API fails

// Recent searches will be loaded from localStorage

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
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Movie selection doesn't require authentication
  useAuthGuard({ requireAuth: false })
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { flowState } = useFlow()

  // Note: Flow state is only cleared when a different movie is selected in movie detail page
  // This allows users to navigate back and forth without losing their progress

  // Load recent searches from localStorage and fetch popular movies on component mount
  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('movieRecentSearches')
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches))
      } catch (error) {
        console.error('Error parsing recent searches:', error)
      }
    }

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
        // Show empty list if API fails
        setMovies([])
        setFilteredMovies([])
      }
    } catch (error) {
      console.error("Error fetching movies:", error)
      // Show empty list if API fails
      setMovies([])
      setFilteredMovies([])
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
    // Save to recent searches when user actually searches (not just typing)
    if (query.trim() && query.length > 1) {
      saveToRecentSearches(query.trim())
    }
  }

  const handleSearchFocus = () => {
    setShowSearchSuggestions(true)
  }

  const saveToRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return

    const updatedSearches = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updatedSearches)
    localStorage.setItem('movieRecentSearches', JSON.stringify(updatedSearches))
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    handleSearch(keyword)
    saveToRecentSearches(keyword)
    setShowSearchSuggestions(false)
  }

  const themeClasses = {
    text: "theme-text-primary",
    secondaryText: "theme-text-secondary",
    mutedText: "theme-text-muted",
    brand: "theme-brand-primary",
    status: "theme-status-warning"
  }

  /* dark-theme refactor */
  const getTextClasses = () => {
    return "theme-text-primary"
  }

  /* dark-theme refactor */
  const getCardClasses = () => {
    if (theme === "light") {
      return "bg-white/80 border-gray-200/50 hover:bg-white/90"
    }
    return "theme-surface-elevated border-white/20 hover:bg-white/20"
  }

  /* dark-theme refactor */
  const getInputClasses = () => {
    if (theme === "light") {
      return "bg-white/80 border-gray-200/50 text-gray-800 placeholder:text-gray-500"
    }
    return "theme-surface-elevated border-white/20 text-white placeholder:text-gray-400"
  }

  /* dark-theme refactor */
  const getSuggestionClasses = () => {
    if (theme === "light") {
      return "bg-white/95 border-gray-200/50 shadow-lg"
    }
    return "theme-surface-primary border-white/20 shadow-lg"
  }

  return (
    <AppLayout title={t("movieSelection.title")}>
      <div className="container px-3 px-md-4 px-lg-3">
        <div className="flex flex-wrap -mx-4">
          <div className="hidden xl:block xl:w-1/12 px-4" />
          <div className="w-full xl:w-10/12 lg:w-full px-4">
            <div className="px-3 md:px-0 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold ${themeClasses.text} mb-4`}>{t("movieSelection.title")}</h2>
          {/* <p className={`text-lg ${theme === "light" ? "text-gray-600" : "text-gray-300"} mb-6`}>
            {t("movieSelection.subtitle")}
          </p> */}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.mutedText}`}
            />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t("movieSelection.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleSearchFocus}
              className={`pl-10 pr-10 ${theme === "light" ? "theme-bg-elevated border-gray-200/50 theme-text-primary placeholder:text-gray-500" : "theme-surface-elevated border-white/20 theme-text-primary placeholder:text-gray-400"}`}
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
                      {/* dark-theme refactor */}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full"></div>
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
                        src={getQiniuPosterUrl(movie.id)}
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
                        <Badge className={`absolute top-3 right-3 font-bold text-white ${themeClasses.status}`} style={{backgroundColor: 'var(--status-warning)'}}>
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
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
