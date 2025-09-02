"use client"

import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { ExternalLink, Mail, FileText, Shield, BookOpen, MessageCircle } from "lucide-react"

export function GlobalFooter() {
  const { theme } = useTheme()
  const { language } = useLanguage()

  const themeClasses = {
    bg: theme === 'light' ? 'bg-gray-50' : 'bg-gray-900',
    text: theme === 'light' ? 'text-gray-900' : 'text-white',
    secondaryText: theme === 'light' ? 'text-gray-600' : 'text-gray-400',
    border: theme === 'light' ? 'border-gray-200' : 'border-gray-700',
    link: theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300'
  }

  const footerLinks = {
    company: {
      title: language === "zh" ? "公司" : "Company",
      links: [
        {
          name: language === "zh" ? "关于我们" : "About Us",
          href: "/about",
          icon: <FileText className="w-4 h-4" />
        },
        {
          name: language === "zh" ? "联系我们" : "Contact Us", 
          href: "/contact",
          icon: <Mail className="w-4 h-4" />
        },
        {
          name: language === "zh" ? "官方博客" : "Official Blog",
          href: "https://blog.philo.ai",
          icon: <BookOpen className="w-4 h-4" />,
          external: true
        }
      ]
    },
    legal: {
      title: language === "zh" ? "法律" : "Legal",
      links: [
        {
          name: language === "zh" ? "服务条款" : "Terms & Conditions",
          href: "/terms",
          icon: <Shield className="w-4 h-4" />
        },
        {
          name: language === "zh" ? "隐私政策" : "Privacy Policy",
          href: "/privacy",
          icon: <Shield className="w-4 h-4" />
        },
        {
          name: language === "zh" ? "用户协议" : "User Agreement",
          href: "/agreement",
          icon: <FileText className="w-4 h-4" />
        }
      ]
    },
    support: {
      title: language === "zh" ? "支持" : "Support",
      links: [
        {
          name: language === "zh" ? "帮助文档" : "Documentation",
          href: "/docs",
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          name: language === "zh" ? "常见问题" : "FAQ",
          href: "/faq",
          icon: <MessageCircle className="w-4 h-4" />
        },
        {
          name: language === "zh" ? "技术支持" : "Technical Support",
          href: "/support",
          icon: <Mail className="w-4 h-4" />
        }
      ]
    },
    social: {
      title: language === "zh" ? "社交媒体" : "Social Media",
      links: [
        {
          name: language === "zh" ? "官方微博" : "Official Weibo",
          href: "https://weibo.com/philo",
          icon: <ExternalLink className="w-4 h-4" />,
          external: true
        },
        {
          name: language === "zh" ? "抖音官方号" : "Official TikTok",
          href: "https://tiktok.com/@philo",
          icon: <ExternalLink className="w-4 h-4" />,
          external: true
        },
        {
          name: language === "zh" ? "微信公众号" : "WeChat Official",
          href: "/wechat-qr",
          icon: <MessageCircle className="w-4 h-4" />
        }
      ]
    }
  }

  const sponsors = [
    {
      name: "OpenAI",
      href: "https://openai.com",
      logo: "/sponsors/openai-logo.png"
    },
    {
      name: "Anthropic",
      href: "https://anthropic.com", 
      logo: "/sponsors/anthropic-logo.png"
    },
    {
      name: "Qiniu Cloud",
      href: "https://qiniu.com",
      logo: "/sponsors/qiniu-logo.png"
    }
  ]

  return (
    <footer className={`${themeClasses.bg} ${themeClasses.border} border-t mt-16`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className={`font-semibold ${themeClasses.text} mb-4`}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : "_self"}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className={`flex items-center gap-2 ${themeClasses.link} hover:underline transition-colors`}
                    >
                      {link.icon}
                      {link.name}
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sponsors Section */}
        <div className={`border-t ${themeClasses.border} pt-8 mb-8`}>
          <h3 className={`font-semibold ${themeClasses.text} mb-4 text-center`}>
            {language === "zh" ? "技术合作伙伴" : "Technology Partners"}
          </h3>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {sponsors.map((sponsor, index) => (
              <a
                key={index}
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="h-8 w-auto grayscale hover:grayscale-0 transition-all"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <span className={`hidden ${themeClasses.secondaryText} text-sm`}>
                  {sponsor.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${themeClasses.border} pt-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div className={`${themeClasses.secondaryText} text-sm text-center md:text-left`}>
            <p>
              © 2024 Philo AI. {language === "zh" ? "保留所有权利。" : "All rights reserved."}
            </p>
            <p className="mt-1">
              {language === "zh" 
                ? "基于人工智能的电影分析视频生成平台" 
                : "AI-powered movie analysis video generation platform"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`${themeClasses.secondaryText} text-xs`}>
              {language === "zh" ? "版本" : "Version"} 1.0.0
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`${themeClasses.secondaryText} text-xs`}>
                {language === "zh" ? "服务正常" : "Service Online"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
