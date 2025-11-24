'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthTest() {
  const { user, isAdmin, isSuperAdmin, token, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Auth State Debug</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
          </div>
          
          <div>
            <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>Is Super Admin:</strong> {isSuperAdmin ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>If not logged in, go to <a href="/login" className="text-blue-600 hover:underline">/login</a></li>
            <li>Login with: admin@flightbooker.com</li>
            <li>Check if isAdmin shows "Yes"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
