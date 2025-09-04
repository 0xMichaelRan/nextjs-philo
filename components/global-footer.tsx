"use client"

import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import Image from "next/image"

export function GlobalFooter() {
  const { theme } = useTheme()
  const { language } = useLanguage()

  const themeClasses = {
    bg: theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-850 border-gray-800',
    text: theme === 'light' ? 'text-gray-900' : 'text-white',
    secondaryText: theme === 'light' ? 'text-gray-600' : 'text-gray-500',
    border: theme === 'light' ? 'border-gray-200' : 'border-gray-800',
    link: theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-500 hover:text-white'
  }

  // AI Characters/Features for the middle column
  const aiFeatures = [
    { name: language === "zh" ? "哲学家分析" : "Philosopher Analysis", href: "/analysis/philosopher" },
    { name: language === "zh" ? "影评专家" : "Film Critic", href: "/analysis/critic" },
    { name: language === "zh" ? "心理学家" : "Psychologist", href: "/analysis/psychologist" },
    { name: language === "zh" ? "社会学家" : "Sociologist", href: "/analysis/sociologist" },
    { name: language === "zh" ? "文学评论家" : "Literary Critic", href: "/analysis/literary" },
    { name: language === "zh" ? "历史学家" : "Historian", href: "/analysis/historian" },
    { name: language === "zh" ? "艺术评论家" : "Art Critic", href: "/analysis/art" },
    { name: language === "zh" ? "音乐评论家" : "Music Critic", href: "/analysis/music" }
  ]

  // Split AI features into two columns
  const midPoint = Math.ceil(aiFeatures.length / 2)
  const firstColumn = aiFeatures.slice(0, midPoint)
  const secondColumn = aiFeatures.slice(midPoint)

  return (
    <footer className={`footer ${themeClasses.bg} border-t ${themeClasses.border} mt-16`}>
      <div className="container max-w-7xl mx-auto px-4">
        <div className={`footer-1 ${themeClasses.bg} ${themeClasses.border}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-12">
            {/* Company Info Column */}
            <div className="lg:col-span-1 mb-8 lg:mb-0">
              <Link href="/" className="inline-block mb-6">
                <Image
                  width={116}
                  height={36}
                  className={theme === 'light' ? 'block' : 'hidden'}
                  alt="Philo"
                  src="/assets/imgs/logo-day.png"
                />
                <Image
                  width={116}
                  height={36}
                  className={theme === 'light' ? 'hidden' : 'block'}
                  alt="Philo"
                  src="/assets/imgs/logo-night.png"
                />
              </Link>
              <div className="pr-4 lg:pr-10">
                <p className={`mb-6 text-sm ${themeClasses.secondaryText}`}>
                  {language === "zh"
                    ? "我们是一家专注于影视评论分析与内容生成的AIGC公司，致力于通过人工智能技术深度解读影视内容。我们自主研发的AI系统能够精准分析海量影评数据，捕捉观众情感倾向，并生成专业深度的影视解读内容。"
                    : "We are an AIGC company focused on film review analysis and content generation, dedicated to deeply interpreting film content through artificial intelligence technology. Our self-developed AI system can accurately analyze massive film review data, capture audience sentiment, and generate professional in-depth film interpretation content."
                  }
                </p>
              </div>
              <h6 className={`${themeClasses.text} mb-2 font-semibold`}>
                {language === "zh" ? "地址" : "Address"}
              </h6>
              <p className={`text-sm ${themeClasses.secondaryText}`}>
                33 Bishan Street 21<br />
                Singapore, SG 579801
              </p>
            </div>

            {/* AI Characters Column */}
            <div className="lg:col-span-1 mb-8 lg:mb-0">
              <h6 className={`text-lg mb-6 ${themeClasses.text} font-semibold`}>
                {language === "zh" ? "AI角色" : "AI Characters"}
              </h6>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ul className="space-y-3">
                    {firstColumn.map((feature, index) => (
                      <li key={index}>
                        <Link
                          href={feature.href}
                          className={`${themeClasses.link} hover:underline transition-colors text-sm`}
                        >
                          {feature.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul className="space-y-3">
                    {secondColumn.map((feature, index) => (
                      <li key={index}>
                        <Link
                          href={feature.href}
                          className={`${themeClasses.link} hover:underline transition-colors text-sm`}
                        >
                          {feature.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-1">
              <h4 className={`text-lg mb-6 ${themeClasses.text} font-semibold`}>
                {language === "zh" ? "订阅通讯" : "Newsletter"}
              </h4>
              <p className={`text-sm ${themeClasses.secondaryText} mb-4`}>
                {language === "zh"
                  ? "订阅我们的通讯，第一时间获取最新的AI影视分析内容和平台更新。"
                  : "Subscribe to our newsletter to be the first to receive the latest AI film analysis content and platform updates."
                }
              </p>
              <div className="form-newsletters mt-4">
                {/* Newsletter form can be added here */}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={`footer-bottom border-t ${themeClasses.border} py-6`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <div className="text-center lg:text-left">
                <p className={`text-sm ${themeClasses.text}`}>
                  © 2025 Created by{" "}
                  <Link
                    href="http://philo.com"
                    target="_blank"
                    className={`${themeClasses.link} hover:underline`}
                  >
                    philo.com
                  </Link>
                </p>
              </div>
              <div className="text-center lg:text-right">
                <div className="privacy-links mb-4 lg:mb-0">
                  <Link href="/privacy-policy" className={`text-sm ${themeClasses.link} mr-6 hover:underline`}>
                    {language === "zh" ? "隐私政策" : "Privacy Policy"}
                  </Link>
                  <Link href="/terms-conditions" className={`text-sm ${themeClasses.link} mr-6 hover:underline`}>
                    {language === "zh" ? "服务条款" : "Terms & Conditions"}
                  </Link>
                </div>
                <div className="box-socials flex justify-center lg:justify-end gap-6">
                  <Link
                    href="https://weibo.com"
                    className={`${themeClasses.link} hover:underline text-sm`}
                  >
                    {language === "zh" ? "微博" : "Weibo"}
                  </Link>
                  <Link
                    href="https://www.xiaohongshu.com"
                    className={`${themeClasses.link} hover:underline text-sm`}
                  >
                    {language === "zh" ? "小红书" : "RedNote"}
                  </Link>
                  <Link
                    href="https://www.bilibili.com"
                    className={`${themeClasses.link} hover:underline text-sm`}
                  >
                    {language === "zh" ? "哔哩哔哩" : "BiliBili"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .privacy-links {
            text-align: center;
            margin-bottom: 15px;
          }
          .box-socials {
            justify-content: center !important;
          }
        }
      `}</style>
    </footer>
  )
}
