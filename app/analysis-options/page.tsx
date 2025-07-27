"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"

const analysisOptions = {
  character: [
    { id: "philosopher", label: "哲学家" },
    { id: "religious", label: "宗教学者" },
    { id: "teacher", label: "大学教师" },
    { id: "critic", label: "影评人" },
  ],
  tone: [
    { id: "academic", label: "学术严谨" },
    { id: "casual", label: "轻松幽默" },
    { id: "philosophical", label: "哲学思辨" },
    { id: "emotional", label: "情感共鸣" },
  ],
  style: [
    { id: "narrative", label: "叙述式" },
    { id: "thematic", label: "主题式" },
    { id: "character", label: "人物式" },
    { id: "technical", label: "技法式" },
  ],
  length: [
    { id: "short", label: "简短版", duration: "3-5分钟" },
    { id: "medium", label: "标准版", duration: "8-12分钟" },
    { id: "long", label: "深度版", duration: "15-20分钟" },
  ],
  focus: [
    { id: "plot", label: "情节结构" },
    { id: "characters", label: "人物塑造" },
    { id: "themes", label: "主题思想" },
    { id: "cinematography", label: "摄影技法" },
    { id: "symbolism", label: "象征意义" },
    { id: "cultural", label: "文化背景" },
  ],
}

const explanations = {
  character: {
    philosopher: "从哲学角度深入思考电影的意义和价值。",
    religious: "从宗教和精神层面解读电影的深层含义。",
    teacher: "以教育者的视角分析电影的艺术和文化价值。",
    critic: "以专业影评人的角度评析电影的各个方面。",
  },
  tone: {
    academic: "适合学术讨论和分析。",
    casual: "适合轻松幽默的对话。",
    philosophical: "适合进行哲学思考和讨论。",
    emotional: "适合表达情感和共鸣。",
  },
  style: {
    narrative: "以叙述的方式进行分析。",
    thematic: "以主题的方式进行分析。",
    character: "以人物的方式进行分析。",
    technical: "以技法的方式进行分析。",
  },
  length: {
    short: "适合快速了解。",
    medium: "适合详细分析。",
    long: "适合深入探讨。",
  },
}

export default function AnalysisOptionsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState("")
  const [movieTitleEn, setMovieTitleEn] = useState("")
  const [movieId, setMovieId] = useState("")
  const [selectedOptions, setSelectedOptions] = useState({
    character: "",
    tone: "",
    style: "",
    length: "",
    focus: "",
    customRequest: "",
  })
  const [selectedExplanations, setSelectedExplanations] = useState<{ [key: string]: string }>({})

  const { theme } = useTheme()

  const getTextClasses = () => {
    if (theme === "light") {
      return "text-gray-800"
    }
    return "text-white"
  }

  const getCardClasses = () => {
    if (theme === "light") {
      return "bg-white/80 border-gray-200/50"
    }
    return "bg-white/10 border-white/20"
  }

  const getBackgroundClasses = () => {
    if (theme === "light") {
      return "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
    }
    return "bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900"
  }

  useEffect(() => {
    const title = searchParams.get("titleCn")
    const titleEn = searchParams.get("titleEn")
    const id = searchParams.get("movieId")

    if (title) setMovieTitle(decodeURIComponent(title))
    if (titleEn) setMovieTitleEn(decodeURIComponent(titleEn))
    if (id) setMovieId(id)
  }, [searchParams])

  const handleOptionChange = (category: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleLuckyChoice = () => {
    const randomOptions = {
      character: analysisOptions.character[Math.floor(Math.random() * analysisOptions.character.length)].id,
      tone: analysisOptions.tone[Math.floor(Math.random() * analysisOptions.tone.length)].id,
      style: analysisOptions.style[Math.floor(Math.random() * analysisOptions.style.length)].id,
      length: analysisOptions.length[Math.floor(Math.random() * analysisOptions.length.length)].id,
    }

    setSelectedOptions(randomOptions)

    // Navigate to voice selection after a brief delay
    setTimeout(() => {
      const params = new URLSearchParams()
      params.set("movieId", movieId)
      params.set("titleCn", movieTitle)
      params.set("titleEn", movieTitleEn)
      Object.entries(randomOptions).forEach(([key, value]) => {
        params.set(key, value)
      })
      router.push(`/voice-selection?${params.toString()}`)
    }, 1000)
  }

  const isAllSelected = Object.values(selectedOptions).every((option, index) => {
    // Custom request is optional, so exclude it from required validation
    if (index === 5) return true // customRequest is at index 5
    return option !== ""
  })

  const handleNext = () => {
    const params = new URLSearchParams()
    params.set("movieId", movieId)
    params.set("titleCn", movieTitle)
    params.set("titleEn", movieTitleEn)
    Object.entries(selectedOptions).forEach(([key, value]) => {
      params.set(key, value)
    })
    router.push(`/voice-selection?${params.toString()}`)
  }

  return (
    <div className={getBackgroundClasses()}>
      <AppLayout title="分析选项">
        <div className="container mx-auto px-6 py-8 pb-24">
          {/* Movie Info */}
          <div className="flex items-center space-x-4 mb-12 max-w-2xl mx-auto">
            <Image
              src={`/placeholder.svg?height=120&width=80&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+poster`}
              alt={movieTitle}
              width={80}
              height={120}
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div>
              <h2 className={`${getTextClasses()} text-xl font-bold`}>{movieTitle}</h2>
              <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>请选择您的分析偏好</p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Character Selection */}
            <Card className={getCardClasses()}>
              <CardHeader>
                <CardTitle className={`${getTextClasses()} flex items-center`}>
                  分析角色
                  <Badge variant="secondary" className="ml-2">
                    必选
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedOptions.character}
                  onValueChange={(value) => {
                    handleOptionChange("character", value)
                    setSelectedExplanations((prev) => ({
                      ...prev,
                      character: explanations.character[value] || "",
                    }))
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisOptions.character.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                          selectedOptions.character === option.id
                            ? "bg-white/20 border-rose-500"
                            : "hover:bg-white/5 border-transparent"
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={`character-${option.id}`} className="text-rose-500" />
                        <Label htmlFor={`character-${option.id}`} className="flex-1 cursor-pointer">
                          <div className={`${getTextClasses()} font-medium text-lg`}>{option.label}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            {selectedExplanations.character && (
              <div className="mt-4 p-4 bg-rose-900/50 rounded-lg border border-rose-500/30">
                <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm leading-relaxed`}>
                  {selectedExplanations.character}
                </p>
              </div>
            )}

            {/* Tone */}
            <Card className={getCardClasses()}>
              <CardHeader>
                <CardTitle className={`${getTextClasses()} flex items-center`}>
                  叙述语调
                  <Badge variant="secondary" className="ml-2">
                    必选
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedOptions.tone}
                  onValueChange={(value) => {
                    handleOptionChange("tone", value)
                    setSelectedExplanations((prev) => ({
                      ...prev,
                      tone: explanations.tone[value] || "",
                    }))
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisOptions.tone.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                          selectedOptions.tone === option.id
                            ? "bg-white/20 border-cyan-500"
                            : "hover:bg-white/5 border-transparent"
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={`tone-${option.id}`} className="text-cyan-500" />
                        <Label htmlFor={`tone-${option.id}`} className="flex-1 cursor-pointer">
                          <div className={`${getTextClasses()} font-medium text-lg`}>{option.label}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            {selectedExplanations.tone && (
              <div className="mt-4 p-4 bg-cyan-900/50 rounded-lg border border-cyan-500/30">
                <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm leading-relaxed`}>
                  {selectedExplanations.tone}
                </p>
              </div>
            )}

            {/* Style */}
            <Card className={getCardClasses()}>
              <CardHeader>
                <CardTitle className={`${getTextClasses()} flex items-center`}>
                  分析风格
                  <Badge variant="secondary" className="ml-2">
                    必选
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedOptions.style}
                  onValueChange={(value) => {
                    handleOptionChange("style", value)
                    setSelectedExplanations((prev) => ({
                      ...prev,
                      style: explanations.style[value] || "",
                    }))
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisOptions.style.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                          selectedOptions.style === option.id
                            ? "bg-white/20 border-teal-500"
                            : "hover:bg-white/5 border-transparent"
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={`style-${option.id}`} className="text-teal-500" />
                        <Label htmlFor={`style-${option.id}`} className="flex-1 cursor-pointer">
                          <div className={`${getTextClasses()} font-medium text-lg`}>{option.label}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            {selectedExplanations.style && (
              <div className="mt-4 p-4 bg-teal-900/50 rounded-lg border border-teal-500/30">
                <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm leading-relaxed`}>
                  {selectedExplanations.style}
                </p>
              </div>
            )}

            {/* Length */}
            <Card className={getCardClasses()}>
              <CardHeader>
                <CardTitle className={`${getTextClasses()} flex items-center`}>
                  视频长度
                  <Badge variant="secondary" className="ml-2">
                    必选
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedOptions.length}
                  onValueChange={(value) => {
                    handleOptionChange("length", value)
                    setSelectedExplanations((prev) => ({
                      ...prev,
                      length: explanations.length[value] || "",
                    }))
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysisOptions.length.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                          selectedOptions.length === option.id
                            ? "bg-white/20 border-emerald-500"
                            : "hover:bg-white/5 border-transparent"
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={`length-${option.id}`} className="text-emerald-500" />
                        <Label htmlFor={`length-${option.id}`} className="flex-1 cursor-pointer">
                          <div className={`${getTextClasses()} font-medium text-lg`}>{option.label}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {option.duration}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            {selectedExplanations.length && (
              <div className="mt-4 p-4 bg-emerald-900/50 rounded-lg border border-emerald-500/30">
                <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm leading-relaxed`}>
                  {selectedExplanations.length}
                </p>
              </div>
            )}

            {/* Focus Area */}
            <Card className={getCardClasses()}>
              <CardHeader>
                <CardTitle className={`${getTextClasses()} flex items-center`}>
                  重点关注
                  <Badge variant="secondary" className="ml-2">
                    必选
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedOptions.focus} onValueChange={(value) => handleOptionChange("focus", value)}>
                  <SelectTrigger
                    className={`w-full ${theme === "light" ? "bg-white/80 border-gray-200/50" : "bg-white/10 border-white/20"}`}
                  >
                    <SelectValue placeholder="选择分析重点..." />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisOptions.focus.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOptions.focus && (
                  <div className="mt-4 p-4 bg-purple-900/50 rounded-lg border border-purple-500/30">
                    <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm leading-relaxed`}>
                      已选择重点关注：{analysisOptions.focus.find((f) => f.id === selectedOptions.focus)?.label}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Request */}
            <Card className={getCardClasses()}>
              <CardHeader>
                <CardTitle className={`${getTextClasses()} flex items-center`}>
                  自定义要求
                  <Badge variant="outline" className="ml-2">
                    可选
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="请描述您希望在分析中特别关注的内容或角度..."
                  value={selectedOptions.customRequest}
                  onChange={(e) => handleOptionChange("customRequest", e.target.value)}
                  className={`min-h-[100px] ${theme === "light" ? "bg-white/80 border-gray-200/50" : "bg-white/10 border-white/20"}`}
                />
                {selectedOptions.customRequest && (
                  <div className="mt-4 p-4 bg-orange-900/50 rounded-lg border border-orange-500/30">
                    <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"} text-sm leading-relaxed`}>
                      您的自定义要求将被纳入分析考虑
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
            <div className="container mx-auto flex space-x-3">
              <Button
                onClick={handleLuckyChoice}
                variant="outline"
                className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
                size="lg"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                手气不错
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isAllSelected}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                size="lg"
              >
                选择配音
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
