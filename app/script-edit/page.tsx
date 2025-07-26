"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "@/contexts/theme-context"

const mockScript = {
  "1": {
    id: 1,
    title: "开篇：希望的种子",
    content:
      "在这部被誉为影史最伟大的电影之一的作品中，导演弗兰克·德拉邦特用细腻的镜头语言为我们展现了一个关于希望、友谊和救赎的永恒故事。影片开场，安迪·杜弗雷恩坐在车中，手握酒瓶和手枪，这个画面暗示着绝望与毁灭的可能性。",
    duration: "45秒",
  },
  "2": {
    id: 2,
    title: "监狱生活：制度化的恐怖",
    content:
      "肖申克监狱不仅仅是一个关押罪犯的场所，更是一个制度化压迫的象征。瑞德的那句'制度化'深刻揭示了监狱系统如何逐渐剥夺人的自由意志。通过对比老布和瑞德的不同结局，影片探讨了个体在强大制度面前的挣扎与选择。",
    duration: "1分20秒",
  },
  "3": {
    id: 3,
    title: "友谊的力量：超越种族与阶层",
    content:
      "安迪与瑞德的友谊是影片的核心情感线索。两个来自不同背景的男人，在绝望的环境中建立起深厚的友谊。这种友谊超越了种族、阶层和时间的界限，成为他们在黑暗中的光明。",
    duration: "1分10秒",
  },
  "4": {
    id: 4,
    title: "救赎的真谛：内心的自由",
    content:
      "真正的救赎不是肉体的解脱，而是精神的自由。安迪通过音乐、图书馆、教育等方式，在监狱中创造了精神的绿洲。他的逃脱不仅是对肉体束缚的挣脱，更是对精神自由的追求和实现。",
    duration: "1分30秒",
  },
}

export default function ScriptEditPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState("")
  const [movieTitleEn, setMovieTitleEn] = useState("")
  const [sectionId, setSectionId] = useState("")
  const [sectionData, setSectionData] = useState<any>(null)
  const [editedContent, setEditedContent] = useState("")
  const { theme } = useTheme()

  useEffect(() => {
    const title = searchParams.get("titleCn")
    const titleEn = searchParams.get("titleEn")
    const id = searchParams.get("sectionId")

    if (title) setMovieTitle(title)
    if (titleEn) setMovieTitleEn(titleEn)
    if (id) {
      setSectionId(id)
      const section = mockScript[id]
      if (section) {
        setSectionData(section)
        setEditedContent(section.content)
      }
    }
  }, [searchParams])

  const handleSave = () => {
    // Check if user is logged in
    const isLoggedIn = false // This would come from your auth state

    if (!isLoggedIn) {
      router.push("/auth?redirect=script-edit")
    } else {
      // Save the edited content
      console.log("Saving edited content:", editedContent)
      // Navigate back to script review
      const params = new URLSearchParams()
      searchParams.forEach((value, key) => {
        if (key !== "sectionId") {
          params.set(key, value)
        }
      })
      router.push(`/script-review?${params.toString()}`)
    }
  }

  const handleCancel = () => {
    const params = new URLSearchParams()
    searchParams.forEach((value, key) => {
      if (key !== "sectionId") {
        params.set(key, value)
      }
    })
    router.push(`/script-review?${params.toString()}`)
  }

  if (!sectionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center">
        <p className="text-white text-xl">加载中...</p>
      </div>
    )
  }

  return (
    <div className={`${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"} min-h-screen`}>
      <AppLayout>
        <div className="container mx-auto px-4 py-6 pb-24">
          {/* Movie Info */}
          <div className="flex items-center space-x-4 mb-6 max-w-2xl mx-auto">
            <Image
              src={`/placeholder.svg?height=120&width=80&query=${encodeURIComponent(movieTitleEn || movieTitle)}+movie+poster`}
              alt={movieTitle}
              width={80}
              height={120}
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{movieTitle}</h2>
              <p className="text-gray-300">编辑脚本段落</p>
            </div>
          </div>

          {/* Edit Section */}
          <Card className="bg-white/10 border-white/20 max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">{sectionData.title}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {sectionData.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">编辑内容</label>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="bg-white/5 border-white/20 text-white min-h-[300px] text-base leading-relaxed"
                  placeholder="编辑脚本内容..."
                />
              </div>
              <div className="text-sm text-gray-400">字数: {editedContent.length} 字</div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto flex space-x-3">
            <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              保存修改
            </Button>
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
