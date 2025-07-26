import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function NotificationsLoading() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div>
            <Skeleton className="w-32 h-8 mb-2" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="w-24 h-10" />
          <Skeleton className="w-20 h-10" />
        </div>
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex space-x-4 mb-6">
        <Skeleton className="w-20 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>

      {/* Notifications List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-white/80 border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="w-48 h-6" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-12 h-5" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-3/4 h-4 mb-4" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-20 h-8" />
                    <Skeleton className="w-16 h-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
