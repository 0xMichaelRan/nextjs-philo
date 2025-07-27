"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react"
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

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [redirectPath, setRedirectPath] = useState("/video-generation")
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { theme } = useTheme()
  const { language, t } = useLanguage()
  const { login, register, user } = useAuth()

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
      setError("Please enter a valid email address")
      return
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Call your backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store the token and user info
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        setSuccess("Login successful!")
        router.push(redirectPath)
      } else {
        setError(data.detail || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Call your backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/register`, {
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
        setSuccess("Registration successful! Please login with your credentials.")
        setActiveTab("login")
        // Clear form
        setName("")
        setPassword("")
      } else {
        setError(data.detail || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
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
              <h2 className={`text-2xl font-bold ${getTextColorClass()} mb-2`}>Welcome to Movie Philosopher</h2>
              <p className={getSecondaryTextColorClass()}>Sign in to your account or create a new one</p>
            </div>

            <Card className={getCardBackgroundClass()}>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className={getTextColorClass()}>
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
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
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
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
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className={getTextColorClass()}>
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
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
                        Email
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email"
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
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password (min 6 characters)"
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
                      {isLoading ? "Creating account..." : "Create Account"}
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
                    onClick={() => router.push(redirectPath)}
                    variant="ghost"
                    className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                  >
                    Continue as Guest
                  </Button>
                </div>

                {/* Terms */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" className="text-purple-400 hover:underline">
                      Terms of Service
                    </Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-purple-400 hover:underline">
                      Privacy Policy
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
