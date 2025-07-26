"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  phone: string
  name: string
  isVip: boolean
  vipExpiry?: string
  avatar?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phone: string, code: string) => Promise<boolean>
  logout: () => void
  sendVerificationCode: (phone: string) => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const sendVerificationCode = async (phone: string): Promise<boolean> => {
    try {
      // Simulate API call to send SMS
      console.log("Sending verification code to:", phone)

      // Mock API response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In real implementation, this would call your SMS service
      return true
    } catch (error) {
      console.error("Error sending verification code:", error)
      return false
    }
  }

  const login = async (phone: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call for login
      console.log("Logging in with phone:", phone, "code:", code)

      // Mock API response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any 6-digit code
      if (code.length === 6) {
        const mockUser: User = {
          id: `user_${Date.now()}`,
          phone,
          name: `用户${phone.slice(-4)}`,
          isVip: false,
          createdAt: new Date().toISOString(),
        }

        setUser(mockUser)
        localStorage.setItem("user", JSON.stringify(mockUser))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        sendVerificationCode,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
