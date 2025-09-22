'use client';

export default function AirportSearchSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 z-50 max-h-80 overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
        
        {/* Airport results skeleton */}
        <div className="p-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex items-center p-4 border-l-4 border-transparent"
            >
              {/* Country flag */}
              <div className="mr-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
              </div>
              
              {/* Airport info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-5 bg-gray-300 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-32"></div>
              </div>
              
              {/* Arrow */}
              <div className="ml-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}