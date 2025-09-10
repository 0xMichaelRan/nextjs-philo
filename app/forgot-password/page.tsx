"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Phone, MessageSquare, Eye, EyeOff, CheckCircle } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { usePageTitle } from "@/hooks/use-page-title"
import { AppLayout } from "@/components/app-layout"
import { apiConfig } from "@/lib/api-config"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { language, t } = useLanguage()
  
  const [step, setStep] = useState<'phone' | 'verify' | 'success'>('phone')
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationTimer, setVerificationTimer] = useState(0)

  usePageTitle(t("auth.forgotPassword"))

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
        input: "bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-500",
      }
    }
    /* dark-theme refactor */
    return {
      background: "theme-gradient-hero",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "theme-surface-elevated border-white/20",
      input: "theme-surface-elevated border-white/20 text-white placeholder:text-gray-400",
    }
  }

  const themeClasses = getThemeClasses()

  const validatePhoneNumber = (phone: string) => {
    return /^1[0-9]{10}$/.test(phone.replace(/[\s-]/g, ''))
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)}`
  }

  const formatVerificationCode = (code: string) => {
    // Remove any non-digit characters and limit to 4 digits
    const digits = code.replace(/\D/g, '').slice(0, 4)
    // Format as XX XX
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)} ${digits.slice(2)}`
  }

  const validateVerificationCode = (code: string) => {
    return code.replace(/\D/g, '').length === 4
  }

  const handleSendVerificationCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError(t("auth.pleaseEnterValidPhoneNumber"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(apiConfig.auth.resetPasswordRequest(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber.replace(/[\s-]/g, ''),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsVerificationSent(true)
        setVerificationTimer(60)
        
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
      } else {
        setError(data.detail || t("auth.resetEmailFailed"))
      }
    } catch (error) {
      setError(t("auth.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!verificationCode.trim()) {
      setError(t("auth.pleaseEnterValidVerificationCode"))
      return
    }

    if (newPassword.length < 6) {
      setError(t("auth.passwordMinLength"))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(language === "zh" ? "两次输入的密码不一致" : "Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(apiConfig.auth.resetPasswordConfirm(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber.replace(/[\s-]/g, ''),
          verification_code: verificationCode,
          new_password: newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
      } else {
        setError(data.detail || t("auth.resetEmailFailed"))
      }
    } catch (error) {
      setError(t("auth.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  const renderPhoneStep = () => (
    <Card className={themeClasses.card}>
      <CardHeader>
        <CardTitle className={`${themeClasses.text} text-xl text-center`}>
          {t("auth.forgotPassword")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <p className={themeClasses.secondaryText}>
            {language === "zh" 
              ? "请输入您的手机号码，我们将发送验证码到您的手机"
              : "Enter your phone number and we'll send a verification code"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={themeClasses.text}>
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
              }
            }}
            className={themeClasses.input}
            disabled={isLoading || isVerificationSent}
            maxLength={13}
          />
        </div>

        {/* Verification Code Input */}
        {isVerificationSent && (
          <div className="space-y-2">
            <Label htmlFor="verification-code" className={themeClasses.text}>
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
                  }
                }}
                className={`${themeClasses.input} text-center text-lg tracking-widest`}
                disabled={isLoading}
                maxLength={5} // Formatted length: XX XX
              />
              {validateVerificationCode(verificationCode) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500">
                  ✓
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Inputs - Show only after verification code is sent */}
        {isVerificationSent && (
          <>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className={themeClasses.text}>
                {language === "zh" ? "新密码" : "New Password"}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder={language === "zh" ? "输入新密码（至少6个字符）" : "Enter new password (min 6 characters)"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setError("")
                  }}
                  className={themeClasses.input}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={themeClasses.text}>
                {language === "zh" ? "确认新密码" : "Confirm New Password"}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={language === "zh" ? "再次输入新密码" : "Enter new password again"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError("")
                  }}
                  className={themeClasses.input}
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
          </>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {!isVerificationSent ? (
          <Button
            onClick={handleSendVerificationCode}
            disabled={!phoneNumber || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {isLoading ? t("auth.sendingCode") : t("auth.sendCode")}
          </Button>
        ) : (
          <Button
            onClick={handleResetPassword}
            disabled={!verificationCode || !newPassword || !confirmPassword || isLoading || !validateVerificationCode(verificationCode)}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {isLoading ? (language === "zh" ? "重置中..." : "Resetting...") : t("auth.resetPassword")}
          </Button>
        )}

        {isVerificationSent ? (
          <div className="flex justify-between text-sm">
            <Button
              onClick={() => {
                setIsVerificationSent(false)
                setVerificationCode("")
                setNewPassword("")
                setConfirmPassword("")
                setError("")
              }}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
            >
              {t("common.back")}
            </Button>

            {verificationTimer > 0 ? (
              <span className={themeClasses.secondaryText}>
                {language === "zh" ? `${verificationTimer}秒后可重发` : `Resend in ${verificationTimer}s`}
              </span>
            ) : (
              <Button
                onClick={handleSendVerificationCode}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                disabled={isLoading}
              >
                {t("auth.resendCode")}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={() => router.push('/auth')}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
            >
              {t("common.back")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )



  const renderSuccessStep = () => (
    <Card className={themeClasses.card}>
      <CardContent className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
          {language === "zh" ? "密码重置成功" : "Password Reset Successful"}
        </h2>
        <p className={`${themeClasses.secondaryText} mb-6`}>
          {language === "zh" 
            ? "您的密码已成功重置，现在可以使用新密码登录了"
            : "Your password has been successfully reset. You can now login with your new password"}
        </p>
        <Button
          onClick={() => router.push('/auth')}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {language === "zh" ? "返回登录" : "Back to Login"}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <AppLayout>
      <div className={`min-h-screen ${themeClasses.background}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className={`${themeClasses.text} hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
            </div>

            {/* Render current step */}
            {step === 'success' ? renderSuccessStep() : renderPhoneStep()}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
