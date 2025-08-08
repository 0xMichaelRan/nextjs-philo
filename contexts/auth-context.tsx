"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { apiConfig } from "@/lib/api-config"

interface User {
  id: string
  phone_number: string
  name: string
  email?: string
  is_vip: boolean
  vip_expiry_date?: string
  vip_days_remaining?: number
  subscription_status?: string
  preferences?: any
  created_at: string
  avatar?: string
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phoneNumber: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  fetchUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
  }, [])

  const fetchUserProfile = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.auth.user()
      )

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        // Apply user preferences to UI if they exist
        if (userData.preferences) {
          // Apply language preference
          if (userData.preferences.language) {
            localStorage.setItem("preferred_language", userData.preferences.language)
          }

          // Apply theme preference
          if (userData.preferences.theme) {
            localStorage.setItem("preferred_theme", userData.preferences.theme)
          }
        }
      } else {
        // Only logout if it's an authentication error (401)
        if (response.status === 401) {
          logout()
        } else {
          console.error("Failed to fetch user profile:", response.status, response.statusText)
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }
  }, [logout])

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    const token = localStorage.getItem("access_token")

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
        // Optionally fetch fresh user data
        fetchUserProfile()
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("access_token")
      }
    }
    setIsLoading(false)
  }, [fetchUserProfile])




  const login = async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch(apiConfig.auth.login(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber.replace(/[\s-]/g, ''),
          password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token)

        // Fetch user profile after login and wait for it to complete
        try {
          await fetchUserProfile()
          return true
        } catch (profileError) {
          console.error("Failed to fetch user profile:", profileError)
          // Even if profile fetch fails, login was successful
          return true
        }
      } else {
        console.error("Login failed:", data.detail)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
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
        updateUser,
        fetchUserProfile,
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
