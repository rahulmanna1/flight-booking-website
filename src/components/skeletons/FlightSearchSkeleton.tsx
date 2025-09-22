'use client';

export default function FlightSearchSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Search form skeleton */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto mb-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-6">
          <div className="flex justify-center">
            <div className="bg-white/20 rounded-lg p-1 w-64 h-12"></div>
          </div>
        </div>
        
        {/* Form content */}
        <div className="p-8 space-y-6">
          {/* Airport inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          
          {/* Date and details section */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Search button */}
          <div className="pt-2">
            <div className="h-16 bg-gray-300 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}