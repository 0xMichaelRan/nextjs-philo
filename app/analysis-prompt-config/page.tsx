"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Play } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AppLayout } from "@/components/app-layout"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useFlow } from "@/hooks/use-flow"
import { apiConfig } from "@/lib/api-config"

interface MovieData {
  id: string
  title: string
  title_en: string
  title_zh?: string
  year?: number
  genre: string[]
  director?: string
  description?: string
  rating?: number
}

interface FormField {
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: (string | { label: string; value: string })[]
  auto_fill?: string
}

interface PromptTemplate {
  id: number
  name: string
  description?: string
  category: string
  system_instruction_template: string
  system_instruction_schema?: Record<string, FormField>
  system_instruction_defaults?: Record<string, any>
  user_prompt_template: string
  user_prompt_schema?: Record<string, FormField>
  user_prompt_defaults?: Record<string, any>
  language: string
  is_active: boolean
}

interface AIModel {
  id: number
  name: string
  model_id: string
  description?: string
  api_base: string
  max_tokens: number
  temperature: number
  is_active: boolean
}

export default function AnalysisPromptConfigPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { flowState, updateFlowState } = useFlow()

  // Get parameters from flow state first, fallback to URL for backward compatibility
  const movieId = flowState.movieId || searchParams.get("movieId")
  const promptId = flowState.analysisPromptId?.toString() || searchParams.get("promptId")
  const systemInputsParam = searchParams.get("systemInputs")

  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null)
  const [movieInfo, setMovieInfo] = useState<MovieData | null>(null)
  const [userInputs, setUserInputs] = useState<Record<string, any>>({})
  const [systemInputs, setSystemInputs] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [useMock, setUseMock] = useState(true)
  const [aiModels, setAiModels] = useState<AIModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null)

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-gray-50 to-white min-h-screen",
        card: "bg-white border-gray-200",
        cardHover: "hover:shadow-lg transition-shadow duration-300",
        text: "text-gray-900",
        secondaryText: "text-gray-600",
        border: "border-gray-200"
      }
    } else {
      return {
        background: "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen",
        card: "bg-gray-800/50 border-white/20 backdrop-blur-sm",
        cardHover: "hover:bg-gray-800/70 transition-all duration-300",
        text: "text-white",
        secondaryText: "text-gray-300",
        border: "border-white/20"
      }
    }
  }

  const themeClasses = getThemeClasses()

  useEffect(() => {
    if (!movieId || !promptId) {
      router.push("/analysis-config")
      return
    }

    // Parse system inputs from URL
    let parsedSystemInputs = {}
    if (systemInputsParam) {
      try {
        parsedSystemInputs = JSON.parse(decodeURIComponent(systemInputsParam))
      } catch (error) {
        console.error("Error parsing system inputs:", error)
      }
    }

    setSystemInputs(parsedSystemInputs)

    // Fetch prompt template, movie info, and AI models
    fetchPromptTemplate()
    fetchMovieInfo()
    fetchAiModels()
  }, [movieId, promptId, systemInputsParam])

  // Separate effect for loading saved user inputs from flow state
  useEffect(() => {
    if (flowState?.analysisUserInputs && Object.keys(userInputs).length === 0) {
      setUserInputs(flowState.analysisUserInputs)
    }
  }, [flowState?.analysisUserInputs])

  const fetchPromptTemplate = async () => {
    try {
      if (!movieId || !promptId) {
        router.push('/analysis-config')
        return
      }

      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.getPromptWithMovieData(parseInt(promptId), movieId, language)
      )
      if (response.ok) {
        const template = await response.json()
        setPromptTemplate(template)
        // Initialize with default values
        if (template.user_prompt_defaults) {
          setUserInputs(template.user_prompt_defaults)
        }
        // Initialize system inputs with defaults if not provided via URL
        if (template.system_instruction_defaults && Object.keys(systemInputs).length === 0) {
          setSystemInputs(template.system_instruction_defaults)
        }
      } else {
        console.error('Failed to fetch prompt template:', response.status)
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
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.movies.details(movieId) + `?language=${language}`
      )
      if (response.ok) {
        const movieData = await response.json()
        setMovieInfo(movieData)
      } else {
        // Fallback to mock data if API fails
        const mockMovieInfo: MovieData = {
          id: movieId || "tt0000000",
          title: "示例电影",
          title_en: "Sample Movie",
          title_zh: "示例电影",
          year: 2023,
          genre: ["剧情", "动作"],
          director: "示例导演",
          description: "这是一个示例电影的简介",
          rating: 8.5
        }
        setMovieInfo(mockMovieInfo)
      }
    } catch (error) {
      console.error("Error fetching movie info:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAiModels = async () => {
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.listModels()
      )
      if (response.ok) {
        const models = await response.json()
        setAiModels(models)
        // Set default model (first one)
        if (models.length > 0 && !selectedModelId) {
          setSelectedModelId(models[0].id)
        }
      } else {
        console.error('Failed to fetch AI models:', response.status)
      }
    } catch (error) {
      console.error('Error fetching AI models:', error)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    const newUserInputs = {
      ...userInputs,
      [fieldName]: value
    }
    setUserInputs(newUserInputs)
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

  const getConstructedSystemInstruction = () => {
    if (!promptTemplate?.system_instruction_template) {
      return language === "zh" ? "正在加载系统指令..." : "Loading system instruction..."
    }

    let constructedInstruction = promptTemplate.system_instruction_template
    Object.entries(systemInputs).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      constructedInstruction = constructedInstruction.replace(new RegExp(placeholder, 'g'), value || '')
    })

    return constructedInstruction || (language === "zh" ? "系统指令为空" : "System instruction is empty")
  }

  const getConstructedUserPrompt = () => {
    if (!promptTemplate?.user_prompt_template) {
      return language === "zh" ? "正在加载用户提示..." : "Loading user prompt..."
    }

    let constructedPrompt = promptTemplate.user_prompt_template
    Object.entries(userInputs).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      if (Array.isArray(value)) {
        constructedPrompt = constructedPrompt.replace(new RegExp(placeholder, 'g'), value.join(', '))
      } else {
        constructedPrompt = constructedPrompt.replace(new RegExp(placeholder, 'g'), value || '')
      }
    })

    return constructedPrompt || (language === "zh" ? "用户提示为空" : "User prompt is empty")
  }

  // Filter out movie fields from the schema
  const filterMovieFields = (schema: Record<string, FormField>) => {
    const filtered: Record<string, FormField> = {}
    Object.entries(schema).forEach(([fieldName, field]) => {
      if (!fieldName.startsWith('movie_')) {
        filtered[fieldName] = field
      }
    })
    return filtered
  }

  const renderFormField = (fieldName: string, field: FormField) => {
    const value = userInputs[fieldName] || ""

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

      case "select":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={`${themeClasses.text} flex items-center gap-1`}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(newValue) => handleInputChange(fieldName, newValue)}>
              <SelectTrigger className={`${themeClasses.card} border-white/30`}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => {
                  // Handle both string options and object options with {label, value}
                  const optionKey = typeof option === 'string' ? option : option.value || index
                  const optionValue = typeof option === 'string' ? option : option.value
                  const optionLabel = typeof option === 'string' ? option : option.label || option.value

                  return (
                    <SelectItem key={optionKey} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )

      case "checkbox":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={`${themeClasses.text} flex items-center gap-1`}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => {
                // Handle both string options and object options with {label, value}
                const optionKey = typeof option === 'string' ? option : option.value || index
                const optionValue = typeof option === 'string' ? option : option.value
                const optionLabel = typeof option === 'string' ? option : option.label || option.value

                return (
                  <div key={optionKey} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${fieldName}-${optionValue}`}
                      checked={(userInputs[fieldName] || []).includes(optionValue)}
                      onCheckedChange={(checked) => handleCheckboxChange(fieldName, optionValue, checked as boolean)}
                    />
                    <Label htmlFor={`${fieldName}-${optionValue}`} className={themeClasses.text}>
                      {optionLabel}
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

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Save current state to flow
      updateFlowState({
        analysisUserInputs: userInputs
      })

      // Create analysis job
      const jobData = {
        movie_id: movieId!,
        prompt_library_id: parseInt(promptId!),
        system_instruction_input: systemInputs,
        user_prompt_input: userInputs,
        language: language,
        ai_model_id: selectedModelId
      }

      const response = await apiConfig.makeAuthenticatedRequest(
        `${apiConfig.analysis.createJob()}?use_mock=${useMock}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData)
        }
      )

      if (response.ok) {
        const job = await response.json()

        // Save analysis job info to flow state
        updateFlowState({
          analysisJobId: job.id,
          analysisSystemInputs: systemInputs,
          analysisUserInputs: userInputs
        })

        // Navigate to analysis job page with job ID
        router.push(`/analysis-job/${job.id}`)
      } else {
        const errorData = await response.json()
        console.error("Failed to create analysis job:", errorData)
        // Fallback to old URL format for debugging
        const params = new URLSearchParams({
          movieId: movieId!,
          promptId: promptId!,
          systemInputs: encodeURIComponent(JSON.stringify(systemInputs)),
          userInputs: encodeURIComponent(JSON.stringify(userInputs)),
          useMock: useMock.toString()
        })
        router.push(`/analysis-results?${params.toString()}`)
      }
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setIsSubmitting(false)
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
                  {language === "zh" ? "无法找到分析配置，请重新开始。" : "Analysis configuration not found. Please start over."}
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/analysis-config")}
                className={`${themeClasses.text} hover:bg-white/10`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "zh" ? "返回" : "Back"}
              </Button>
              <div>
                <h1 className={`${themeClasses.text} text-2xl font-bold`}>
                  {language === "zh" ? "配置分析内容" : "Configure Analysis Content"}
                </h1>
                <p className={themeClasses.secondaryText}>
                  {promptTemplate.name} - {promptTemplate.description}
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Movie Poster and Configuration Form */}
            <div className="space-y-6">
              {/* Movie Poster */}
              {movieInfo && (
                <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/static/${movieInfo.id}/image?file=poster`}
                        alt={movieInfo.title}
                        width={192}
                        height={288}
                        className="w-48 h-72 object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <div className="text-center">
                        <h3 className={`font-bold text-lg ${themeClasses.text} mb-2`}>
                          {language === "zh" ? movieInfo.title_zh || movieInfo.title_en || movieInfo.title : movieInfo.title_en || movieInfo.title_zh || movieInfo.title}
                        </h3>
                        <p className={`${themeClasses.secondaryText} text-sm`}>
                          {movieInfo.year} • {movieInfo.genre?.join(', ')}
                        </p>
                        {movieInfo.director && (
                          <p className={`${themeClasses.secondaryText} text-sm mt-1`}>
                            {language === "zh" ? "导演" : "Director"}: {movieInfo.director}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Configuration Form */}
              <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                <CardHeader>
                  <CardTitle className={themeClasses.text}>
                    {language === "zh" ? "配置分析内容" : "Configure Analysis Content"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* User Prompt Fields - Excluding movie fields */}
                  {promptTemplate.user_prompt_schema &&
                    Object.entries(filterMovieFields(promptTemplate.user_prompt_schema)).map(([fieldName, field]) => (
                      <div key={fieldName}>
                        {renderFormField(fieldName, field as FormField)}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Configuration and Constructed Instructions */}
            <div className="space-y-6">
              {/* LLM Configuration */}
              <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                <CardHeader>
                  <CardTitle className={themeClasses.text}>
                    {language === "zh" ? "LLM 配置" : "LLM Configuration"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mock/Real Mode Selection */}
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
                        <SelectItem value="false">
                          {language === "zh" ? "真实模式 (llm call)" : "Real Mode (AI Analysis)"}
                        </SelectItem>
                        <SelectItem value="true">
                          {language === "zh" ? "模拟模式 (mock)" : "Mock Mode (Fast Testing)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-400">
                      {language === "zh"
                        ? "模拟模式将返回预设的示例结果，真实模式将调用AI进行实际分析"
                        : "Mock mode returns preset example results, real mode calls AI for actual analysis"}
                    </p>
                  </div>

                  {/* AI Model Selection */}
                  <div className="space-y-2">
                    <Label className={`${themeClasses.text} flex items-center gap-1`}>
                      {language === "zh" ? "AI 模型" : "AI Model"}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedModelId?.toString() || ""}
                      onValueChange={(value) => setSelectedModelId(parseInt(value))}
                    >
                      <SelectTrigger className={`${themeClasses.card} border-white/30`}>
                        <SelectValue placeholder={language === "zh" ? "选择AI模型" : "Select AI model"} />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.name} ({model.model_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-400">
                      {language === "zh"
                        ? "选择用于分析的AI模型"
                        : "Select the AI model to use for analysis"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Constructed System Instruction */}
              <Card className={`${themeClasses.card} ${themeClasses.cardHover} h-fit`}>
                <CardHeader>
                  <CardTitle className={themeClasses.text}>
                    {language === "zh" ? "构建的系统指令" : "Constructed System Instruction"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`${themeClasses.card} border border-white/20 rounded-lg p-4 max-h-80 overflow-y-auto`}>
                    <pre className={`${themeClasses.text} text-sm whitespace-pre-wrap font-mono`}>
                      {getConstructedSystemInstruction()}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Constructed User Prompt */}
              <Card className={`${themeClasses.card} ${themeClasses.cardHover} h-fit`}>
                <CardHeader>
                  <CardTitle className={themeClasses.text}>
                    {language === "zh" ? "构建的用户提示" : "Constructed User Prompt"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`${themeClasses.card} border border-white/20 rounded-lg p-4 max-h-80 overflow-y-auto`}>
                    <pre className={`${themeClasses.text} text-sm whitespace-pre-wrap font-mono`}>
                      {getConstructedUserPrompt()}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>

        {/* Navigation Buttons - Hidden on mobile (shown in fixed bottom bar) */}
        <div className="pt-6 hidden md:block">
          <BottomNavigation
            onBack={() => router.push("/analysis-config")}
            onNext={handleSubmit}
            nextDisabled={isSubmitting}
            nextLabel={isSubmitting ? (language === "zh" ? "分析中..." : "Analyzing...") : (language === "zh" ? "开始分析" : "Start Analysis")}
          />
        </div>

        {/* Mobile Bottom Bar */}
        <MobileBottomBar>
          <div className="flex space-x-3 w-full">
            <Button
              onClick={() => router.push("/analysis-config")}
              variant="outline"
              size="lg"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {language === "zh" ? "返回" : "Back"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 disabled:opacity-50"
            >
              {isSubmitting ? (language === "zh" ? "分析中..." : "Analyzing...") : (language === "zh" ? "开始分析" : "Start Analysis")}
            </Button>
          </div>
        </MobileBottomBar>
      </AppLayout>
    </div>
  )
}
