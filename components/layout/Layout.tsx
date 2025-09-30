"use client";
import React from "react";
import Header from "./Header";

import { GlobalFooter } from "@/components/global-footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900">
        {/* Header */}
        <Header />



        {/* Main Content */}
        <main className="relative">


          {/* Page Content */}
          <div className="min-h-[calc(100vh-4rem)]">{children}</div>

          {/* Global Footer */}
          <GlobalFooter />
        </main>
      </div>

      <style jsx global>{`
        body.mobile-menu-open {
          overflow: hidden;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: 64px;
        }

        .header.stick {
          box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.05);
          animation: 700ms ease-in-out 0s normal none 1 running fadeInDown;
        }

        .main-header {
          height: 100%;
        }





        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate3d(0, -100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        /* Ensure main content starts below fixed header */
        main {
          padding-top: 64px;
        }

        /* Mobile menu styles */
        .mobile-header-wrapper-style {
          width: 80%;
          max-width: 400px;
        }

        @media (max-width: 768px) {
          .mobile-header-wrapper-style {
            width: 90%;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;
