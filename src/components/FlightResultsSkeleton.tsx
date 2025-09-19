export default function FlightResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          {/* Airline and Flight Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Airline Logo Placeholder */}
              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              <div>
                <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-7 bg-gray-300 rounded w-24 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          {/* Flight Times */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                {/* Departure */}
                <div>
                  <div className="h-6 bg-gray-300 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                
                {/* Duration Bar */}
                <div className="flex-1 px-4">
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                  <div className="relative">
                    <div className="h-1 bg-gray-200 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto mt-2"></div>
                </div>
                
                {/* Arrival */}
                <div className="text-right">
                  <div className="h-6 bg-gray-300 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-4">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-10 bg-blue-200 rounded-md w-28"></div>
          </div>
        </div>
      ))}
    </div>
  );
}