"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useFlow } from "@/hooks/use-flow"
import { apiConfig } from "@/lib/api-config"
import { useAuthGuard, checkAuthForAction } from "@/hooks/use-auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { getQiniuPosterUrl } from "@/lib/qiniu-config"

interface PromptTemplate {
  id: number
  name: string
  description: string
  category: string
  system_instruction_template: string
  system_instruction_schema: any
  system_instruction_defaults: any
  user_prompt_template: string
  user_prompt_schema: any
  user_prompt_defaults: any
  language: string
  is_active: boolean
}

interface FormField {
  type: string
  label: string
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  required: boolean
}

export default function AnalysisConfigPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const { theme } = useTheme()
  const { flowState, updateFlowState } = useFlow()
  const { user } = useAuth()

  // Analysis config page doesn't require authentication, but next step does
  useAuthGuard({ requireAuth: false })

  // Get movieId from flow state first, fallback to URL for backward compatibility
  const movieId = flowState.movieId || searchParams.get('movieId')
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [systemInputs, setSystemInputs] = useState<Record<string, any>>({})
  const [movieData, setMovieData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [movieLoading, setMovieLoading] = useState(true)

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        text: "theme-text-primary",
        secondaryText: "theme-text-secondary",
        card: "theme-bg-elevated border-gray-200/50",
        cardHover: "hover:shadow-lg transition-all duration-300",
        button: "theme-button-primary",
        outlineButton: "theme-button-secondary",
        accent: "theme-brand-primary",
        error: "theme-status-error",
        input: "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500",
        select: "bg-white border-gray-200 text-gray-900"
      }
    }
    /* dark-theme refactor */
    return {
      background: "theme-gradient-hero",
      text: "theme-text-primary",
      secondaryText: "theme-text-secondary",
      card: "theme-surface-elevated border-white/20",
      cardHover: "hover:shadow-xl transition-all duration-300",
      button: "theme-button-primary",
      outlineButton: "theme-button-secondary",
      accent: "theme-brand-primary",
      error: "theme-status-error",
      input: "theme-surface-elevated border-white/20 text-white placeholder:text-gray-400",
      select: "theme-surface-elevated border-white/20 text-white"
    }
  }

  const themeClasses = getThemeClasses()

  useEffect(() => {
    // Redirect to movie selection if no movie is selected
    if (!movieId) {
      router.push('/movie-selection')
      return
    }

    fetchPromptTemplates()
    fetchMovieData()
  }, [language, movieId])

  // This logic is now handled in fetchPromptTemplates

  const fetchPromptTemplates = async () => {
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.analysis.listPrompts(undefined, language)
      )
      if (response.ok) {
        const templates = await response.json()
        setPromptTemplates(templates)

        // Check if we have a saved template in flow state
        if (flowState?.analysisPromptId) {
          const savedTemplate = templates.find((t: any) => t.id === flowState.analysisPromptId)
          if (savedTemplate) {
            setSelectedTemplate(savedTemplate)
            setSystemInputs(flowState.analysisSystemInputs || savedTemplate.system_instruction_defaults || {})
          } else if (templates.length > 0) {
            // Fallback to first template if saved template not found
            selectTemplate(templates[0])
          }
        } else if (templates.length > 0) {
          // Auto-select first template if no saved state
          selectTemplate(templates[0])
        }
      } else {
        console.error("Failed to fetch prompt templates:", response.status)
      }
    } catch (error) {
      console.error("Error fetching prompt templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMovieData = async () => {
    if (!movieId) return

    setMovieLoading(true)
    try {
      const response = await apiConfig.makeAuthenticatedRequest(
        apiConfig.movies.details(movieId) + `?language=${language}`
      )
      if (response.ok) {
        const movie = await response.json()
        setMovieData(movie)
      } else {
        console.error("Failed to fetch movie data:", response.status)
      }
    } catch (error) {
      console.error("Error fetching movie data:", error)
    } finally {
      setMovieLoading(false)
    }
  }

  const selectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    // Initialize with default values
    const defaultInputs = template.system_instruction_defaults || {}
    setSystemInputs(defaultInputs)

    // Save to flow state
    updateFlowState({
      analysisPromptId: template.id,
      analysisSystemInputs: defaultInputs
    })
  }

  const handleInputChange = (fieldName: string, value: any) => {
    const newInputs = {
      ...systemInputs,
      [fieldName]: value
    }
    setSystemInputs(newInputs)

    // Save to flow state
    updateFlowState({
      analysisSystemInputs: newInputs
    })
  }

  const renderFormField = (fieldName: string, field: FormField) => {
    const value = systemInputs[fieldName] || ""
    const isRequired = field.required
    const isEmpty = !value || (Array.isArray(value) && value.length === 0)
    const hasError = isRequired && isEmpty

    switch (field.type) {
      case "select":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={`${themeClasses.text} flex items-center gap-1`}>
              {field.label}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(fieldName, val)}>
              <SelectTrigger className={`${themeClasses.select} ${hasError ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={language === "zh" ? `请选择${field.label}` : `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent className={themeClasses.card}>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value} className={`${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-red-500 text-sm">
                {language === "zh" ? "此字段为必填项" : "This field is required"}
              </p>
            )}
          </div>
        )

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
              className={`${themeClasses.input} min-h-[100px]`}
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
              className={`w-full px-3 py-2 rounded-md ${themeClasses.input} border`}
            />
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
              {field.options?.map((option) => {
                const isChecked = Array.isArray(value) ? value.includes(option.value) : false
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${fieldName}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(value) ? value : []
                        if (checked) {
                          handleInputChange(fieldName, [...currentValues, option.value])
                        } else {
                          handleInputChange(fieldName, currentValues.filter(v => v !== option.value))
                        }
                      }}
                    />
                    <Label
                      htmlFor={`${fieldName}-${option.value}`}
                      className={`${themeClasses.text} text-sm cursor-pointer`}
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
    if (!selectedTemplate) return false
    
    const schema = selectedTemplate.system_instruction_schema || {}
    
    // Check required fields
    for (const [fieldName, field] of Object.entries(schema)) {
      if ((field as FormField).required && !systemInputs[fieldName]) {
        return false
      }
    }
    
    return true
  }

  const handleNext = () => {
    console.log('Analysis Config - handleNext Debug:', {
      selectedTemplate: selectedTemplate?.id,
      movieId,
      systemInputs
    })

    if (!selectedTemplate || !movieId) {
      console.log('Missing required data, not proceeding')
      return
    }

    // Validate form and show errors if invalid
    if (!isFormValid()) {
      alert(language === "zh" ? "请完成所有必填字段" : "Please complete all required fields")
      return
    }

    // Check authentication before proceeding to next step
    if (!checkAuthForAction(user, router, `/analysis-config?movieId=${movieId}`)) {
      return
    }

    // Save current state to flow state
    updateFlowState({
      movieId: movieId,
      analysisPromptId: selectedTemplate.id,
      analysisSystemInputs: systemInputs
    })

    // Construct and log the system instruction
    let constructedSystemInstruction = selectedTemplate.system_instruction_template
    Object.entries(systemInputs).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      constructedSystemInstruction = constructedSystemInstruction.replace(new RegExp(placeholder, 'g'), value || '')
    })

    // Additional guidelines are now enforced at the backend level for all LLM API calls
    // This ensures consistent TTS-friendly output without user intervention

    console.log('=== CONSTRUCTED SYSTEM INSTRUCTION ===')
    console.log(constructedSystemInstruction)
    console.log('=== END SYSTEM INSTRUCTION ===')

    console.log('Navigating to analysis-prompt-config with:', {
      movieId,
      promptId: selectedTemplate.id
    })

    // Navigate to user prompt configuration (flow state will be used)
    router.push(`/analysis-prompt-config?movieId=${movieId}&promptId=${selectedTemplate.id}`)
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
                  {language === "zh" ? "加载分析模板..." : "Loading analysis templates..."}
                </p>
              </div>
            </div>
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
              onClick={() => router.push(`/movie/${movieId}`)}
              variant="ghost"
              className={`${themeClasses.text} hover:bg-white/10 mb-4`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "zh" ? "返回" : "Back"}
            </Button>
            
            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
              {language === "zh" ? "分析配置" : "Analysis Configuration"}
            </h1>
            <p className={`${themeClasses.secondaryText} text-lg`}>
              {language === "zh" ? "第一步：选择分析模板并配置分析参数" : "Step 1: Select analysis template and configure parameters"}
            </p>
          </div>

          {/* Movie Information */}
          {movieData && (
            <Card className={`${themeClasses.card} mb-6`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <Image
                      src={getQiniuPosterUrl(movieData.id)}
                      alt={language === "zh" ? (movieData.title_zh || movieData.title) : movieData.title_en}
                      width={120}
                      height={180}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  {/* Movie Details */}
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                      {language === "zh" ? (movieData.title_zh || movieData.title) : movieData.title_en}
                    </h2>
                    <h3 className={`text-lg ${themeClasses.secondaryText} mb-3`}>
                      {language === "zh" ? movieData.title_en : (movieData.title_zh || movieData.original_title)}
                    </h3>

                    {/* Genres */}
                    {movieData.genre && movieData.genre.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {movieData.genre.map((genre: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Overview */}
                    {movieData.description && (
                      <p className={`${themeClasses.secondaryText} text-sm leading-relaxed line-clamp-3`}>
                        {movieData.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading state for movie */}
          {movieLoading && (
            <Card className={`${themeClasses.card} mb-6`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-[120px] h-[180px] bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selection */}
            <div className="lg:col-span-1">
              <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                <CardHeader>
                  <CardTitle className={themeClasses.text}>
                    {language === "zh" ? "选择分析模板" : "Select Template"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {promptTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/30 hover:border-white/50"
                      }`}
                    >
                      <h3 className={`font-semibold ${themeClasses.text} mb-1`}>
                        {template.name}
                      </h3>
                      <p className={`text-sm ${themeClasses.secondaryText} mb-2`}>
                        {template.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Configuration Form */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <Card className={`${themeClasses.card} ${themeClasses.cardHover}`}>
                  <CardHeader>
                    <CardTitle className={themeClasses.text}>
                      {language === "zh" ? "配置分析参数" : "Configure Analysis Parameters"}
                    </CardTitle>
                    <div className={`flex items-center space-x-2 ${themeClasses.secondaryText}`}>
                      <Info className="w-4 h-4" />
                      <span className="text-sm">
                        {language === "zh" ? "这些参数将影响AI的分析角度和风格" : "These parameters will affect AI's analysis perspective and style"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedTemplate.system_instruction_schema &&
                      Object.entries(selectedTemplate.system_instruction_schema).map(([fieldName, field]) =>
                        renderFormField(fieldName, field as FormField)
                      )}
                  </CardContent>
                </Card>
              ) : (
                <Card className={`${themeClasses.card} text-center py-12`}>
                  <CardContent>
                    <p className={themeClasses.secondaryText}>
                      {language === "zh" ? "请先选择一个分析模板" : "Please select an analysis template first"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Navigation Buttons - Hidden on mobile (shown in fixed bottom bar) */}
          <div className="pt-6 hidden md:block">
            <BottomNavigation
              onBack={() => router.push(`/movie/${movieId}`)}
              onNext={handleNext}
              nextLabel={language === "zh" ? "下一步" : "Next"}
            />
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <MobileBottomBar>
          <div className="flex space-x-3 w-full">
            <Button
              onClick={() => router.push(`/movie/${movieId}`)}
              variant="outline"
              size="lg"
              className="flex-1 py-4"
            >
              {language === "zh" ? "返回" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              size="lg"
              className="flex-1 theme-button-primary font-semibold py-4"
            >
              {language === "zh" ? "下一步" : "Next"}
            </Button>
          </div>
        </MobileBottomBar>
      </AppLayout>
    </div>
  )
}
