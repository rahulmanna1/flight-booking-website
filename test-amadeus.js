// Quick test script to verify Amadeus API credentials
const Amadeus = require('amadeus');

const clientId = process.env.AMADEUS_CLIENT_ID || 'UvbaMGpGpzGtSMwS2j4XOPcGw96mN2PF';
const clientSecret = process.env.AMADEUS_CLIENT_SECRET || '6gTerTKP9kdDGDWI';

console.log('🔍 Testing Amadeus API credentials...\n');
console.log('Client ID:', clientId);
console.log('Environment: test\n');

const amadeus = new Amadeus({
  clientId: clientId,
  clientSecret: clientSecret,
  hostname: 'test'
});

// Test 1: Simple flight search
async function testFlightSearch() {
  try {
    console.log('📡 Testing flight search...');
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'JFK',
      destinationLocationCode: 'LAX',
      departureDate: '2025-12-01',
      adults: '1'
    });
    
    console.log('✅ SUCCESS! API is working!');
    console.log(`Found ${response.data.length} flights`);
    console.log('\nSample flight:');
    if (response.data[0]) {
      const flight = response.data[0];
      console.log(`- Price: ${flight.price.total} ${flight.price.currency}`);
      console.log(`- Airline: ${flight.validatingAirlineCodes[0]}`);
    }
    return true;
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Error:', error.response?.body || error.message);
    console.error('\nStatus Code:', error.response?.statusCode);
    
    if (error.response?.statusCode === 401) {
      console.error('\n🔑 Authentication Error:');
      console.error('Your API credentials are invalid or expired.');
      console.error('Please get new credentials from https://developers.amadeus.com/my-apps');
    } else if (error.response?.statusCode === 400) {
      console.error('\n⚠️ Bad Request:');
      console.error('The test request parameters might be invalid.');
    } else if (error.response?.statusCode >= 500) {
      console.error('\n🔧 Server Error:');
      console.error('Amadeus test environment is down or having issues.');
      console.error('This is not your fault - their server is unavailable.');
    }
    
    return false;
  }
}

// Test 2: Airport search
async function testAirportSearch() {
  try {
    console.log('\n📡 Testing airport search...');
    const response = await amadeus.referenceData.locations.get({
      keyword: 'LON',
      subType: 'AIRPORT'
    });
    
    console.log('✅ Airport search working!');
    console.log(`Found ${response.data.length} airports`);
    return true;
  } catch (error) {
    console.error('❌ Airport search failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('=' .repeat(60));
  console.log('AMADEUS API DIAGNOSTIC TEST');
  console.log('=' .repeat(60) + '\n');
  
  const flightTest = await testFlightSearch();
  const airportTest = await testAirportSearch();
  
  console.log('\n' + '=' .repeat(60));
  console.log('TEST RESULTS');
  console.log('=' .repeat(60));
  console.log('Flight Search:', flightTest ? '✅ PASS' : '❌ FAIL');
  console.log('Airport Search:', airportTest ? '✅ PASS' : '❌ FAIL');
  
  if (flightTest && airportTest) {
    console.log('\n🎉 All tests passed! Your API is working correctly.');
    console.log('The issue might be with your application code, not credentials.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
    console.log('\nNext steps:');
    console.log('1. Visit https://developers.amadeus.com/my-apps');
    console.log('2. Check if your app is active and credentials are correct');
    console.log('3. Generate new credentials if needed');
    console.log('4. Update .env.local with new credentials');
  }
  console.log('=' .repeat(60) + '\n');
}

runTests().catch(console.error);
