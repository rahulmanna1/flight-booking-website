/**
 * End-to-End Test Script for Flight Booking Application
 * Tests critical workflows: airport search, flight search, recent searches
 */

const API_BASE = 'http://localhost:3000/api';

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logSuccess(message) { log('✅ ' + message, 'green'); }
function logError(message) { log('❌ ' + message, 'red'); }
function logWarning(message) { log('⚠️ ' + message, 'yellow'); }
function logInfo(message) { log('ℹ️ ' + message, 'blue'); }

// Test cases
const tests = [];

tests.push({
  name: 'Airport Search - Basic Query',
  async run() {
    const response = await fetch(`${API_BASE}/airports/search?q=new&limit=5`);
    const data = await response.json();
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${data.error}`);
    if (!data.success) throw new Error(data.error);
    if (!Array.isArray(data.airports)) throw new Error('Airports should be an array');
    if (data.airports.length === 0) throw new Error('Should find airports for "new"');
    
    // Check airport structure
    const airport = data.airports[0];
    if (!airport.iataCode || !airport.name || !airport.city || !airport.country) {
      throw new Error('Airport missing required fields');
    }
    
    logInfo(`Found ${data.airports.length} airports for "new"`);
    return { airports: data.airports.length };
  }
});

tests.push({
  name: 'Airport Search - Empty Query',
  async run() {
    const response = await fetch(`${API_BASE}/airports/search?q=`);
    const data = await response.json();
    
    if (response.status !== 400) throw new Error('Should return 400 for empty query');
    if (data.success) throw new Error('Should not succeed with empty query');
    
    return { validationWorking: true };
  }
});

tests.push({
  name: 'Airport Details - Valid Codes',
  async run() {
    const response = await fetch(`${API_BASE}/airports/details?codes=JFK,LAX,LHR`);
    const data = await response.json();
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${data.error}`);
    if (!data.success) throw new Error(data.error);
    if (!data.airports || typeof data.airports !== 'object') {
      throw new Error('Should return airports object');
    }
    
    const codes = Object.keys(data.airports);
    if (codes.length === 0) throw new Error('Should return airport details');
    
    logInfo(`Retrieved details for ${codes.length} airports: ${codes.join(', ')}`);
    return { airportDetails: codes.length };
  }
});

tests.push({
  name: 'Flight Search - Valid Request',
  async run() {
    const searchData = {
      from: 'JFK',
      to: 'LAX',
      departDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      passengers: 1,
      tripType: 'oneway'
    };
    
    const response = await fetch(`${API_BASE}/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData)
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${data.error}`);
    if (!data.success) throw new Error(data.error || 'Flight search failed');
    if (!Array.isArray(data.flights)) throw new Error('Flights should be an array');
    
    // Check flight structure
    if (data.flights.length > 0) {
      const flight = data.flights[0];
      const requiredFields = ['id', 'airline', 'flightNumber', 'origin', 'destination', 'departTime', 'arriveTime', 'price'];
      for (const field of requiredFields) {
        if (!flight[field]) throw new Error(`Flight missing required field: ${field}`);
      }
    }
    
    logInfo(`Found ${data.flights.length} flights from ${data.sources?.join(', ') || 'unknown source'}`);
    return { flights: data.flights.length, sources: data.sources };
  }
});

tests.push({
  name: 'Flight Search - Invalid Request (Same Origin/Destination)',
  async run() {
    const searchData = {
      from: 'JFK',
      to: 'JFK',
      departDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      passengers: 1,
      tripType: 'oneway'
    };
    
    const response = await fetch(`${API_BASE}/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData)
    });
    
    const data = await response.json();
    
    if (response.status !== 400) throw new Error('Should return 400 for same origin/destination');
    if (data.success) throw new Error('Should not succeed with same origin/destination');
    
    return { validationWorking: true };
  }
});

tests.push({
  name: 'Flight Search - Past Date Validation',
  async run() {
    const searchData = {
      from: 'JFK',
      to: 'LAX',
      departDate: '2023-01-01', // Past date
      passengers: 1,
      tripType: 'oneway'
    };
    
    const response = await fetch(`${API_BASE}/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData)
    });
    
    const data = await response.json();
    
    if (response.status !== 400) throw new Error('Should return 400 for past date');
    if (data.success) throw new Error('Should not succeed with past date');
    
    return { validationWorking: true };
  }
});

// Test for local storage functionality (simulated)
tests.push({
  name: 'Recent Searches Logic Test',
  async run() {
    // Test the recent searches hook logic (can't test localStorage directly in Node)
    const mockSearch = {
      from: 'JFK',
      to: 'LAX',
      departDate: '2024-12-01',
      passengers: 1,
      tripType: 'oneway',
      timestamp: Date.now()
    };
    
    // Simulate the popular routes calculation logic
    const recentSearches = [
      { ...mockSearch, to: 'LAX' },
      { ...mockSearch, to: 'LAX' },
      { ...mockSearch, to: 'SFO' },
    ];
    
    // Calculate popular routes (similar to useRecentSearches hook)
    const routeCounts = new Map();
    recentSearches.forEach(search => {
      const key = `${search.from}-${search.to}`;
      routeCounts.set(key, (routeCounts.get(key) || 0) + 1);
    });
    
    const popularRoutes = Array.from(routeCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => {
        const [from, to] = route.split('-');
        return { from, to, count };
      });
    
    if (popularRoutes.length === 0) throw new Error('Should generate popular routes');
    if (popularRoutes[0].from !== 'JFK' || popularRoutes[0].to !== 'LAX') {
      throw new Error('Most popular route should be JFK-LAX');
    }
    if (popularRoutes[0].count !== 2) throw new Error('JFK-LAX should have count of 2');
    
    logInfo(`Popular routes logic working: ${popularRoutes.length} routes calculated`);
    return { popularRoutes: popularRoutes.length };
  }
});

// Run all tests
async function runTests() {
  logInfo('Starting End-to-End Tests for Flight Booking Application');
  logInfo('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  const results = {};
  
  for (const test of tests) {
    try {
      logInfo(`Running: ${test.name}`);
      const result = await test.run();
      logSuccess(`PASS: ${test.name}`);
      results[test.name] = { status: 'PASS', result };
      passed++;
    } catch (error) {
      logError(`FAIL: ${test.name} - ${error.message}`);
      results[test.name] = { status: 'FAIL', error: error.message };
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  logInfo('=' .repeat(60));
  logInfo('Test Summary');
  logInfo('=' .repeat(60));
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  logInfo(`Total: ${tests.length}`);
  
  if (failed === 0) {
    logSuccess('🎉 All tests passed! Your application is working correctly.');
  } else {
    logWarning(`⚠️  ${failed} test(s) failed. Please review the errors above.`);
  }
  
  return { passed, failed, total: tests.length, results };
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/airports/search?q=test&limit=1`);
    return response.status !== 404; // Even if it fails, 404 means server is not running
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  logInfo('Checking if development server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    logError('❌ Development server is not running or not responding.');
    logInfo('Please start the server with: npm run dev');
    process.exit(1);
  }
  
  logSuccess('✅ Server is running at http://localhost:3000');
  console.log('');
  
  const results = await runTests();
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});