"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Clock, Upload, Settings, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiConfig } from "@/lib/api-config"

interface SubmissionStep {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  completed: boolean
  current: boolean
}

export default function JobSubmissionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { user } = useAuth()

  const steps: SubmissionStep[] = [
    {
      id: "config",
      title: "组合用户配置",
      titleEn: "Composing User Configuration",
      description: "正在整理您的分析选项和偏好设置...",
      descriptionEn: "Organizing your analysis options and preferences...",
      completed: false,
      current: false
    },
    {
      id: "data",
      title: "组合数据",
      titleEn: "Composing Data",
      description: "正在准备电影数据和脚本内容...",
      descriptionEn: "Preparing movie data and script content...",
      completed: false,
      current: false
    },
    {
      id: "submit",
      title: "提交到视频生成服务器",
      titleEn: "Submit to Video Generation Server",
      description: "正在将任务提交到后端处理系统...",
      descriptionEn: "Submitting task to backend processing system...",
      completed: false,
      current: false
    }
  ]

  const [submissionSteps, setSubmissionSteps] = useState(steps)

  useEffect(() => {
    startSubmissionProcess()
  }, [])

  const startSubmissionProcess = async () => {
    try {
      setError(null)

      // Get job data from URL params
      const movieId = searchParams.get('movieId')
      const movieTitle = searchParams.get('movieTitle')
      const movieTitleEn = searchParams.get('movieTitleEn')

      if (!movieId || !movieTitle) {
        throw new Error('Missing movie information')
      }

      // Step 1: Compose user configuration
      await processStep(0, 1000)

      // Step 2: Compose data
      await processStep(1, 1500)

      // Step 3: Submit to server
      setCurrentStep(2)
      setProgress(75)

      // Create job
      const jobData = {
        movie_id: movieId,
        movie_title: movieTitle,
        movie_title_en: movieTitleEn || movieTitle,
        analysis_options: {
          include_themes: true,
          include_characters: true,
          analysis_depth: "detailed"
        },
        voice_options: {
          voice_id: "zh-CN-XiaoxiaoNeural",
          language: "zh",
          speed: 1.0
        },
        script_options: {
          max_length: 2000,
          style: "narrative"
        },
        status: "draft"
      }

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.jobs.create(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create job')
      }

      const job = await response.json()
      setJobId(job.id)

      // Submit job to queue
      const submitResponse = await apiConfig.makeAuthenticatedRequest(
        apiConfig.jobs.submitToQueue(job.id),
        {
          method: 'POST',
        }
      )

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json()
        throw new Error(errorData.detail || 'Failed to submit job to queue')
      }

      // Complete submission
      setSubmissionComplete(true)
      setProgress(100)

      // Wait a moment then navigate to job-pending
      setTimeout(() => {
        router.push(`/job-pending?jobId=${job.id}`)
      }, 1500)

    } catch (error) {
      console.error("Submission error:", error)
      setError(language === "zh" ? `提交失败: ${error.message}` : `Submission failed: ${error.message}`)
    }
  }

  const processStep = async (stepIndex: number, duration: number) => {
    // Mark step as current
    setSubmissionSteps(prev => prev.map((step, index) => ({
      ...step,
      current: index === stepIndex,
      completed: index < stepIndex
    })))
    setCurrentStep(stepIndex)

    // Simulate processing with progress
    const startProgress = (stepIndex / steps.length) * 100
    const endProgress = ((stepIndex + 1) / steps.length) * 100
    const progressDiff = endProgress - startProgress

    for (let i = 0; i <= 100; i += 2) {
      setProgress(startProgress + (progressDiff * i / 100))
      await new Promise(resolve => setTimeout(resolve, duration / 50))
    }

    // Mark step as completed
    setSubmissionSteps(prev => prev.map((step, index) => ({
      ...step,
      current: false,
      completed: index <= stepIndex
    })))
  }

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
        text: "text-gray-800",
        secondaryText: "text-gray-600",
        card: "bg-white/80 border-gray-200/50",
      }
    }
    return {
      background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
      text: "text-white",
      secondaryText: "text-gray-300",
      card: "bg-white/10 border-white/20",
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <AppLayout title={language === "zh" ? "提交任务" : "Submitting Job"}>
      <div className={`min-h-screen ${themeClasses.background}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold ${themeClasses.text} mb-4`}>
                {language === "zh" ? "正在提交您的视频生成任务" : "Submitting Your Video Generation Job"}
              </h1>
              <p className={`${themeClasses.secondaryText} text-lg`}>
                {language === "zh" 
                  ? "请稍候，我们正在处理您的请求..." 
                  : "Please wait while we process your request..."
                }
              </p>
            </div>

            {/* Progress Card */}
            <Card className={`${themeClasses.card} backdrop-blur-md mb-8`}>
              <CardContent className="p-8">
                {/* Overall Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`${themeClasses.text} font-semibold`}>
                      {language === "zh" ? "总体进度" : "Overall Progress"}
                    </span>
                    <span className={`${themeClasses.text} font-mono`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Steps */}
                <div className="space-y-6">
                  {submissionSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-4">
                      {/* Step Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? "bg-green-500 text-white" 
                          : step.current 
                            ? "bg-blue-500 text-white animate-pulse" 
                            : "bg-gray-300 text-gray-600"
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.current ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <h3 className={`${themeClasses.text} font-semibold mb-1`}>
                          {language === "zh" ? step.title : step.titleEn}
                        </h3>
                        <p className={`${themeClasses.secondaryText} text-sm`}>
                          {language === "zh" ? step.description : step.descriptionEn}
                        </p>
                      </div>

                      {/* Step Status */}
                      <div className="flex-shrink-0">
                        {step.completed && (
                          <span className="text-green-500 text-sm font-medium">
                            {language === "zh" ? "完成" : "Complete"}
                          </span>
                        )}
                        {step.current && (
                          <span className="text-blue-500 text-sm font-medium">
                            {language === "zh" ? "进行中..." : "Processing..."}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Completion Message */}
                {submissionComplete && (
                  <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <h4 className="text-green-800 dark:text-green-200 font-semibold">
                          {language === "zh" ? "提交成功！" : "Submission Successful!"}
                        </h4>
                        <p className="text-green-600 dark:text-green-300 text-sm">
                          {language === "zh" 
                            ? "正在跳转到任务状态页面..." 
                            : "Redirecting to job status page..."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <div>
                        <h4 className="text-red-800 dark:text-red-200 font-semibold">
                          {language === "zh" ? "提交失败" : "Submission Failed"}
                        </h4>
                        <p className="text-red-600 dark:text-red-300 text-sm">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Note */}
            <div className="text-center">
              <p className={`${themeClasses.secondaryText} text-sm`}>
                {language === "zh" 
                  ? "此过程通常需要几秒钟时间，请不要关闭页面"
                  : "This process usually takes a few seconds, please don't close the page"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
