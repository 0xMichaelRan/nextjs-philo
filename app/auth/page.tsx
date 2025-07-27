"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setError(t("auth.pleaseEnterValidEmail"))
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
      // Use the auth context's login method
      const success = await login(email, password)

      if (success) {
        setSuccess(t("auth.loginSuccess"))
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          router.push(redirectPath)
        }, 100)
      } else {
        setError(t("auth.loginFailed"))
      }
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

    if (!validateEmail(email)) {
      setError(t("auth.pleaseEnterValidEmail"))
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
      // Call your backend API
      const response = await fetch(apiConfig.auth.register(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Show toast notification
        toast({
          title: t("auth.registerSuccess"),
          description: "",
          variant: "success",
        })

        // Switch to login tab
        setActiveTab("login")

        // Clear form
        setName("")
        setPassword("")

        // Clear any existing messages
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

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setError(t("auth.pleaseEnterEmail"))
      return
    }

    if (!validateEmail(resetEmail)) {
      setError(t("auth.pleaseEnterValidEmail"))
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(apiConfig.auth.forgotPassword(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(t("auth.resetEmailSent"))
        setResetEmail("")
        setTimeout(() => {
          setShowForgotPassword(false)
          setSuccess("")
        }, 3000)
      } else {
        setError(data.detail || t("auth.resetEmailFailed"))
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
                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className={getTextColorClass()}>
                        {t("auth.email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("auth.enterEmail")}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError("")
                          setSuccess("")
                        }}
                        className={getInputClass()}
                        disabled={isLoading}
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
                      disabled={!email || !password || isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {isLoading ? t("auth.loggingIn") : t("auth.login")}
                    </Button>
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
                          setName(e.target.value)
                          setError("")
                          setSuccess("")
                        }}
                        className={getInputClass()}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className={getTextColorClass()}>
                        {t("auth.email")}
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder={t("auth.enterEmail")}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError("")
                          setSuccess("")
                        }}
                        className={getInputClass()}
                        disabled={isLoading}
                      />
                    </div>

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
                      disabled={!name || !email || !password || isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {isLoading ? t("auth.creatingAccount") : t("auth.createAccount")}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Error Message */}
                {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}

                {/* Success Message */}
                {success && <div className="text-green-500 text-sm text-center mt-4">{success}</div>}

                {/* Skip Login Option and Forgot Password */}
                <div className="mt-6 text-center space-y-2">
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => router.push(redirectPath)}
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                    >
                      {t("auth.continueAsGuest")}
                    </Button>
                    <Button
                      onClick={() => setShowForgotPassword(true)}
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                    >
                      {t("auth.forgotPassword")}
                    </Button>
                  </div>
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

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className={`${getCardBackgroundClass()} ${getTextColorClass()}`}>
            <DialogHeader>
              <DialogTitle className={getTextColorClass()}>{t("auth.resetPassword")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className={getTextColorClass()}>
                  {t("auth.enterEmailForReset")}
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder={t("auth.enterEmailForReset")}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={getInputClass()}
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-500 text-sm">{success}</div>}

              <div className="flex space-x-2">
                <Button
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? t("common.loading") : t("auth.sendResetEmail")}
                </Button>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail("")
                    setError("")
                    setSuccess("")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
