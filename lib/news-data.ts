export interface NewsItem {
  id: number
  url: string
  title: string
  titleEn: string
  summary: string
  summaryEn: string
  image: string
  publishedAt: string
  featured?: boolean
}

export class NewsDataManager {
  private static instance: NewsDataManager
  private newsItems: NewsItem[] = []

  private constructor() {
    this.initializeNewsData()
  }

  public static getInstance(): NewsDataManager {
    if (!NewsDataManager.instance) {
      NewsDataManager.instance = new NewsDataManager()
    }
    return NewsDataManager.instance
  }

  private initializeNewsData() {
    this.newsItems = [
      {
        id: 1,
        url: `${process.env.NEXT_PUBLIC_BLOG_URL}/blog/creative-writing-with-ai`,
        title: "2025年AI技术突破：从大模型到多模态智能",
        titleEn: "2025 AI Technology Breakthrough: From Large Models to Multimodal Intelligence",
        summary: "回顾2025年AI领域的重大突破，从GPT-5的发布到多模态AI的普及，探讨这些技术进步如何重塑我们的工作和生活方式。",
        summaryEn: "Review the major breakthroughs in AI in 2025, from the release of GPT-5 to the popularization of multimodal AI, exploring how these technological advances reshape our work and lifestyle.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
        publishedAt: "2025-01-20T10:00:00Z",
        featured: true
      },
      {
        id: 2,
        url: `${process.env.NEXT_PUBLIC_BLOG_URL}/blog/ai-writing-assistant-revolution`,
        title: "测试新图片管理系统",
        titleEn: "Testing New Image Management System",
        summary: "这是一篇测试文章，用于验证新的图片管理系统是否正常工作。文章包含了多种图片引用方式。",
        summaryEn: "This is a test article to verify whether the new image management system works properly. The article contains various image reference methods.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
        publishedAt: "2025-08-15T16:30:00Z"
      }
    ]
  }

  public getAllNews(): NewsItem[] {
    return [...this.newsItems].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }

  public getFeaturedNews(): NewsItem[] {
    return this.newsItems.filter(item => item.featured)
  }



  public getNewsById(id: number): NewsItem | undefined {
    return this.newsItems.find(item => item.id === id)
  }

  public addNews(newsItem: Omit<NewsItem, 'id'>): NewsItem {
    const newItem: NewsItem = {
      ...newsItem,
      id: Math.max(...this.newsItems.map(item => item.id)) + 1
    }
    this.newsItems.unshift(newItem)
    return newItem
  }

  public updateNews(id: number, updates: Partial<NewsItem>): NewsItem | null {
    const index = this.newsItems.findIndex(item => item.id === id)
    if (index === -1) return null
    
    this.newsItems[index] = { ...this.newsItems[index], ...updates }
    return this.newsItems[index]
  }

  public deleteNews(id: number): boolean {
    const index = this.newsItems.findIndex(item => item.id === id)
    if (index === -1) return false
    
    this.newsItems.splice(index, 1)
    return true
  }

  public getRecentNews(limit: number = 5): NewsItem[] {
    return this.getAllNews().slice(0, limit)
  }

  public searchNews(query: string, language: 'zh' | 'en' = 'zh'): NewsItem[] {
    const searchTerm = query.toLowerCase()
    return this.newsItems.filter(item => {
      if (language === 'zh') {
        return item.title.toLowerCase().includes(searchTerm) ||
               item.summary.toLowerCase().includes(searchTerm)
      } else {
        return item.titleEn.toLowerCase().includes(searchTerm) ||
               item.summaryEn.toLowerCase().includes(searchTerm)
      }
    })
  }
}

// Export singleton instance
export const newsDataManager = NewsDataManager.getInstance()
