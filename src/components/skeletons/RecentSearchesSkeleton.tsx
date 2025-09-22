'use client';

export default function RecentSearchesSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Recent Searches Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-gray-100 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="h-3 w-40 bg-gray-200 rounded mt-2"></div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-12 bg-gray-200 rounded"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="border-t pt-4">
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-8 bg-gray-100 border border-gray-200 rounded-lg animate-pulse"
              style={{ width: `${80 + (index % 3) * 20}px` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className="border-t pt-4 mt-4">
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg animate-pulse"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="h-5 w-8 bg-gray-200 rounded"></div>
                <div className="h-4 w-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}