'use client';

export default function PopularDestinationsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div className="h-6 bg-gray-300 rounded w-48"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>

        <div className="p-6">
          {/* Category tabs skeleton */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-xl w-32"></div>
            ))}
          </div>

          {/* Destinations grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center space-x-4">
                  {/* Country flag placeholder */}
                  <div className="w-14 h-14 bg-gray-300 rounded-xl flex-shrink-0"></div>
                  
                  {/* Destination info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-5 bg-gray-300 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-40"></div>
                  </div>

                  {/* Arrow */}
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}