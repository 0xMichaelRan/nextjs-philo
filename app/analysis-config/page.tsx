"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { AppLayout } from "@/components/app-layout"
import { MovieHeader } from "@/components/movie-header"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useFlow } from "@/hooks/use-flow"
import { apiConfig } from "@/lib/api-config"

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

  const movieId = searchParams.get('movieId')
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [systemInputs, setSystemInputs] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

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
    fetchPromptTemplates()
  }, [])

  const fetchPromptTemplates = async () => {
    try {
      const response = await fetch(apiConfig.analysis.listPrompts(undefined, language))
      if (response.ok) {
        const templates = await response.json()
        setPromptTemplates(templates)
        
        // Auto-select first template if available
        if (templates.length > 0) {
          selectTemplate(templates[0])
        }
      }
    } catch (error) {
      console.error("Error fetching prompt templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    // Initialize with default values
    setSystemInputs(template.system_instruction_defaults || {})
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setSystemInputs(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const renderFormField = (fieldName: string, field: FormField) => {
    const value = systemInputs[fieldName] || ""

    switch (field.type) {
      case "select":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={themeClasses.text}>{field.label}</Label>
            <Select value={value} onValueChange={(val) => handleInputChange(fieldName, val)}>
              <SelectTrigger className={`${themeClasses.card} border-white/30`}>
                <SelectValue placeholder={`请选择${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "textarea":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={themeClasses.text}>{field.label}</Label>
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              className={`${themeClasses.card} border-white/30 min-h-[100px]`}
            />
          </div>
        )

      case "text":
        return (
          <div key={fieldName} className="space-y-2">
            <Label className={themeClasses.text}>{field.label}</Label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 rounded-md ${themeClasses.card} border-white/30 border`}
            />
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
    if (!selectedTemplate || !isFormValid() || !movieId) return

    // Navigate to user prompt configuration with parameters
    const params = new URLSearchParams({
      movieId: movieId,
      promptId: selectedTemplate.id.toString(),
      systemInputs: JSON.stringify(systemInputs)
    })
    router.push(`/analysis-prompt-config?${params.toString()}`)
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
              onClick={() => router.back()}
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

          {/* Movie Header */}
          {movieId && (
            <div className="mb-6">
              <MovieHeader movieId={movieId} movieTitle="" />
            </div>
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

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
            <div className="container mx-auto flex justify-between">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "zh" ? "上一步" : "Previous"}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isFormValid()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {language === "zh" ? "下一步" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
