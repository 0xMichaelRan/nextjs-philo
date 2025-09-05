"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Download, Share2, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

import { AppLayout } from "@/components/app-layout"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useFlow } from "@/hooks/use-flow"
import { apiConfig } from "@/lib/api-config"
import { useAuthGuard } from "@/hooks/use-auth-guard"

interface AnalysisJob {
  id: number
  user_id?: string  // Now optional for unauthenticated users
  movie_id: string
  prompt_library_id: number
  system_instruction_input?: any
  user_prompt_input?: any
  status: string
  progress: number
  error_message?: string
  analysis_result?: string
  analysis_result_edit?: string  // Add edit field
  system_instruction_combined?: string
  user_prompt_combined?: string
  model_used?: string
  language: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export default function AnalysisJobPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const { user } = useAuth()
  const { theme } = useTheme()

  // Analysis job page requires authentication
  useAuthGuard({ requireAuth: true })
  const { flowState, updateFlowState } = useFlow()

  // Get jobId from URL params
  const jobId = params.job_id as string

  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50 backdrop-blur-md",
        cardHover: "hover:bg-white/90 hover:shadow-lg transition-all duration-300",
        accent: "text-purple-600",
        success: "text-green-600",
        error: "text-red-600",
        warning: "text-yellow-600"
      }
    }
    return {
      background: "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20 backdrop-blur-md",
      cardHover: "hover:bg-white/20 hover:shadow-xl transition-all duration-300",
      accent: "text-purple-400",
      success: "text-green-400",
      error: "text-red-400",
      warning: "text-yellow-400"
    }
  }

  const themeClasses = getThemeClasses()

  useEffect(() => {
    // Check if we have necessary job ID
    if (!jobId) {
      setError(language === "zh" ? "未提供任务ID" : "No job ID provided")
      setLoading(false)
      return
    }

    fetchAnalysisJob()
  }, [jobId, language])

  useEffect(() => {
    // Set up polling for jobs that are still processing
    if (analysisJob && (analysisJob.status === 'processing' || analysisJob.status === 'pending')) {
      const interval = setInterval(() => {
        fetchAnalysisJob()
      }, 3000)
      setPollingInterval(interval)

      return () => {
        clearInterval(interval)
      }
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }
  }, [analysisJob?.status])

  const fetchAnalysisJob = async () => {
    if (!jobId) return

    try {
      // Use regular fetch for unauthenticated access
      const response = await fetch(apiConfig.analysis.getJob(parseInt(jobId)))

      if (response.ok) {
        const job = await response.json()
        setAnalysisJob(job)
        setError(null)

        // Save analysis result to flow state when completed
        if (job.status === 'completed' && job.analysis_result) {
          updateFlowState({
            analysisResult: job.analysis_result,
            analysisJobId: job.id,
            movieId: job.movie_id
          })
        }
      } else if (response.status === 404) {
        setError(language === "zh" ? "未找到分析任务" : "Analysis job not found")
      } else {
        setError(language === "zh" ? "获取分析任务失败" : "Failed to fetch analysis job")
      }
    } catch (error) {
      console.error('Error fetching analysis job:', error)
      setError(language === "zh" ? "网络错误" : "Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = () => {
    if (analysisJob?.analysis_result) {
      // Use edited version if available, otherwise use original
      const textToEdit = analysisJob.analysis_result_edit || analysisJob.analysis_result
      setEditedText(textToEdit)
      setIsEditing(true)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditedText("")
  }

  const handleEditSave = async () => {
    if (!analysisJob || !editedText.trim()) return

    try {
      setIsSaving(true)

      // Update the analysis job with the new text
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.updateJob(analysisJob.id),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis_result_edit: editedText.trim()  // Save to edit field, preserve original
          })
        }
      )

      if (response.ok) {
        // Update local state - save to edit field, preserve original
        setAnalysisJob(prev => prev ? { ...prev, analysis_result_edit: editedText.trim() } : null)

        // Update flow state
        updateFlowState({
          analysisResult: editedText.trim(),
          analysisJobId: analysisJob.id,
          movieId: analysisJob.movie_id
        })

        setIsEditing(false)
        setEditedText("")
      } else {
        throw new Error('Failed to update analysis result')
      }
    } catch (error) {
      console.error('Error saving analysis result:', error)
      // You might want to add a toast notification here
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        color: "bg-yellow-500", 
        text: language === "zh" ? "等待中" : "Pending" 
      },
      processing: { 
        color: "bg-blue-500", 
        text: language === "zh" ? "处理中" : "Processing" 
      },
      completed: { 
        color: "bg-green-500", 
        text: language === "zh" ? "已完成" : "Completed" 
      },
      failed: { 
        color: "bg-red-500", 
        text: language === "zh" ? "失败" : "Failed" 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <div className={`min-h-screen ${themeClasses.background}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className={themeClasses.text}>
                {language === "zh" ? "加载分析结果..." : "Loading analysis results..."}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className={`min-h-screen ${themeClasses.background}`}>
          <div className="container mx-auto px-6 py-8">
            <Card className={`${themeClasses.card} max-w-2xl mx-auto`}>
              <CardContent className="p-8 text-center">
                <div className={`${themeClasses.error} text-xl mb-4`}>
                  {error}
                </div>
                <Button
                  onClick={() => router.push('/movie-selection')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {language === "zh" ? "返回电影选择" : "Back to Movie Selection"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className={`min-h-screen ${themeClasses.background}`}>
        <div className="container mx-auto px-6 py-8 pb-24">

          {/* Analysis Result */}
          {analysisJob?.status === 'completed' && analysisJob.analysis_result && (
            <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={themeClasses.text}>
                    {language === "zh" ? "分析结果" : "Analysis Result"}
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditStart}
                      className={`${themeClasses.text} border-white/20 hover:bg-white/10`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {language === "zh" ? "编辑" : "Edit"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className={`${themeClasses.card} border border-white/20 min-h-[300px] text-sm`}
                      placeholder={language === "zh" ? "编辑分析结果..." : "Edit analysis result..."}
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleEditSave}
                        disabled={isSaving || !editedText.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving
                          ? (language === "zh" ? "保存中..." : "Saving...")
                          : (language === "zh" ? "保存" : "Save")
                        }
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleEditCancel}
                        disabled={isSaving}
                        className={`${themeClasses.text} border-white/20 hover:bg-white/10`}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {language === "zh" ? "取消" : "Cancel"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`${themeClasses.card} border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto`}>
                    <pre className={`${themeClasses.text} text-sm whitespace-pre-wrap`}>
                      {analysisJob.analysis_result_edit || analysisJob.analysis_result}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          onBack={() => {
            // Start over - go back to analysis config with same movie ID
            if (analysisJob?.movie_id) {
              router.push(`/analysis-config?movieId=${analysisJob.movie_id}`)
            } else {
              router.push("/analysis-config")
            }
          }}
          backLabel={language === "zh" ? "重新开始" : "Start Over"}
          onNext={analysisJob?.status === 'completed' ? () => {
            // Navigate to voice selection with job ID
            router.push(`/voice-selection/${jobId}`)
          } : undefined}
          nextLabel={language === "zh" ? "选择语音" : "Select Voice"}
        />
      </div>
    </AppLayout>
  )
}
