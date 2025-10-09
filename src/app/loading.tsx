import { Plane } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="text-center">
        {/* Animated Plane Icon */}
        <div className="relative mb-8">
          <div className="inline-block animate-bounce">
            <Plane className="h-16 w-16 text-blue-500" />
          </div>
          {/* Flight Path Animation */}
          <div className="absolute top-1/2 left-full ml-4 w-32 h-0.5 bg-blue-300 animate-pulse"></div>
          <div className="absolute top-1/2 left-full ml-6 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-700">
            Preparing Your Flight Search
          </h2>
          <p className="text-gray-500">
            Please wait while we load the best deals for you...
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center items-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}