'use client';

import { useState } from 'react';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
}

export default function SearchDebug() {
  const [results, setResults] = useState<TestResult[]>([]);

  const testEndpoint = async (endpoint: string, data?: any) => {
    const testResult: TestResult = { endpoint, status: 'loading' };
    setResults(prev => [...prev, testResult]);

    try {
      const response = await fetch(endpoint, {
        method: data ? 'POST' : 'GET',
        headers: data ? { 'Content-Type': 'application/json' } : {},
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json();
      
      testResult.status = response.ok ? 'success' : 'error';
      testResult.data = responseData;
      
      if (!response.ok) {
        testResult.error = responseData.error || 'Unknown error';
      }
    } catch (error: any) {
      testResult.status = 'error';
      testResult.error = error.message;
    }

    setResults(prev => 
      prev.map(r => r === testResult ? testResult : r)
    );
  };

  const runTests = async () => {
    setResults([]);
    
    // Test 1: Global airport search (India)
    await testEndpoint('/api/airports/search?q=kolkata&limit=5');
    
    // Test 2: Global airport search (Europe)
    await testEndpoint('/api/airports/search?q=london&limit=5');
    
    // Test 3: Airport details API
    await testEndpoint('/api/airports/details?codes=CCU,BOM,LHR,JFK,SIN');
    
    // Test 4: Flight search - India domestic
    await testEndpoint('/api/flights/search', {
      from: 'CCU',
      to: 'BOM',
      departDate: '2024-12-25',
      passengers: 1,
      tripType: 'oneway',
      travelClass: 'economy'
    });
    
    // Test 5: Flight search - International route
    await testEndpoint('/api/flights/search', {
      from: 'LHR',
      to: 'SIN',
      departDate: '2024-12-25',
      passengers: 1,
      tripType: 'oneway',
      travelClass: 'economy'
    });
    
    // Test 6: Flight search - Random global route
    await testEndpoint('/api/flights/search', {
      from: 'SYD',
      to: 'CAI',
      departDate: '2024-12-25',
      passengers: 1,
      tripType: 'oneway',
      travelClass: 'economy'
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Functionality Debug</h2>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700"
        >
          Run Tests
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{result.endpoint}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                result.status === 'success' ? 'bg-green-100 text-green-800' :
                result.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {result.status}
              </span>
            </div>
            
            {result.error && (
              <div className="bg-red-50 text-red-800 p-2 rounded mb-2">
                <strong>Error:</strong> {result.error}
              </div>
            )}
            
            {result.data && (
              <div className="bg-gray-50 p-2 rounded">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}