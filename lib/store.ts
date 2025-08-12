"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiConfig } from '@/lib/api-config'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface FlowState {
  // Movie selection
  movieId?: string
  movieTitle?: string
  movieTitleEn?: string
  movieTagline?: string

  // Analysis options (legacy)
  analysisStyle?: string
  analysisDepth?: string
  analysisCharacter?: string
  analysisTheme?: string

  // New analysis workflow
  analysisPromptId?: number
  analysisSystemInputs?: Record<string, any>
  analysisUserInputs?: Record<string, any>
  analysisJobId?: number
  analysisResult?: string

  // Voice selection
  voiceId?: string
  voiceName?: string
  voiceLanguage?: string
  customVoiceId?: string
  ttsProvider?: string

  // Script options
  scriptLength?: string
  scriptTone?: string

  // Job metadata
  jobId?: string
  requiresLogin?: boolean
  isCustomized?: boolean
  createdAt?: string

  // Auto-cleanup metadata
  lastUpdated?: number
  expiresAt?: number
}

export interface LoadingStates {
  savingToDatabase: boolean
  loadingFromDatabase: boolean
  submittingToAMQP: boolean
}

export interface ErrorStates {
  databaseError?: string
  amqpError?: string
  generalError?: string
}

export interface FlowStore {
  // State
  flowState: FlowState
  loading: LoadingStates
  errors: ErrorStates
  
  // Basic actions
  updateFlowState: (updates: Partial<FlowState>) => void
  clearFlowState: () => void
  clearErrors: () => void
  
  // Computed values
  isFlowCustomized: () => boolean
  canProceedWithoutLogin: () => boolean
  getFlowProgress: () => number
  getNextStep: () => string | null
  getPreviousStep: () => string | null
  
  // API actions
  saveFlowToDatabase: (user?: any) => Promise<string | null>
  loadFlowFromDatabase: (jobId: string, user?: any) => Promise<boolean>
  submitToAMQP: (user?: any) => Promise<boolean>
  
  // Cleanup actions
  checkAndCleanupExpired: () => void
  setAutoCleanup: (hours?: number) => void
}

// ============================================================================
// Constants
// ============================================================================

const FLOW_STEPS = [
  "movie-selection",
  "analysis-options", 
  "voice-selection",
  "script-review",
  "job-submission"
]

const DEFAULT_VALUES = {
  analysisStyle: "philosophical",
  analysisDepth: "deep",
  analysisCharacter: "philosopher",
  analysisTheme: "general",
  voiceLanguage: "zh",
  scriptLength: "medium",
  scriptTone: "analytical"
}

const STORAGE_KEY = "movieAnalysisFlow"
const DEFAULT_EXPIRY_HOURS = 24

// ============================================================================
// Helper Functions
// ============================================================================

const isFlowCustomizedState = (state: FlowState): boolean => {
  return (
    (state.analysisStyle && state.analysisStyle !== DEFAULT_VALUES.analysisStyle) ||
    (state.analysisDepth && state.analysisDepth !== DEFAULT_VALUES.analysisDepth) ||
    (state.analysisCharacter && state.analysisCharacter !== DEFAULT_VALUES.analysisCharacter) ||
    (state.analysisTheme && state.analysisTheme !== DEFAULT_VALUES.analysisTheme) ||
    (state.voiceLanguage && state.voiceLanguage !== DEFAULT_VALUES.voiceLanguage) ||
    (state.scriptLength && state.scriptLength !== DEFAULT_VALUES.scriptLength) ||
    (state.scriptTone && state.scriptTone !== DEFAULT_VALUES.scriptTone) ||
    !!state.customVoiceId
  )
}

const getCurrentStepIndex = (state: FlowState): number => {
  if (!state.movieId) return 0
  if (!state.analysisStyle) return 1
  if (!state.voiceId && !state.customVoiceId) return 2
  if (!state.scriptLength) return 3
  return 4
}

// ============================================================================
// Zustand Store
// ============================================================================

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      // Initial state
      flowState: {},
      loading: {
        savingToDatabase: false,
        loadingFromDatabase: false,
        submittingToAMQP: false,
      },
      errors: {},

      // Basic actions
      updateFlowState: (updates: Partial<FlowState>) => {
        set((state) => {
          const newFlowState = { ...state.flowState, ...updates }
          const isCustomized = isFlowCustomizedState(newFlowState)
          
          // Auto-set metadata
          newFlowState.isCustomized = isCustomized
          newFlowState.requiresLogin = isCustomized
          newFlowState.lastUpdated = Date.now()
          
          // Set expiry if not already set
          if (!newFlowState.expiresAt) {
            newFlowState.expiresAt = Date.now() + (DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000)
          }

          return {
            ...state,
            flowState: newFlowState,
            errors: {} // Clear errors on successful update
          }
        })
      },

      clearFlowState: () => {
        set((state) => ({
          ...state,
          flowState: {},
          errors: {}
        }))
      },

      clearErrors: () => {
        set((state) => ({
          ...state,
          errors: {}
        }))
      },

      // Computed values
      isFlowCustomized: () => {
        const { flowState } = get()
        return isFlowCustomizedState(flowState)
      },

      canProceedWithoutLogin: () => {
        const { flowState } = get()
        return !isFlowCustomizedState(flowState)
      },

      getFlowProgress: () => {
        const { flowState } = get()
        let completedSteps = 0
        
        if (flowState.movieId) completedSteps++
        if (flowState.analysisStyle) completedSteps++
        if (flowState.voiceId || flowState.customVoiceId) completedSteps++
        if (flowState.scriptLength) completedSteps++
        
        return (completedSteps / FLOW_STEPS.length) * 100
      },

      getNextStep: () => {
        const { flowState } = get()
        const currentIndex = getCurrentStepIndex(flowState)
        if (currentIndex < FLOW_STEPS.length - 1) {
          return FLOW_STEPS[currentIndex + 1]
        }
        return null
      },

      getPreviousStep: () => {
        const { flowState } = get()
        const currentIndex = getCurrentStepIndex(flowState)
        if (currentIndex > 0) {
          return FLOW_STEPS[currentIndex - 1]
        }
        return null
      },

      // API actions
      saveFlowToDatabase: async (user?: any) => {
        const { flowState } = get()
        if (!user || !flowState.movieId) return null

        set((state) => ({
          ...state,
          loading: { ...state.loading, savingToDatabase: true },
          errors: { ...state.errors, databaseError: undefined }
        }))

        try {
          const response = await apiConfig.makeAuthenticatedRequest(
            apiConfig.jobs.create(),
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                movie_id: flowState.movieId,
                movie_title: flowState.movieTitle,
                movie_title_en: flowState.movieTitleEn,
                analysis_options: {
                  style: flowState.analysisStyle || DEFAULT_VALUES.analysisStyle,
                  depth: flowState.analysisDepth || DEFAULT_VALUES.analysisDepth,
                  character: flowState.analysisCharacter || DEFAULT_VALUES.analysisCharacter,
                  theme: flowState.analysisTheme || DEFAULT_VALUES.analysisTheme
                },
                voice_options: {
                  voice_id: flowState.voiceId,
                  voice_name: flowState.voiceName,
                  language: flowState.voiceLanguage || DEFAULT_VALUES.voiceLanguage,
                  custom_voice_id: flowState.customVoiceId
                },
                script_options: {
                  length: flowState.scriptLength || DEFAULT_VALUES.scriptLength,
                  tone: flowState.scriptTone || DEFAULT_VALUES.scriptTone
                },
                status: "pending"
              })
            }
          )

          if (response.ok) {
            const data = await response.json()
            get().updateFlowState({ jobId: data.id })
            return data.id
          } else {
            throw new Error('Failed to save to database')
          }
        } catch (error) {
          set((state) => ({
            ...state,
            errors: { ...state.errors, databaseError: error instanceof Error ? error.message : 'Unknown error' }
          }))
          return null
        } finally {
          set((state) => ({
            ...state,
            loading: { ...state.loading, savingToDatabase: false }
          }))
        }
      },

      loadFlowFromDatabase: async (jobId: string, user?: any) => {
        if (!user) return false

        set((state) => ({
          ...state,
          loading: { ...state.loading, loadingFromDatabase: true },
          errors: { ...state.errors, databaseError: undefined }
        }))

        try {
          const response = await apiConfig.makeAuthenticatedRequest(
            apiConfig.jobs.details(jobId)
          )

          if (response.ok) {
            const job = await response.json()

            get().updateFlowState({
              jobId: job.id,
              movieId: job.movie_id,
              movieTitle: job.movie_title,
              movieTitleEn: job.movie_title_en,
              analysisStyle: job.analysis_options?.style,
              analysisDepth: job.analysis_options?.depth,
              analysisCharacter: job.analysis_options?.character,
              analysisTheme: job.analysis_options?.theme,
              voiceId: job.voice_options?.voice_id,
              voiceName: job.voice_options?.voice_name,
              voiceLanguage: job.voice_options?.language,
              customVoiceId: job.voice_options?.custom_voice_id,
              scriptLength: job.script_options?.length,
              scriptTone: job.script_options?.tone,
              isCustomized: true,
              requiresLogin: true,
              createdAt: job.created_at
            })

            return true
          } else {
            throw new Error('Failed to load from database')
          }
        } catch (error) {
          set((state) => ({
            ...state,
            errors: { ...state.errors, databaseError: error instanceof Error ? error.message : 'Unknown error' }
          }))
          return false
        } finally {
          set((state) => ({
            ...state,
            loading: { ...state.loading, loadingFromDatabase: false }
          }))
        }
      },

      submitToAMQP: async (user?: any) => {
        const { flowState } = get()
        if (!user || !flowState.jobId) return false

        set((state) => ({
          ...state,
          loading: { ...state.loading, submittingToAMQP: true },
          errors: { ...state.errors, amqpError: undefined }
        }))

        try {
          const response = await apiConfig.makeAuthenticatedRequest(
            apiConfig.jobs.submitToQueue(flowState.jobId),
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          )

          if (response.ok) {
            // Clear flow state after successful AMQP submission
            get().clearFlowState()
            return true
          } else {
            throw new Error('Failed to submit to AMQP queue')
          }
        } catch (error) {
          set((state) => ({
            ...state,
            errors: { ...state.errors, amqpError: error instanceof Error ? error.message : 'Unknown error' }
          }))
          return false
        } finally {
          set((state) => ({
            ...state,
            loading: { ...state.loading, submittingToAMQP: false }
          }))
        }
      },

      // Cleanup actions
      checkAndCleanupExpired: () => {
        const { flowState, clearFlowState } = get()
        if (flowState.expiresAt && Date.now() > flowState.expiresAt) {
          clearFlowState()
        }
      },

      setAutoCleanup: (hours: number = DEFAULT_EXPIRY_HOURS) => {
        set((state) => ({
          ...state,
          flowState: {
            ...state.flowState,
            expiresAt: Date.now() + (hours * 60 * 60 * 1000)
          }
        }))
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        flowState: state.flowState 
      }), // Only persist flowState, not loading/error states
      onRehydrateStorage: () => (state) => {
        // Check for expired data on rehydration
        if (state) {
          state.checkAndCleanupExpired()
        }
      },
    }
  )
)
