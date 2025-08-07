import { AppLayout } from "@/components/app-layout"

export default function Loading() {
  return (
    <AppLayout title="录制专属声音">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 dark:bg-white/10 border border-gray-200/50 dark:border-white/20 rounded-lg p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <div className="w-8 h-8 bg-white rounded-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  加载中...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  正在准备录音环境
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
