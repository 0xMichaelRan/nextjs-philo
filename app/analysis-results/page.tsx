"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { AppLayout } from "@/components/app-layout"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useFlow } from "@/hooks/use-flow"
import { apiConfig } from "@/lib/api-config"

interface AnalysisJob {
  id: number
  user_id: number
  movie_id: string
  prompt_library_id: number
  system_instruction_input?: any
  user_prompt_input?: any
  status: string
  error_message?: string
  analysis_result?: string
  system_instruction_combined?: string
  user_prompt_combined?: string
  model_used?: string
  language: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export default function AnalysisResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { flowState, updateFlowState } = useFlow()

  // Get jobId from flow state first, fallback to URL for backward compatibility
  const jobId = flowState.analysisJobId?.toString() || searchParams.get('jobId')

  // Redirect to new URL structure
  useEffect(() => {
    if (jobId) {
      router.replace(`/analysis-job/${jobId}`)
    } else {
      router.replace('/movie-selection')
    }
  }, [jobId, router])
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50 backdrop-blur-md",
        cardHover: "hover:bg-white/90 hover:shadow-lg transition-all duration-300",
      }
    }
    return {
      background: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20 backdrop-blur-md",
      cardHover: "hover:bg-white/20 hover:shadow-xl transition-all duration-300",
    }
  }

  const themeClasses = getThemeClasses()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    // Check if we have necessary flow state or job ID
    if (!jobId) {
      setError(language === "zh" ? "未提供任务ID" : "No job ID provided")
      setLoading(false)
      return
    }

    // If we don't have movie data in flow state, redirect to movie selection
    if (!flowState.movieId) {
      router.push('/movie-selection')
      return
    }

    fetchAnalysisJob()
  }, [user, jobId, language, flowState.movieId])

  useEffect(() => {
    // Set up polling for jobs that are still processing
    if (analysisJob && (analysisJob.status === 'processing' || analysisJob.status === 'pending')) {
      const interval = setInterval(() => {
        fetchAnalysisJob()
      }, 3000)
      setPollingInterval(interval)

      return () => {
        clearInterval(interval)
        setPollingInterval(null)
      }
    } else {
      // Clear polling if job is completed or failed
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }
  }, [analysisJob?.status])

  const fetchAnalysisJob = async () => {
    if (!jobId) return

    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.getJob(parseInt(jobId))
      )

      if (response.ok) {
        const job = await response.json()
        setAnalysisJob(job)
        setError(null)

        // Save analysis result to flow state when completed
        if (job.status === 'completed' && job.analysis_result) {
          updateFlowState({
            analysisResult: job.analysis_result,
            analysisJobId: job.id
          })
        }
      } else if (response.status === 404) {
        setError(language === "zh" ? "未找到分析任务" : "Analysis job not found")
      } else if (response.status === 401) {
        router.push('/auth')
        return
      } else {
        setError(language === "zh" ? "获取分析任务失败" : "Failed to fetch analysis job")
      }
    } catch (err) {
      setError(language === "zh" ? "网络错误，请稍后重试" : "Network error, please try again later")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: language === "zh" ? "等待中" : "Pending", color: "bg-yellow-500" },
      processing: { label: language === "zh" ? "分析中" : "Processing", color: "bg-blue-500" },
      completed: { label: language === "zh" ? "已完成" : "Completed", color: "bg-green-500" },
      failed: { label: language === "zh" ? "失败" : "Failed", color: "bg-red-500" },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const handleShare = () => {
    if (analysisJob?.analysis_result) {
      navigator.clipboard.writeText(analysisJob.analysis_result)
      // Could add a toast notification here
    }
  }

  const handleDownload = () => {
    if (analysisJob?.analysis_result) {
      const blob = new Blob([analysisJob.analysis_result], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `movie-analysis-${analysisJob.id}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className={themeClasses.background}>
        <AppLayout>
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className={themeClasses.text}>
                  {language === "zh" ? "加载分析结果..." : "Loading analysis results..."}
                </p>
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  if (error || !analysisJob) {
    return (
      <div className={themeClasses.background}>
        <AppLayout>
          <div className="container mx-auto px-6 py-8">
            <Card className={`${themeClasses.card} max-w-md mx-auto text-center`}>
              <CardContent className="p-8">
                <h2 className={`${themeClasses.text} text-xl font-bold mb-4`}>
                  {language === "zh" ? "加载失败" : "Loading Failed"}
                </h2>
                <p className={`${themeClasses.secondaryText} mb-4`}>
                  {error || (language === "zh" ? "未找到分析任务" : "Analysis job not found")}
                </p>
                <Button onClick={() => router.push("/movie-selection")} className="bg-purple-600 hover:bg-purple-700">
                  {language === "zh" ? "返回首页" : "Back to Home"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </div>
    )
  }

  return (
    <div className={themeClasses.background}>
      <AppLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className={`${themeClasses.text} hover:bg-white/10 mb-4`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "zh" ? "返回" : "Back"}
            </Button>
            
            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
              {language === "zh" ? "电影分析结果" : "Movie Analysis Results"}
            </h1>
          </div>

          {/* Job Status */}
          <Card className={`${themeClasses.card} ${themeClasses.cardHover} mb-6`}>
            <CardHeader>
              <CardTitle className={`${themeClasses.text} flex items-center justify-between`}>
                <span>{language === "zh" ? "分析状态" : "Analysis Status"}</span>
                {getStatusBadge(analysisJob.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(analysisJob.status === 'processing' || analysisJob.status === 'pending') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className={`${themeClasses.secondaryText} text-sm`}>
                      {language === "zh" ? `进度: ${analysisJob.progress}%` : `Progress: ${analysisJob.progress}%`}
                    </p>
                    <p className={`${themeClasses.secondaryText} text-xs`}>
                      {language === "zh" ? "正在分析中，请稍候..." : "Analysis in progress, please wait..."}
                    </p>
                  </div>
                </div>
              )}

              {analysisJob.status === 'failed' && (
                <div className="space-y-2">
                  <p className="text-red-500 text-sm font-medium">
                    {language === "zh" ? "分析失败" : "Analysis Failed"}
                  </p>
                  {analysisJob.error_message && (
                    <p className="text-red-400 text-sm">{analysisJob.error_message}</p>
                  )}
                  <Button
                    onClick={() => router.push('/analysis-config')}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {language === "zh" ? "重新开始" : "Start Over"}
                  </Button>
                </div>
              )}

              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <p className={`${themeClasses.secondaryText} text-xs`}>
                    {language === "zh" ? "创建时间" : "Created"}
                  </p>
                  <p className={`${themeClasses.text} text-sm`}>
                    {new Date(analysisJob.created_at).toLocaleString()}
                  </p>
                </div>
                {analysisJob.model_used && (
                  <div>
                    <p className={`${themeClasses.secondaryText} text-xs`}>
                      {language === "zh" ? "使用模型" : "Model Used"}
                    </p>
                    <p className={`${themeClasses.text} text-sm`}>
                      {analysisJob.model_used}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Result */}
          {analysisJob.status === 'completed' && analysisJob.analysis_result && (
            <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
              <CardHeader>
                <CardTitle className={`${themeClasses.text} flex items-center justify-between flex-wrap gap-2`}>
                  <span>{language === "zh" ? "分析结果" : "Analysis Result"}</span>
                  <div className="flex space-x-2 flex-wrap">
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600"
                      title={language === "zh" ? "复制到剪贴板" : "Copy to clipboard"}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      {language === "zh" ? "复制" : "Copy"}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600"
                      title={language === "zh" ? "下载文本文件" : "Download text file"}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {language === "zh" ? "下载" : "Download"}
                    </Button>

                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`${themeClasses.text} max-w-none`}>
                  <div className={`p-4 rounded-lg ${theme === "light" ? "bg-gray-50" : "bg-gray-800/50"} border`}>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed overflow-x-auto">
                      {analysisJob.analysis_result}
                    </pre>
                  </div>

                  {/* Analysis metadata */}
                  {analysisJob.completed_at && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className={`${themeClasses.secondaryText} text-xs`}>
                        {language === "zh" ? "完成时间: " : "Completed at: "}
                        {new Date(analysisJob.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          onBack={() => {
            // Navigate back to analysis-prompt-config with flow state
            if (flowState.movieId && flowState.analysisPromptId) {
              router.push(`/analysis-prompt-config?movieId=${flowState.movieId}&promptId=${flowState.analysisPromptId}`)
            } else {
              router.push("/analysis-config")
            }
          }}
          onNext={analysisJob?.status === 'completed' ? () => {
            // Save analysis result to flow store
            updateFlowState({
              analysisResult: analysisJob.analysis_result,
              analysisJobId: analysisJob.id
            })
            router.push('/voice-selection')
          } : undefined}
          nextLabel={language === "zh" ? "继续配音" : "Continue to Voice"}
        />
      </AppLayout>
    </div>
  )
}
