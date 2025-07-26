"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Phone, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [redirectPath, setRedirectPath] = useState("/video-generation")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { login, sendVerificationCode, user } = useAuth()

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push(redirectPath)
      return
    }

    const redirect = searchParams.get("redirect")
    if (redirect) {
      setRedirectPath(`/${redirect}`)
    }
  }, [searchParams, user, router, redirectPath])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const validatePhone = (phone: string) => {
    // Simple validation for Chinese mobile numbers
    return /^1[3-9]\d{9}$/.test(phone)
  }

  const handleSendCode = async () => {
    if (!validatePhone(phoneNumber)) {
      setError(t("auth.invalidPhone"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await sendVerificationCode(phoneNumber)
      if (success) {
        setIsCodeSent(true)
        setCountdown(60)
        setError("")
      } else {
        setError(t("auth.loginFailed"))
      }
    } catch (error) {
      setError(t("auth.loginFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (verificationCode.length !== 6) {
      setError(t("auth.invalidCode"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await login(phoneNumber, verificationCode)
      if (success) {
        router.push(redirectPath)
      } else {
        setError(t("auth.loginFailed"))
      }
    } catch (error) {
      setError(t("auth.loginFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  const getBackgroundClass = () => {
    if (theme === "dark") {
      return "bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900"
    } else {
      return "bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100"
    }
  }

  const getTextColorClass = () => {
    return theme === "dark" ? "text-white" : "text-gray-800"
  }

  const getSecondaryTextColorClass = () => {
    return theme === "dark" ? "text-gray-300" : "text-gray-500"
  }

  const getCardBackgroundClass = () => {
    return theme === "dark" ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-200"
  }

  const getInputClass = () => {
    return theme === "dark" ? "bg-white/5 border-white/20 text-white" : "bg-gray-50 border-gray-300 text-gray-800"
  }

  return (
    <AppLayout>
      <div className={`${getBackgroundClass()} min-h-screen`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className={`${getTextColorClass()} hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-bold ${getTextColorClass()} mb-2`}>{t("auth.welcome")}</h2>
              <p className={getSecondaryTextColorClass()}>{t("auth.subtitle")}</p>
            </div>

            <Card className={getCardBackgroundClass()}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Phone Number Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={getTextColorClass()}>
                      {t("auth.phoneNumber")}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("auth.phonePlaceholder")}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        setError("")
                      }}
                      className={getInputClass()}
                      maxLength={11}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Send Code Button */}
                  <Button
                    onClick={handleSendCode}
                    disabled={!validatePhone(phoneNumber) || countdown > 0 || isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {isLoading && !isCodeSent
                      ? t("auth.sendingCode")
                      : countdown > 0
                        ? `${t("auth.resendCode")} (${countdown}s)`
                        : t("auth.sendCode")}
                  </Button>

                  {/* Verification Code Input */}
                  {isCodeSent && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="code" className={getTextColorClass()}>
                          {t("auth.verificationCode")}
                        </Label>
                        <Input
                          id="code"
                          type="text"
                          placeholder={t("auth.codePlaceholder")}
                          value={verificationCode}
                          onChange={(e) => {
                            setVerificationCode(e.target.value)
                            setError("")
                          }}
                          className={getInputClass()}
                          maxLength={6}
                          disabled={isLoading}
                        />
                      </div>

                      {/* Login Button */}
                      <Button
                        onClick={handleLogin}
                        disabled={verificationCode.length !== 6 || isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="lg"
                      >
                        {isLoading ? t("auth.loggingIn") : t("auth.login")}
                      </Button>
                    </>
                  )}

                  {/* Error Message */}
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                  {/* Success Message */}
                  {isCodeSent && !error && (
                    <div className="text-green-500 text-sm text-center">{t("auth.codeSent")}</div>
                  )}
                </div>

                {/* Skip Login Option */}
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => router.push(redirectPath)}
                    variant="ghost"
                    className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                  >
                    {t("auth.skipLogin")}
                  </Button>
                </div>

                {/* Terms */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    {t("auth.termsAgreement")}
                    <Link href="/terms" className="text-purple-400 hover:underline">
                      {t("auth.termsOfService")}
                    </Link>
                    {t("auth.and")}
                    <Link href="/privacy" className="text-purple-400 hover:underline">
                      {t("auth.privacyPolicy")}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
