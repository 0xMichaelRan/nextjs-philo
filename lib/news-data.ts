export interface NewsItem {
  id: number
  url: string
  title: string
  titleEn: string
  tag: string
  tagEn: string
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
        url: "https://example.com/svip-announcement",
        title: "新增SVIP会员等级",
        titleEn: "New SVIP Membership Tier",
        tag: "产品更新",
        tagEn: "Product Update",
        summary: "我们推出了全新的SVIP会员等级，享受更多专属特权和高级功能，包括无限视频生成、优先处理队列、专属客服支持等。",
        summaryEn: "We've launched a new SVIP membership tier with exclusive benefits and advanced features, including unlimited video generation, priority processing queue, and dedicated customer support.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
        publishedAt: "2025-01-19T10:00:00Z",
        featured: true
      },
      {
        id: 2,
        url: "https://example.com/ai-upgrade",
        title: "AI分析引擎升级",
        titleEn: "AI Analysis Engine Upgrade",
        tag: "技术更新",
        tagEn: "Tech Update",
        summary: "我们的AI分析引擎已全面升级，采用最新的深度学习技术，生成的视频质量更高，分析更加深入准确。",
        summaryEn: "Our AI analysis engine has been comprehensively upgraded with the latest deep learning technology for higher quality videos and more accurate analysis.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
        publishedAt: "2025-01-18T16:30:00Z"
      },
      {
        id: 3,
        url: "https://example.com/spring-festival-event",
        title: "春节活动预告",
        titleEn: "Spring Festival Event Preview",
        tag: "活动预告",
        tagEn: "Event Preview",
        summary: "春节期间将有特别优惠活动，VIP会员享受额外折扣，还有限时免费试用等精彩活动，敬请期待！",
        summaryEn: "Special offers coming during Spring Festival with extra discounts for VIP members and limited-time free trials. Stay tuned for exciting events!",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
        publishedAt: "2025-01-17T09:15:00Z"
      },
      {
        id: 4,
        url: "https://example.com/voice-synthesis-update",
        title: "语音合成技术优化",
        titleEn: "Voice Synthesis Technology Optimization",
        tag: "技术更新",
        tagEn: "Tech Update",
        summary: "全新的语音合成算法让生成的声音更加自然流畅，支持更多语言和方言，为用户提供更好的音频体验。",
        summaryEn: "New voice synthesis algorithms make generated voices more natural and fluent, supporting more languages and dialects for better audio experience.",
        image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=200&fit=crop",
        publishedAt: "2025-01-15T14:20:00Z"
      },
      {
        id: 5,
        url: "https://example.com/mobile-app-launch",
        title: "移动端应用正式发布",
        titleEn: "Mobile App Official Launch",
        tag: "产品更新",
        tagEn: "Product Update",
        summary: "我们的移动端应用现已在各大应用商店上线，支持iOS和Android系统，随时随地享受AI视频生成服务。",
        summaryEn: "Our mobile app is now available on major app stores, supporting iOS and Android systems for AI video generation services anytime, anywhere.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
        publishedAt: "2025-01-12T11:45:00Z"
      },
      {
        id: 6,
        url: "https://example.com/collaboration-features",
        title: "团队协作功能上线",
        titleEn: "Team Collaboration Features Launch",
        tag: "功能更新",
        tagEn: "Feature Update",
        summary: "新增团队协作功能，支持多人共同编辑项目，实时同步进度，提高团队工作效率。",
        summaryEn: "New team collaboration features allow multiple users to edit projects together with real-time progress synchronization for improved team efficiency.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
        publishedAt: "2025-01-10T08:30:00Z"
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

  public getNewsByTag(tag: string): NewsItem[] {
    return this.newsItems.filter(item => 
      item.tag === tag || item.tagEn === tag
    )
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
               item.summary.toLowerCase().includes(searchTerm) ||
               item.tag.toLowerCase().includes(searchTerm)
      } else {
        return item.titleEn.toLowerCase().includes(searchTerm) ||
               item.summaryEn.toLowerCase().includes(searchTerm) ||
               item.tagEn.toLowerCase().includes(searchTerm)
      }
    })
  }
}

// Export singleton instance
export const newsDataManager = NewsDataManager.getInstance()
