"use client"

import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { getQiniuPosterUrl } from "@/lib/qiniu-config"

interface MovieHeaderProps {
  movieId?: string
  movieTitle: string
  movieTitleEn?: string
  movieTagline?: string
  subtitle?: string
  className?: string
  imageSize?: "sm" | "md" | "lg"
}

export function MovieHeader({
  movieId,
  movieTitle,
  movieTitleEn,
  movieTagline,
  subtitle,
  className = "",
  imageSize = "md"
}: MovieHeaderProps) {
  const { theme } = useTheme()

  const getImageDimensions = () => {
    switch (imageSize) {
      case "sm":
        return { width: 60, height: 90, className: "w-12 h-18" }
      case "md":
        return { width: 80, height: 120, className: "w-16 h-24" }
      case "lg":
        return { width: 100, height: 150, className: "w-20 h-30" }
      default:
        return { width: 80, height: 120, className: "w-16 h-24" }
    }
  }

  const getTextClasses = () => {
    return theme === "light" ? "text-gray-800" : "text-white"
  }

  const getSecondaryTextClasses = () => {
    return theme === "light" ? "text-gray-600" : "text-gray-300"
  }

  const imageDimensions = getImageDimensions()

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <Image
        src={
          movieId
            ? getQiniuPosterUrl(movieId)
            : `/placeholder.svg?height=${imageDimensions.height}&width=${imageDimensions.width}&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+poster`
        }
        alt={movieTitle}
        width={imageDimensions.width}
        height={imageDimensions.height}
        className={`${imageDimensions.className} object-cover rounded-lg shadow-md`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `/placeholder.svg?height=${imageDimensions.height}&width=${imageDimensions.width}&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+poster`;
        }}
      />
      <div className="flex-1">
        <h2 className={`${getTextClasses()} text-xl font-bold mb-1`}>
          {movieTitle}
        </h2>
        {movieTitleEn && movieTitleEn !== movieTitle && (
          <h3 className={`${getSecondaryTextClasses()} text-lg mb-1`}>
            {movieTitleEn}
          </h3>
        )}
        {movieTagline && (
          <p className={`${getSecondaryTextClasses()} text-sm italic mb-2`}>
            "{movieTagline}"
          </p>
        )}
        {subtitle && (
          <p className={`${getSecondaryTextClasses()} text-sm`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
