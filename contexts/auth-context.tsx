"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { apiConfig } from "@/lib/api-config"

interface User {
  id: string
  phone_number: string
  name: string
  email?: string
  is_vip: boolean
  is_svip: boolean
  vip_expiry_date?: string
  vip_days_remaining?: number
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
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    // Clear refresh timer
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return false

      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.getBaseUrl()}/auth/refresh-token`,
        { method: 'POST' }
      )

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access_token)
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('Token refreshed successfully')
        // Restart auto-refresh timer
        startAutoRefresh()
        return true
      } else {
        console.warn('Token refresh failed:', response.status)
        if (response.status === 401) {
          logout()
        }
        return false
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }, [logout])

  const startAutoRefresh = useCallback(() => {
    // Clear existing timer
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Set up auto-refresh every 4 hours (token expires in 8 hours, refresh at 50%)
    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-refreshing token...')
      refreshToken()
    }, 4 * 60 * 60 * 1000) // 4 hours in milliseconds
  }, [refreshToken])

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
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
        // Try to refresh token on 401 error
        if (response.status === 401) {
          console.warn("Authentication failed, attempting token refresh")
          const refreshSuccess = await refreshToken()
          if (!refreshSuccess) {
            console.warn("Token refresh failed, logging out user")
            logout()
          }
        } else {
          console.error("Failed to fetch user profile:", response.status, response.statusText)
          // Don't logout for other errors, just log them
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Don't logout on network errors, just log them
      // throw error
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
        // Start auto-refresh for existing session
        startAutoRefresh()
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("access_token")
      }
    }
    setIsLoading(false)

    // Cleanup function to stop auto-refresh on unmount
    return () => {
      stopAutoRefresh()
    }
  }, [fetchUserProfile, startAutoRefresh, stopAutoRefresh])




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
          // Start auto-refresh timer after successful login
          startAutoRefresh()
          return true
        } catch (profileError) {
          console.error("Failed to fetch user profile:", profileError)
          // Even if profile fetch fails, login was successful
          // Start auto-refresh timer
          startAutoRefresh()
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
        refreshToken,
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
