"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { usePageTitle } from "@/hooks/use-page-title"
import { AppLayout } from "@/components/app-layout"
import { apiConfig } from "@/lib/api-config"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [refreshToken, setRefreshToken] = useState("")

  // Set page title
  usePageTitle('resetPassword')

  useEffect(() => {
    // Extract tokens from URL hash (Supabase format)
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))
    
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const type = params.get('type')
    
    if (type === 'recovery' && access_token && refresh_token) {
      setAccessToken(access_token)
      setRefreshToken(refresh_token)
    } else {
      setError(t("resetPassword.invalidLink"))
    }
  }, [t])

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleResetPassword = async () => {
    if (!validatePassword(password)) {
      setError(t("auth.passwordMinLength"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.passwordMismatch"))
      return
    }

    if (!accessToken) {
      setError(t("resetPassword.invalidLink"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(apiConfig.auth.resetPassword(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          password: password,
          access_token: accessToken,
          refresh_token: refreshToken
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth?message=password_reset_success')
        }, 3000)
      } else {
        setError(data.detail || t("resetPassword.resetFailed"))
      }
    } catch (error) {
      setError(t("auth.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  const getBackgroundClass = () => {
    if (theme === "light") {
      return "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
    }
    return "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
  }

  const getCardBackgroundClass = () => {
    if (theme === "light") {
      return "bg-white/80 backdrop-blur-sm border-white/20"
    }
    return "bg-black/40 backdrop-blur-sm border-white/10"
  }

  const getTextColorClass = () => {
    return theme === "light" ? "text-gray-900" : "text-white"
  }

  const getSecondaryTextColorClass = () => {
    return theme === "light" ? "text-gray-600" : "text-gray-300"
  }

  const getInputClass = () => {
    if (theme === "light") {
      return "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
    }
    return "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
  }

  if (success) {
    return (
      <AppLayout>
        <div className={`min-h-screen ${getBackgroundClass()}`}>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
              <Card className={getCardBackgroundClass()}>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className={`text-2xl font-bold ${getTextColorClass()} mb-4`}>
                    {t("resetPassword.successTitle")}
                  </h2>
                  <p className={`${getSecondaryTextColorClass()} mb-6`}>
                    {t("resetPassword.successMessage")}
                  </p>
                  <Button
                    onClick={() => router.push('/auth')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {t("resetPassword.goToLogin")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className={`min-h-screen ${getBackgroundClass()}`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className={getCardBackgroundClass()}>
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <Lock className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h2 className={`text-2xl font-bold ${getTextColorClass()} mb-2`}>
                    {t("resetPassword.title")}
                  </h2>
                  <p className={getSecondaryTextColorClass()}>
                    {t("resetPassword.subtitle")}
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* New Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className={getTextColorClass()}>
                      {t("resetPassword.newPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("resetPassword.enterNewPassword")}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError("")
                        }}
                        className={getInputClass()}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className={getTextColorClass()}>
                      {t("resetPassword.confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("resetPassword.confirmNewPassword")}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          setError("")
                        }}
                        className={getInputClass()}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}

                  {/* Reset Button */}
                  <Button
                    onClick={handleResetPassword}
                    disabled={!password || !confirmPassword || isLoading || !accessToken}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isLoading ? t("resetPassword.resetting") : t("resetPassword.resetPassword")}
                  </Button>

                  {/* Back to Login */}
                  <div className="text-center">
                    <Button
                      onClick={() => router.push('/auth')}
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                    >
                      {t("resetPassword.backToLogin")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
