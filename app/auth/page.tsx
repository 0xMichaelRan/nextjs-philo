"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Phone, ArrowLeft, Eye, EyeOff, MessageSquare, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiConfig } from "@/lib/api-config"
import { usePageTitle } from "@/hooks/use-page-title"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [redirectPath, setRedirectPath] = useState("/profile")
  const [activeTab, setActiveTab] = useState("login")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  const [verificationTimer, setVerificationTimer] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [nameError, setNameError] = useState("")

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { login, user } = useAuth()
  const { toast } = useToast()

  // Set page title
  usePageTitle('auth')

  // Set redirect path and active tab based on URL params or referrer
  useEffect(() => {
    const redirect = searchParams.get("redirect")
    const tab = searchParams.get("tab")

    // Set active tab based on URL parameter
    if (tab === "register" || tab === "login") {
      setActiveTab(tab)
    }

    if (redirect) {
      setRedirectPath(`/${redirect}`)
    } else {
      // Check localStorage for redirect path (set by 401 handlers)
      const storedRedirect = localStorage.getItem('redirectAfterAuth')
      if (storedRedirect) {
        setRedirectPath(storedRedirect)
        localStorage.removeItem('redirectAfterAuth') // Clean up
      } else {
        // Try to get the previous page from referrer
        const referrer = document.referrer
        if (referrer && referrer.includes(window.location.origin)) {
          const referrerPath = new URL(referrer).pathname
          // Don't redirect back to auth page
          if (referrerPath !== "/auth") {
            setRedirectPath(referrerPath)
          }
        }
      }
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectPath)
    }
  }, [user, router, redirectPath])

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

  const validatePhoneNumber = (phone: string) => {
    // Remove any spaces or dashes
    const cleanPhone = phone.replace(/[\s-]/g, '')
    // Check if it matches Chinese phone number pattern (11 digits starting with 1)
    return /^1[0-9]{10}$/.test(cleanPhone)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validateVerificationCode = (code: string) => {
    return /^[0-9]{4}$/.test(code)
  }

  const validateName = (name: string) => {
    return name.trim().length > 0 && name.trim().length <= 100
  }

  const checkPhoneNumberExists = async (phoneNumber: string) => {
    try {
      const response = await fetch(apiConfig.auth.checkPhone(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber.replace(/[\s-]/g, ''),
        }),
      })

      const data = await response.json()
      return data.exists || false
    } catch (error) {
      console.error('Error checking phone number:', error)
      return false
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '')
    // Format as XXX XXXX XXXX
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`
  }

  const formatVerificationCode = (code: string) => {
    // Remove any non-digit characters and limit to 4 digits
    const digits = code.replace(/\D/g, '').slice(0, 4)
    // Format as XX XX
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)} ${digits.slice(2)}`
  }

  const handleLogin = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError(t("auth.pleaseEnterValidPhoneNumber"))
      return
    }

    if (!validatePassword(password)) {
      setError(t("auth.passwordMinLength"))
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(apiConfig.auth.login(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber.replace(/[\s-]/g, ''),
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        setSuccess(t("auth.loginSuccess"))

        // Use auth context to update state
        if (login) {
          await login(phoneNumber, password)
        }

        // Redirect after successful login
        setTimeout(() => {
          router.push(redirectPath)
        }, 100)
      } else {
        setError(data.detail || t("auth.loginFailed"))
      }
    } catch (error) {
      setError(t("auth.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendVerificationCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError(t("auth.pleaseEnterValidPhoneNumber"))
      return
    }

    if (!validateName(name)) {
      setNameError(t("auth.nameRequired"))
      return
    }

    setIsLoading(true)
    setError("")
    setNameError("")

    try {
      // Check if phone number already exists
      const phoneExists = await checkPhoneNumberExists(phoneNumber)
      if (phoneExists) {
        setError(t("auth.phoneNumberAlreadyExists"))
        setIsLoading(false)
        return
      }

      // For now, simulate sending verification code
      // In production, this would call the backend API
      setIsVerificationSent(true)
      setVerificationTimer(60) // 60 seconds countdown
      setSuccess(t("auth.verificationCodeSent"))

      // Start countdown timer
      const timer = setInterval(() => {
        setVerificationTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (error) {
      setError(t("auth.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim()) {
      setError(t("auth.pleaseEnterName"))
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError(t("auth.pleaseEnterValidPhoneNumber"))
      return
    }

    if (!validatePassword(password)) {
      setError(t("auth.passwordMinLength"))
      return
    }

    // For now, skip verification code validation
    // In production, you would validate the verification code here
    // if (!validateVerificationCode(verificationCode)) {
    //   setError(t("auth.pleaseEnterValidVerificationCode"))
    //   return
    // }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(apiConfig.auth.register(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber.replace(/[\s-]/g, ''),
          password,
          name,
          verification_code: verificationCode.replace(/\s/g, ''),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t("auth.registerSuccess"),
          description: language === "zh" ? "欢迎加入！您现在可以开始使用所有功能。" : "Welcome! You can now start using all features.",
          variant: "success",
        })

        // Switch to login tab and clear form
        setActiveTab("login")
        setName("")
        setPassword("")
        setVerificationCode("")
        setIsVerificationSent(false)
        setVerificationTimer(0)
        setSuccess("")
        setError("")
      } else {
        setError(data.detail || t("auth.registrationFailed"))
      }
    } catch (error) {
      setError(t("auth.networkError"))
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
              <h2 className={`text-2xl font-bold ${getTextColorClass()} mb-2`}>{t("auth.welcomeTitle")}</h2>
              <p className={getSecondaryTextColorClass()}>{t("auth.welcomeSubtitle")}</p>
            </div>

            <Card className={getCardBackgroundClass()}>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                    <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    {/* Phone Number Input */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className={getTextColorClass()}>
                        {t("auth.phoneNumber")}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("auth.enterPhoneNumber")}
                        value={formatPhoneNumber(phoneNumber)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 11) {
                            setPhoneNumber(value)
                            setError("")
                            setSuccess("")
                          }
                        }}
                        className={getInputClass()}
                        disabled={isLoading}
                        maxLength={13} // Formatted length: XXX XXXX XXXX
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className={getTextColorClass()}>
                        {t("auth.password")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("auth.enterPassword")}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setError("")
                            setSuccess("")
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isLoading && phoneNumber && password) {
                              handleLogin()
                            }
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

                    {/* Login Button */}
                    <Button
                      onClick={handleLogin}
                      disabled={!phoneNumber || !password || isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {isLoading ? t("auth.loggingIn") : t("auth.login")}
                    </Button>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <Button
                        onClick={() => router.push('/forgot-password')}
                        variant="ghost"
                        className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                      >
                        {t("auth.forgotPassword")}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className={getTextColorClass()}>
                        {t("auth.fullName")}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder={t("auth.enterFullName")}
                        value={name}
                        onChange={(e) => {
                          const value = e.target.value
                          setName(value)
                          setError("")
                          setSuccess("")
                          setNameError("")

                          // Validate name length
                          if (value.length > 100) {
                            setNameError(t("auth.nameTooLong"))
                          }
                        }}
                        className={`${getInputClass()} ${nameError ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                        maxLength={100}
                      />
                      {nameError && (
                        <div className="text-red-500 text-xs mt-1">{nameError}</div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className={getTextColorClass()}>
                        {t("auth.phoneNumber")}
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="reg-phone"
                          type="tel"
                          placeholder={t("auth.enterPhoneNumber")}
                          value={formatPhoneNumber(phoneNumber)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            if (value.length <= 11) {
                              setPhoneNumber(value)
                              setError("")
                              setSuccess("")

                              // Clear registration state when phone number changes
                              if (isVerificationSent) {
                                setIsVerificationSent(false)
                                setVerificationTimer(0)
                                setVerificationCode("")
                              }
                            }
                          }}
                          className={getInputClass()}
                          disabled={isLoading}
                          maxLength={13}
                        />
                        <Button
                          type="button"
                          onClick={handleSendVerificationCode}
                          disabled={!validatePhoneNumber(phoneNumber) || !validateName(name) || nameError !== "" || isLoading || verificationTimer > 0}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {verificationTimer > 0 ? `${verificationTimer}s` : t("auth.sendCode")}
                        </Button>
                      </div>
                    </div>

                    {/* Verification Code Input */}
                    {isVerificationSent && (
                      <div className="space-y-2">
                        <Label htmlFor="verification-code" className={getTextColorClass()}>
                          {t("auth.verificationCode")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="verification-code"
                            type="text"
                            placeholder={t("auth.enterVerificationCode")}
                            value={formatVerificationCode(verificationCode)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '')
                              if (value.length <= 4) {
                                setVerificationCode(value)
                                setError("")
                                setSuccess("")
                              }
                            }}
                            className={`${getInputClass()} text-center text-lg tracking-widest`}
                            disabled={isLoading}
                            maxLength={5} // Formatted length: XX XX
                          />
                          {validateVerificationCode(verificationCode) && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className={getTextColorClass()}>
                        {t("auth.password")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("auth.createPassword")}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setError("")
                            setSuccess("")
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

                    {/* Register Button */}
                    <Button
                      onClick={handleRegister}
                      disabled={!name || !phoneNumber || !password || isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {isLoading ? t("auth.creatingAccount") : t("auth.createAccount")}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Error Message */}
                {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}

                {/* Success Message */}
                {success && <div className="text-green-500 text-sm text-center mt-4">{success}</div>}

                {/* Skip Login Option */}
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => router.push("/movie-selection")}
                    variant="ghost"
                    className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                  >
                    {t("auth.continueAsGuest")}
                  </Button>
                </div>

                {/* Terms */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    {t("auth.termsText")}{" "}
                    <Link href="/terms" className="text-purple-400 hover:underline">
                      {t("auth.termsOfService")}
                    </Link>
                    {" "}{t("auth.and")}{" "}
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
