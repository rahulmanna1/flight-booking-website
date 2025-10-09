import { Plane, Search, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="max-w-md mx-auto text-center px-6">
        {/* Flight Icon Animation */}
        <div className="relative mb-8">
          <div className="inline-block">
            <Plane className="h-24 w-24 text-blue-500 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">!</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Flight Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Looks like this flight has been cancelled or doesn't exist. 
            Don't worry, there are plenty of other destinations to explore!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/search" className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4" />
              Search Flights
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Need help finding flights?
          </p>
          <Link 
            href="/contact" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  );
}