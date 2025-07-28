import { useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'

interface PageTitleConfig {
  [key: string]: {
    zh: string
    en: string
  }
}

const pageTitles: PageTitleConfig = {
  // Home and main pages
  home: {
    zh: "电影哲学家 - AI驱动的电影分析视频生成器",
    en: "Movie Philosopher - AI-Powered Movie Analysis Video Generator"
  },
  
  // Authentication
  auth: {
    zh: "登录注册 - 电影哲学家",
    en: "Login & Register - Movie Philosopher"
  },
  resetPassword: {
    zh: "重置密码 - 电影哲学家",
    en: "Reset Password - Movie Philosopher"
  },
  paymentSuccess: {
    zh: "支付成功 - 电影哲学家",
    en: "Payment Successful - Movie Philosopher"
  },
  
  // Movie selection and generation
  movieSelection: {
    zh: "选择电影 - 电影哲学家",
    en: "Select Movie - Movie Philosopher"
  },
  voiceSelection: {
    zh: "选择配音 - 电影哲学家",
    en: "Voice Selection - Movie Philosopher"
  },
  customVoice: {
    zh: "自定义配音 - 电影哲学家",
    en: "Custom Voice - Movie Philosopher"
  },
  scriptReview: {
    zh: "脚本预览 - 电影哲学家",
    en: "Script Review - Movie Philosopher"
  },
  videoGeneration: {
    zh: "我的视频 - 电影哲学家",
    en: "My Videos - Movie Philosopher"
  },
  
  // User pages
  profile: {
    zh: "个人中心 - 电影哲学家",
    en: "Profile - Movie Philosopher"
  },
  profileBasics: {
    zh: "基本信息 - 个人中心 - 电影哲学家",
    en: "Basic Info - Profile - Movie Philosopher"
  },
  profilePreferences: {
    zh: "偏好设置 - 个人中心 - 电影哲学家",
    en: "Preferences - Profile - Movie Philosopher"
  },
  profileBilling: {
    zh: "账单管理 - 个人中心 - 电影哲学家",
    en: "Billing - Profile - Movie Philosopher"
  },
  profileNotifications: {
    zh: "通知设置 - 个人中心 - 电影哲学家",
    en: "Notifications - Profile - Movie Philosopher"
  },
  
  // Payment and VIP
  payment: {
    zh: "支付订阅 - 电影哲学家",
    en: "Payment & Subscription - Movie Philosopher"
  },
  paymentSuccess: {
    zh: "支付成功 - 电影哲学家",
    en: "Payment Success - Movie Philosopher"
  },
  paymentFailed: {
    zh: "支付失败 - 电影哲学家",
    en: "Payment Failed - Movie Philosopher"
  },
  vip: {
    zh: "VIP会员 - 电影哲学家",
    en: "VIP Membership - Movie Philosopher"
  },
  
  // Notifications
  notifications: {
    zh: "通知中心 - 电影哲学家",
    en: "Notification Center - Movie Philosopher"
  },
  
  // Legal and info pages
  terms: {
    zh: "服务条款 - 电影哲学家",
    en: "Terms of Service - Movie Philosopher"
  },
  privacy: {
    zh: "隐私政策 - 电影哲学家",
    en: "Privacy Policy - Movie Philosopher"
  },
  
  // Error pages
  notFound: {
    zh: "页面未找到 - 电影哲学家",
    en: "Page Not Found - Movie Philosopher"
  },
  error: {
    zh: "出错了 - 电影哲学家",
    en: "Error - Movie Philosopher"
  }
}

export function usePageTitle(pageKey: string, customTitle?: string) {
  const { language } = useLanguage()
  
  useEffect(() => {
    let title: string
    
    if (customTitle) {
      // Use custom title with brand suffix
      const brandSuffix = language === 'zh' ? ' - 电影哲学家' : ' - Movie Philosopher'
      title = customTitle + brandSuffix
    } else if (pageTitles[pageKey]) {
      // Use predefined title
      title = pageTitles[pageKey][language]
    } else {
      // Fallback to default title
      title = pageTitles.home[language]
    }
    
    document.title = title
  }, [pageKey, customTitle, language])
}

export default usePageTitle
