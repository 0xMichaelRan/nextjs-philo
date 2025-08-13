"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { useLanguage } from "@/contexts/language-context"
import { useFlow } from "@/hooks/use-flow"

export default function VoiceSelectionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language } = useLanguage()
  const { flowState } = useFlow()

  useEffect(() => {
    // Check if we have an analysis job ID to redirect to new URL structure
    const analysisJobId = flowState.analysisJobId || searchParams.get('analysisJobId')
    
    if (analysisJobId) {
      // Redirect to new URL structure with job ID
      router.replace(`/voice-selection/${analysisJobId}`)
    } else {
      // No analysis job ID, redirect to movie selection to start the flow
      router.replace('/movie-selection')
    }
  }, [flowState.analysisJobId, searchParams, router])

  // Show loading while redirecting
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white">
              {language === "zh" ? "重定向中..." : "Redirecting..."}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
