"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"

interface AnalysisJob {
  id: number
  movie_id: string
  status: string
  progress: number
  character_type: string
  tone_type: string
  style_type: string
  length_type: string
  focus_area?: string
  custom_request?: string
  analysis_result?: string
  error_message?: string
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
  
  const jobId = searchParams.get('jobId')
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    if (!jobId) {
      setError("No job ID provided")
      setLoading(false)
      return
    }

    fetchAnalysisJob()
    
    // Poll for updates if job is still processing
    const interval = setInterval(() => {
      if (analysisJob?.status === 'processing' || analysisJob?.status === 'pending') {
        fetchAnalysisJob()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user, jobId, analysisJob?.status])

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
      } else {
        setError("Failed to fetch analysis job")
      }
    } catch (err) {
      setError("Error fetching analysis job")
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
            <CardContent>
              {(analysisJob.status === 'processing' || analysisJob.status === 'pending') && (
                <div className="space-y-2">
                  <Progress value={analysisJob.progress} className="w-full" />
                  <p className={`${themeClasses.secondaryText} text-sm`}>
                    {language === "zh" ? `进度: ${analysisJob.progress}%` : `Progress: ${analysisJob.progress}%`}
                  </p>
                </div>
              )}
              
              {analysisJob.status === 'failed' && analysisJob.error_message && (
                <p className="text-red-500 text-sm">{analysisJob.error_message}</p>
              )}
            </CardContent>
          </Card>

          {/* Analysis Result */}
          {analysisJob.status === 'completed' && analysisJob.analysis_result && (
            <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
              <CardHeader>
                <CardTitle className={`${themeClasses.text} flex items-center justify-between`}>
                  <span>{language === "zh" ? "分析结果" : "Analysis Result"}</span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => router.push('/voice-selection')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      size="sm"
                    >
                      {language === "zh" ? "继续配音" : "Continue to Voice"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`${themeClasses.text} prose prose-gray dark:prose-invert max-w-none`}>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {analysisJob.analysis_result}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </div>
  )
}
