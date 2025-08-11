"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Info, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { AppLayout } from "@/components/app-layout"
import { MovieHeader } from "@/components/movie-header"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useFlow } from "@/hooks/use-flow"
import { apiConfig } from "@/lib/api-config"

interface FormField {
  type: string
  label: string
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  required: boolean
  auto_fill?: string
}

export default function AnalysisPromptConfigPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { flowState, updateFlowState } = useFlow()

  const movieId = searchParams.get('movieId') || flowState?.movieId
  const promptId = searchParams.get('promptId') || flowState?.analysisPromptId?.toString()
  const systemInputsParam = searchParams.get('systemInputs')

  const [promptTemplate, setPromptTemplate] = useState<any>(null)
  const [systemInputs, setSystemInputs] = useState<Record<string, any>>({})
  const [userInputs, setUserInputs] = useState<Record<string, any>>({})
  const [movieInfo, setMovieInfo] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [useMock, setUseMock] = useState(true)  // Default to true

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

  // Initial setup effect - only runs once or when core parameters change
  useEffect(() => {
    console.log('Analysis Prompt Config - Debug Info:', {
      movieId,
      promptId,
      systemInputsParam
    })

    // Check if we have the required parameters (from URL or flow state)
    if (!movieId || !promptId) {
      console.log('Missing required parameters, redirecting to analysis-config')
      router.push('/analysis-config')
      return
    }

    // Parse system inputs from URL or use flow state
    let parsedSystemInputs = {}
    if (systemInputsParam) {
      try {
        parsedSystemInputs = JSON.parse(systemInputsParam)
      } catch (error) {
        console.error('Error parsing system inputs from URL:', error)
      }
    } else if (flowState?.analysisSystemInputs) {
      parsedSystemInputs = flowState.analysisSystemInputs
    }

    setSystemInputs(parsedSystemInputs)

    // Fetch prompt template and movie info
    fetchPromptTemplate()
    fetchMovieInfo()
  }, [movieId, promptId, systemInputsParam])

  // Separate effect for loading saved user inputs from flow state
  useEffect(() => {
    if (flowState?.analysisUserInputs && Object.keys(userInputs).length === 0) {
      setUserInputs(flowState.analysisUserInputs)
    }
  }, [flowState?.analysisUserInputs])

  const fetchPromptTemplate = async () => {
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.listPrompts(undefined, language)
      )
      if (response.ok) {
        const templates = await response.json()
        const template = templates.find((t: any) => t.id === parseInt(promptId!))
        if (template) {
          setPromptTemplate(template)
          // Initialize with default values
          if (template.user_prompt_defaults) {
            setUserInputs(template.user_prompt_defaults)
          }
        } else {
          router.push('/analysis-config')
        }
      } else {
        console.error('Failed to fetch prompt templates:', response.status)
        router.push('/analysis-config')
      }
    } catch (error) {
      console.error('Error fetching prompt template:', error)
      router.push('/analysis-config')
    }
  }

  const fetchMovieInfo = async () => {
    if (!movieId) return

    try {
      // Fetch movie info from API
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.movies.details(movieId) + `?language=${language}`
      )
      if (response.ok) {
        const movieData = await response.json()
        setMovieInfo(movieData)

        // Auto-fill movie_information field (hidden from UI)
        setUserInputs(prev => {
          const autoFillData: Record<string, any> = {}

          // Auto-fill movie_information with comprehensive movie data
          const movieInformation = language === "zh"
            ? `标题：${movieData.title_zh || movieData.title || movieData.original_title}
年份：${movieData.year || ''}
导演：${movieData.director || ''}
主演：${movieData.cast?.slice(0, 5).join(', ') || ''}
类型：${movieData.genre?.join(', ') || ''}
简介：${movieData.description || ''}`
            : `Title: ${movieData.title_en || movieData.title || movieData.original_title}
Year: ${movieData.year || ''}
Director: ${movieData.director || ''}
Cast: ${movieData.cast?.slice(0, 5).join(', ') || ''}
Genres: ${movieData.genre?.join(', ') || ''}
Overview: ${movieData.description || ''}`

          autoFillData['movie_information'] = movieInformation

          // Auto-fill other movie-related fields if they exist and are empty
          if (promptTemplate?.user_prompt_schema) {
            Object.entries(promptTemplate.user_prompt_schema).forEach(([fieldName, field]: [string, any]) => {
              if (field.auto_fill && !prev[fieldName]) {
                switch (field.auto_fill) {
                  case 'movie_title':
                    autoFillData[fieldName] = language === "zh"
                      ? (movieData.title_zh || movieData.title || movieData.original_title)
                      : (movieData.title_en || movieData.title || movieData.original_title)
                    break
                  case 'movie_year':
                    autoFillData[fieldName] = movieData.year?.toString() || ''
                    break
                  case 'movie_director':
                    autoFillData[fieldName] = movieData.director || ''
                    break
                  case 'movie_genre':
                    autoFillData[fieldName] = movieData.genre?.join(', ') || ''
                    break
                }
              }
            })
          }

          return { ...prev, ...autoFillData }
        })
      } else {
        // Fallback to mock data if API fails
        const mockMovieInfo = {
          title_zh: "示例电影",
          title_en: "Sample Movie",
          year: 2023,
          director: "示例导演",
          cast: ["演员1", "演员2"],
          overview_zh: "这是一个示例电影"
        }
        setMovieInfo(mockMovieInfo)

        setUserInputs(prev => ({
          ...prev,
          movie_title: mockMovieInfo.title_zh,
          movie_year: mockMovieInfo.year,
          movie_info: `标题：${mockMovieInfo.title_zh}\n年份：${mockMovieInfo.year}\n导演：${mockMovieInfo.director}\n主演：${mockMovieInfo.cast.join(', ')}\n简介：${mockMovieInfo.overview_zh}`
        }))
      }
    } catch (error) {
      console.error("Error fetching movie info:", error)
      // Set basic fallback data
      setUserInputs(prev => ({
        ...prev,
        movie_title: "未知电影",
        movie_year: new Date().getFullYear(),
        movie_info: "电影信息加载失败"
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    const newUserInputs = {
      ...userInputs,
      [fieldName]: value
    }
    setUserInputs(newUserInputs)

    // Note: Flow state will be saved when user clicks submit, not on every keystroke
  }

  const handleCheckboxChange = (fieldName: string, optionValue: string, checked: boolean) => {
    setUserInputs(prev => {
      const currentValues = prev[fieldName] || []
      if (checked) {
        return {
          ...prev,
          [fieldName]: [...currentValues, optionValue]
        }
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter((v: string) => v !== optionValue)
        }
      }
    })
  }

  const renderFormField = (fieldName: string, field: FormField) => {
    const value = userInputs[fieldName] || ""

    // Hide movie_information field from UI
    if (fieldName === 'movie_information') {
      return null
    }

    switch (field.type) {
      case "textarea":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={`${themeClasses.text} flex items-center gap-1`}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              className={`${themeClasses.card} border-white/30 min-h-[120px]`}
            />
          </div>
        )

      case "text":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={`${themeClasses.text} flex items-center gap-1`}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 rounded-md ${themeClasses.card} border-white/30 border`}
            />
          </div>
        )

      case "number":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={`${themeClasses.text} flex items-center gap-1`}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(fieldName, parseInt(e.target.value))}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 rounded-md ${themeClasses.card} border-white/30 border`}
            />
          </div>
        )

      case "checkbox":
        return (
          <div key={fieldName} className="space-y-3">
            <Label className={`${themeClasses.text} flex items-center gap-1`}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {field.options?.map((option) => {
                const isChecked = (userInputs[fieldName] || []).includes(option.value)
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${fieldName}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(fieldName, option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`${fieldName}-${option.value}`}
                      className={`text-sm ${themeClasses.text} cursor-pointer`}
                    >
                      {option.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isFormValid = () => {
    if (!promptTemplate) return false

    const schema = promptTemplate.user_prompt_schema || {}

    // Check required fields
    for (const [fieldName, field] of Object.entries(schema)) {
      if ((field as FormField).required && !userInputs[fieldName]) {
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!user || !movieId || !promptTemplate) {
      return
    }

    // Validate form and show errors if invalid
    if (!isFormValid()) {
      // Show validation errors by highlighting invalid fields
      alert(language === "zh" ? "请完成所有必填字段" : "Please complete all required fields")
      return
    }

    setIsSubmitting(true)

    // Save user inputs to flow state before submitting
    updateFlowState({
      analysisUserInputs: userInputs
    })

    // Construct and log the user prompt
    let constructedUserPrompt = promptTemplate.user_prompt_template
    Object.entries(userInputs).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      if (Array.isArray(value)) {
        constructedUserPrompt = constructedUserPrompt.replace(new RegExp(placeholder, 'g'), value.join(', '))
      } else {
        constructedUserPrompt = constructedUserPrompt.replace(new RegExp(placeholder, 'g'), value || '')
      }
    })

    console.log('=== CONSTRUCTED USER PROMPT ===')
    console.log(constructedUserPrompt)
    console.log('=== END USER PROMPT ===')

    try {
      // Submit analysis job to backend
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.createJob() + `?use_mock=${useMock}`,
        {
          method: 'POST',
          body: JSON.stringify({
            movie_id: movieId,
            prompt_library_id: promptTemplate.id,
            system_instruction_input: systemInputs,
            user_prompt_input: userInputs,
            language: language
          })
        }
      )

      if (response.ok) {
        const analysisJob = await response.json()

        // Navigate to results page
        router.push(`/analysis-results?jobId=${analysisJob.id}`)
      } else {
        console.error("Failed to create analysis job:", await response.text())
        // Handle error
      }
    } catch (error) {
      console.error("Error creating analysis job:", error)
      // Handle error
    } finally {
      setIsSubmitting(false)
      setLoading(false)
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
                  {language === "zh" ? "加载配置..." : "Loading configuration..."}
                </p>
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  if (!promptTemplate) {
    return (
      <div className={themeClasses.background}>
        <AppLayout>
          <div className="container mx-auto px-6 py-8">
            <Card className={`${themeClasses.card} max-w-md mx-auto text-center`}>
              <CardContent className="p-8">
                <h2 className={`${themeClasses.text} text-xl font-bold mb-4`}>
                  {language === "zh" ? "配置丢失" : "Configuration Lost"}
                </h2>
                <p className={`${themeClasses.secondaryText} mb-4`}>
                  {language === "zh" ? "请重新开始配置流程" : "Please restart the configuration process"}
                </p>
                <Button onClick={() => router.push("/analysis-config")} className="bg-purple-600 hover:bg-purple-700">
                  {language === "zh" ? "重新开始" : "Start Over"}
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
              {language === "zh" ? "内容配置" : "Content Configuration"}
            </h1>
            <p className={`${themeClasses.secondaryText} text-lg`}>
              {language === "zh" ? "第二步：配置分析内容和重点" : "Step 2: Configure analysis content and focus"}
            </p>
          </div>

          {/* Movie Header */}
          {movieId && (
            <div className="mb-6">
              <MovieHeader movieId={movieId} movieTitle="" />
            </div>
          )}

          {/* Template Info */}
          <Card className={`${themeClasses.card} ${themeClasses.cardHover} mb-6`}>
            <CardHeader>
              <CardTitle className={themeClasses.text}>
                {language === "zh" ? "选中的模板" : "Selected Template"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${themeClasses.text} mb-1`}>
                    {promptTemplate.name}
                  </h3>
                  <p className={`text-sm ${themeClasses.secondaryText}`}>
                    {promptTemplate.description}
                  </p>
                </div>
                <Badge variant="outline">{promptTemplate.category}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
            <CardHeader>
              <CardTitle className={themeClasses.text}>
                {language === "zh" ? "配置分析内容" : "Configure Analysis Content"}
              </CardTitle>
              <div className={`flex items-center space-x-2 ${themeClasses.secondaryText}`}>
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  {language === "zh" ? "这些参数将决定分析的具体内容和重点" : "These parameters will determine the specific content and focus of analysis"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mock Configuration */}
              <div className="space-y-2">
                <Label className={`${themeClasses.text} flex items-center gap-1`}>
                  {language === "zh" ? "分析模式" : "Analysis Mode"}
                  <span className="text-red-500">*</span>
                </Label>
                <Select value={useMock.toString()} onValueChange={(value) => setUseMock(value === "true")}>
                  <SelectTrigger className={`${themeClasses.card} border-white/30`}>
                    <SelectValue placeholder={language === "zh" ? "选择分析模式" : "Select analysis mode"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      {language === "zh" ? "模拟模式 (快速测试)" : "Mock Mode (Fast Testing)"}
                    </SelectItem>
                    <SelectItem value="false">
                      {language === "zh" ? "真实模式 (AI分析)" : "Real Mode (AI Analysis)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400">
                  {language === "zh"
                    ? "模拟模式将返回预设的示例结果，真实模式将调用AI进行实际分析"
                    : "Mock mode returns preset example results, real mode calls AI for actual analysis"}
                </p>
              </div>

              {/* User Prompt Fields */}
              {promptTemplate.user_prompt_schema &&
                Object.entries(promptTemplate.user_prompt_schema).map(([fieldName, field]) =>
                  renderFormField(fieldName, field as FormField)
                )}
            </CardContent>
          </Card>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10 z-[60]">
            <div className="container mx-auto flex justify-between items-center">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "zh" ? "上一步" : "Previous"}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === "zh" ? "生成分析中..." : "Generating Analysis..."}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {language === "zh" ? "生成分析" : "Generate Analysis"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom padding to prevent content from being hidden behind fixed navigation */}
          <div className="h-20"></div>
        </div>
      </AppLayout>
    </div>
  )
}
