"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { apiConfig } from '@/lib/api-config'

interface JobUpdateData {
  job_id: string
  status: string
  progress: number
  updated_at: string
  error_message?: string
}

interface NotificationUpdateData {
  has_new: boolean
  unread_count: number
  updated_at: string
}

interface SSEEvent {
  type: string
  data: any
  timestamp: string
}

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const eventSourceRef = useRef<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = useRef(1000)

  // Event handlers
  const [jobUpdateHandlers, setJobUpdateHandlers] = useState<Set<(data: JobUpdateData) => void>>(new Set())
  const [notificationUpdateHandlers, setNotificationUpdateHandlers] = useState<Set<(data: NotificationUpdateData) => void>>(new Set())

  const connect = useCallback(async () => {
    if (!user) return

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const token = localStorage.getItem('access_token')
      if (!token) {
        console.warn('No auth token available for SSE connection')
        return
      }

      // Create EventSource with auth header (note: EventSource doesn't support custom headers directly)
      // We'll need to pass the token as a query parameter
      const url = `${apiConfig.getBaseUrl()}/realtime/events?token=${encodeURIComponent(token)}`
      
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('SSE connection opened')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
        reconnectDelay.current = 1000
      }

      eventSource.onmessage = (event) => {
        try {
          const eventData: SSEEvent = JSON.parse(event.data)
          handleEvent(eventData)
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setIsConnected(false)
        setConnectionError('Connection error')
        handleReconnect()
      }

    } catch (error) {
      console.error('Failed to connect to SSE:', error)
      setConnectionError('Failed to connect')
    }
  }, [user])

  const handleEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'connected':
        console.log('SSE connected for user:', event.data.user_id)
        break

      case 'job_update':
        jobUpdateHandlers.forEach(handler => {
          try {
            handler(event.data as JobUpdateData)
          } catch (error) {
            console.error('Error in job update handler:', error)
          }
        })
        break

      case 'notification_update':
        notificationUpdateHandlers.forEach(handler => {
          try {
            handler(event.data as NotificationUpdateData)
          } catch (error) {
            console.error('Error in notification update handler:', error)
          }
        })
        break

      case 'keepalive':
        // Connection is alive, no action needed
        break

      default:
        console.log('Unknown SSE event:', event)
    }
  }, [jobUpdateHandlers, notificationUpdateHandlers])

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`)
        connect()
      }, reconnectDelay.current)
      
      // Exponential backoff
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000)
    } else {
      console.error('Max reconnection attempts reached')
      setConnectionError('Connection failed after multiple attempts')
    }
  }, [connect])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Subscribe to job updates
  const onJobUpdate = useCallback((handler: (data: JobUpdateData) => void) => {
    setJobUpdateHandlers(prev => new Set([...prev, handler]))
    
    // Return unsubscribe function
    return () => {
      setJobUpdateHandlers(prev => {
        const newSet = new Set(prev)
        newSet.delete(handler)
        return newSet
      })
    }
  }, [])

  // Subscribe to notification updates
  const onNotificationUpdate = useCallback((handler: (data: NotificationUpdateData) => void) => {
    setNotificationUpdateHandlers(prev => new Set([...prev, handler]))
    
    // Return unsubscribe function
    return () => {
      setNotificationUpdateHandlers(prev => {
        const newSet = new Set(prev)
        newSet.delete(handler)
        return newSet
      })
    }
  }, [])

  // Connect when user logs in
  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [user, connect, disconnect])

  return {
    isConnected,
    connectionError,
    onJobUpdate,
    onNotificationUpdate,
    reconnect: connect
  }
}
