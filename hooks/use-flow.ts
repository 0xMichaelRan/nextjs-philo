"use client"

import { useFlowStore } from '@/lib/store'
import { useAuth } from '@/contexts/auth-context'

/**
 * Migration helper hook that provides the same API as the old useFlow hook
 * This allows for easier migration of existing components
 */
export const useFlow = () => {
  const { user } = useAuth()
  
  // Extract all store values and actions
  const flowState = useFlowStore((state) => state.flowState)
  const updateFlowState = useFlowStore((state) => state.updateFlowState)
  const clearFlowState = useFlowStore((state) => state.clearFlowState)
  const isFlowCustomized = useFlowStore((state) => state.isFlowCustomized)
  const canProceedWithoutLogin = useFlowStore((state) => state.canProceedWithoutLogin)
  const getFlowProgress = useFlowStore((state) => state.getFlowProgress)
  const getNextStep = useFlowStore((state) => state.getNextStep)
  const getPreviousStep = useFlowStore((state) => state.getPreviousStep)
  const saveFlowToDatabase = useFlowStore((state) => state.saveFlowToDatabase)
  const loadFlowFromDatabase = useFlowStore((state) => state.loadFlowFromDatabase)
  const submitToAMQP = useFlowStore((state) => state.submitToAMQP)
  
  // Loading and error states
  const loading = useFlowStore((state) => state.loading)
  const errors = useFlowStore((state) => state.errors)

  return {
    // Original API
    flowState,
    updateFlowState,
    clearFlowState,
    isFlowCustomized,
    canProceedWithoutLogin,
    getFlowProgress,
    getNextStep,
    getPreviousStep,
    saveFlowToDatabase: () => saveFlowToDatabase(user),
    loadFlowFromDatabase: (jobId: string) => loadFlowFromDatabase(jobId, user),
    
    // New API additions
    submitToAMQP: () => submitToAMQP(user),
    loading,
    errors,
  }
}
