"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";

import { useAuth } from "@/contexts/auth-context";
import { User, LogOut, ChevronDown } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  // State to keep track of the scroll position
  const [scroll, setScroll] = useState(false);

  // State for profile dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Effect hook to add a scroll event listener
  useEffect(() => {
    // Callback function to handle the scroll event
    const handleScroll = () => {
      // Check if the current scroll position is greater than 100 pixels
      const scrollCheck = window.scrollY > 100;

      // Update the 'scroll' state only if the scroll position has changed
      if (scrollCheck !== scroll) {
        setScroll(scrollCheck);
      }
    };

    // Add the 'handleScroll' function as a scroll event listener
    document.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scroll]);

  // Effect hook to handle clicks outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push("/movie-selection");
  };



  return (
    <>
      <header
        className={
          scroll
            ? "header sticky-bar stick"
            : "header sticky-bar"
        }
      >
        <div className="container">
          <div className="main-header">
            <div className="header-logo">
              <Link className="d-flex" href="/">
                <Image
                  width={116}
                  height={36}
                  className="transition-opacity duration-300"
                  alt="Philo"
                  src={theme === 'dark' ? '/static/imgs/logo-night.svg' : '/static/imgs/logo-day.svg'}
                />
              </Link>
            </div>

            <div className="header-nav">
              <nav className="nav-main-menu d-none d-xl-block">
                <ul className="main-menu">
                  {user ? (
                    // Logged in user navigation
                    <>
                      <li>
                        <Link
                          className="color-gray-500"
                          href="/"
                        >
                          {language === 'zh' ? '主页' : 'Home'}
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="color-gray-500"
                          href="/movie-selection"
                        >
                          {language === 'zh' ? '电影选择' : 'Movies'}
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="color-gray-500"
                          href="/video-generation"
                        >
                          {language === 'zh' ? '我的视频' : 'My Videos'}
                        </Link>
                      </li>
                      {user?.is_vip && (
                        <li>
                          <Link
                            className="color-gray-500"
                            href="/my-voices"
                          >
                            {language === 'zh' ? '我的声音' : 'My Voices'}
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          className="color-gray-500"
                          href={`${process.env.NEXT_PUBLIC_BLOG_URL}/pricing`}
                        >
                          {language === 'zh' ? 'VIP' : 'VIP'}
                        </Link>
                      </li>
                    </>
                  ) : (
                    // Logged out user navigation - only Blog and Login
                    <>
                      <li>
                        <Link
                          className="color-gray-500"
                          href={`${process.env.NEXT_PUBLIC_BLOG_URL}`}
                        >
                          {language === 'zh' ? '博客' : 'Blog'}
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="color-gray-500"
                          href="/auth?redirect=movie-selection"
                        >
                          {language === 'zh' ? '登录' : 'Login'}
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </div>

            <div className="header-right text-end">
              {/* Theme Switch Button */}
              <button
                onClick={toggleTheme}
                className={`relative w-10 h-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  theme === 'dark'
                    ? 'bg-purple-600'
                    : 'bg-gray-300'
                } ${
                  theme === 'light'
                    ? 'focus:ring-offset-white'
                    : 'focus:ring-offset-gray-900'
                }`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {/* Toggle Circle */}
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                    theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                  }`}
                >
                  {/* Theme Icon */}
                  <Image
                    src={theme === 'dark' ? '/static/imgs/icons/mode.svg' : '/static/imgs/icons/mode-day.svg'}
                    alt={theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    width={20}
                    height={20}
                    className="opacity-80"
                  />
                </div>
              </button>

              {user && <NotificationBell />}

              {/* Profile Dropdown for logged in users */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ring-2 transition-all duration-200 ${
                      theme === 'light'
                        ? 'ring-gray-200 hover:ring-purple-300'
                        : 'ring-gray-600 hover:ring-purple-400'
                    }`}>
                      {user.avatar ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    } ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border py-2 z-50 ${
                      theme === 'light'
                        ? 'bg-white border-gray-200'
                        : 'bg-slate-800 border-gray-700'
                    }`}>
                      {/* Language Switch - iPhone Style */}
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                        <div className="px-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${
                              theme === 'light'
                                ? 'text-gray-700'
                                : 'text-gray-300'
                            }`}>
                              {language === 'zh' ? '语言设置' : language === 'zh-tw' ? '語言設置' : 'Language'}
                            </span>
                          </div>
                          <div className={`relative inline-flex rounded-lg p-1 ${
                            theme === 'light'
                              ? 'bg-gray-100'
                              : 'bg-gray-700'
                          }`}>
                            {/* Background slider */}
                            <div
                              className={`absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-in-out ${
                                theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-600 shadow-sm'
                              }`}
                              style={{
                                width: '33.333%',
                                left: language === 'zh' ? '4px' : language === 'en' ? '33.333%' : '66.666%',
                                transform: language === 'zh' ? 'translateX(0%)' : language === 'en' ? 'translateX(4px)' : 'translateX(8px)'
                              }}
                            />
                            {/* Language options */}
                            <button
                              onClick={() => {
                                setLanguage("zh");
                                setIsProfileOpen(false);
                              }}
                              className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                                language === 'zh'
                                  ? theme === 'light' ? 'text-gray-900' : 'text-white'
                                  : theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              汉
                            </button>
                            <button
                              onClick={() => {
                                setLanguage("en");
                                setIsProfileOpen(false);
                              }}
                              className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                                language === 'en'
                                  ? theme === 'light' ? 'text-gray-900' : 'text-white'
                                  : theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              En
                            </button>
                            <button
                              onClick={() => {
                                setLanguage("zh-tw");
                                setIsProfileOpen(false);
                              }}
                              className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                                language === 'zh-tw'
                                  ? theme === 'light' ? 'text-gray-900' : 'text-white'
                                  : theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              繁
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Navigation Items - Only show on mobile */}
                      <div className="xl:hidden border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                        <Link
                          href="/"
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            theme === 'light'
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 hover:bg-slate-700'
                          }`}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          {language === 'zh' ? '主页' : 'Home'}
                        </Link>
                        <Link
                          href="/movie-selection"
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            theme === 'light'
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 hover:bg-slate-700'
                          }`}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          {language === 'zh' ? '电影选择' : 'Movies'}
                        </Link>
                        <Link
                          href="/video-generation"
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            theme === 'light'
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 hover:bg-slate-700'
                          }`}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          {language === 'zh' ? '我的视频' : 'My Videos'}
                        </Link>
                        {user?.is_vip && (
                          <Link
                            href="/my-voices"
                            className={`flex items-center px-4 py-2 text-sm transition-colors ${
                              theme === 'light'
                                ? 'text-gray-700 hover:bg-gray-100'
                                : 'text-gray-300 hover:bg-slate-700'
                            }`}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            {language === 'zh' ? '我的声音' : 'My Voices'}
                          </Link>
                        )}
                        <Link
                          href={`${process.env.NEXT_PUBLIC_BLOG_URL}/pricing`}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            theme === 'light'
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 hover:bg-slate-700'
                          }`}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          {language === 'zh' ? 'VIP' : 'VIP'}
                        </Link>
                      </div>

                      {/* Profile Actions */}
                      <Link
                        href="/profile"
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          theme === 'light'
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-300 hover:bg-slate-700'
                        }`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        {language === 'zh' ? '个人资料' : 'Profile'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                          theme === 'light'
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {language === 'zh' ? '退出登录' : 'Logout'}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
