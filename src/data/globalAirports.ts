// Comprehensive global airport database with major airports worldwide
export interface GlobalAirportData {
  iataCode: string;
  icaoCode?: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  type: 'airport';
  subtype: 'international' | 'domestic';
}

export const GLOBAL_AIRPORTS: GlobalAirportData[] = [
  // North America - United States
  {
    iataCode: 'ATL',
    icaoCode: 'KATL',
    name: 'Hartsfield-Jackson Atlanta International Airport',
    city: 'Atlanta',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 33.6407, longitude: -84.4277 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LAX',
    icaoCode: 'KLAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 33.9425, longitude: -118.4081 },
    timezone: 'America/Los_Angeles',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ORD',
    icaoCode: 'KORD',
    name: "O'Hare International Airport",
    city: 'Chicago',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 41.9742, longitude: -87.9073 },
    timezone: 'America/Chicago',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DFW',
    icaoCode: 'KDFW',
    name: 'Dallas/Fort Worth International Airport',
    city: 'Dallas',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 32.8998, longitude: -97.0403 },
    timezone: 'America/Chicago',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DEN',
    icaoCode: 'KDEN',
    name: 'Denver International Airport',
    city: 'Denver',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 39.8561, longitude: -104.6737 },
    timezone: 'America/Denver',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'JFK',
    icaoCode: 'KJFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 40.6413, longitude: -73.7781 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LGA',
    icaoCode: 'KLGA',
    name: 'LaGuardia Airport',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 40.7769, longitude: -73.8740 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'domestic'
  },
  {
    iataCode: 'EWR',
    icaoCode: 'KEWR',
    name: 'Newark Liberty International Airport',
    city: 'Newark',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 40.6895, longitude: -74.1745 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SFO',
    icaoCode: 'KSFO',
    name: 'San Francisco International Airport',
    city: 'San Francisco',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 37.6213, longitude: -122.3790 },
    timezone: 'America/Los_Angeles',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SEA',
    icaoCode: 'KSEA',
    name: 'Seattle-Tacoma International Airport',
    city: 'Seattle',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 47.4502, longitude: -122.3088 },
    timezone: 'America/Los_Angeles',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MCO',
    icaoCode: 'KMCO',
    name: 'Orlando International Airport',
    city: 'Orlando',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 28.4312, longitude: -81.3081 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MIA',
    icaoCode: 'KMIA',
    name: 'Miami International Airport',
    city: 'Miami',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 25.7959, longitude: -80.2870 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BOS',
    icaoCode: 'KBOS',
    name: 'Logan International Airport',
    city: 'Boston',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 42.3656, longitude: -71.0096 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LAS',
    icaoCode: 'KLAS',
    name: 'McCarran International Airport',
    city: 'Las Vegas',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 36.0840, longitude: -115.1537 },
    timezone: 'America/Los_Angeles',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PHX',
    icaoCode: 'KPHX',
    name: 'Phoenix Sky Harbor International Airport',
    city: 'Phoenix',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 33.4484, longitude: -112.0740 },
    timezone: 'America/Phoenix',
    type: 'airport',
    subtype: 'international'
  },

  // North America - Canada
  {
    iataCode: 'YYZ',
    icaoCode: 'CYYZ',
    name: 'Toronto Pearson International Airport',
    city: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 43.6777, longitude: -79.6248 },
    timezone: 'America/Toronto',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'YVR',
    icaoCode: 'CYVR',
    name: 'Vancouver International Airport',
    city: 'Vancouver',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 49.1967, longitude: -123.1815 },
    timezone: 'America/Vancouver',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'YUL',
    icaoCode: 'CYUL',
    name: 'Montreal-Pierre Elliott Trudeau International Airport',
    city: 'Montreal',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 45.4706, longitude: -73.7408 },
    timezone: 'America/Toronto',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'YYC',
    icaoCode: 'CYYC',
    name: 'Calgary International Airport',
    city: 'Calgary',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 51.1315, longitude: -114.0106 },
    timezone: 'America/Edmonton',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - United Kingdom
  {
    iataCode: 'LHR',
    icaoCode: 'EGLL',
    name: 'Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { latitude: 51.4700, longitude: -0.4543 },
    timezone: 'Europe/London',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LGW',
    icaoCode: 'EGKK',
    name: 'Gatwick Airport',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { latitude: 51.1481, longitude: -0.1903 },
    timezone: 'Europe/London',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'STN',
    icaoCode: 'EGSS',
    name: 'Stansted Airport',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { latitude: 51.8860, longitude: 0.2389 },
    timezone: 'Europe/London',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LTN',
    icaoCode: 'EGGW',
    name: 'Luton Airport',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { latitude: 51.8763, longitude: -0.3717 },
    timezone: 'Europe/London',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MAN',
    icaoCode: 'EGCC',
    name: 'Manchester Airport',
    city: 'Manchester',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { latitude: 53.3544, longitude: -2.2756 },
    timezone: 'Europe/London',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'EDI',
    icaoCode: 'EGPH',
    name: 'Edinburgh Airport',
    city: 'Edinburgh',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { latitude: 55.9500, longitude: -3.3725 },
    timezone: 'Europe/London',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - France
  {
    iataCode: 'CDG',
    icaoCode: 'LFPG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    coordinates: { latitude: 49.0097, longitude: 2.5479 },
    timezone: 'Europe/Paris',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ORY',
    icaoCode: 'LFPO',
    name: 'Orly Airport',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    coordinates: { latitude: 48.7233, longitude: 2.3794 },
    timezone: 'Europe/Paris',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'NCE',
    icaoCode: 'LFMN',
    name: 'Nice Côte d\'Azur Airport',
    city: 'Nice',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    coordinates: { latitude: 43.6584, longitude: 7.2159 },
    timezone: 'Europe/Paris',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LYS',
    icaoCode: 'LFLL',
    name: 'Lyon–Saint-Exupéry Airport',
    city: 'Lyon',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    coordinates: { latitude: 45.7256, longitude: 5.0811 },
    timezone: 'Europe/Paris',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - Germany
  {
    iataCode: 'FRA',
    icaoCode: 'EDDF',
    name: 'Frankfurt Airport',
    city: 'Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    coordinates: { latitude: 50.0379, longitude: 8.5622 },
    timezone: 'Europe/Berlin',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MUC',
    icaoCode: 'EDDM',
    name: 'Munich Airport',
    city: 'Munich',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    coordinates: { latitude: 48.3538, longitude: 11.7861 },
    timezone: 'Europe/Berlin',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DUS',
    icaoCode: 'EDDL',
    name: 'Düsseldorf Airport',
    city: 'Düsseldorf',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    coordinates: { latitude: 51.2895, longitude: 6.7668 },
    timezone: 'Europe/Berlin',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'TXL',
    icaoCode: 'EDDT',
    name: 'Berlin Tegel Airport',
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    coordinates: { latitude: 52.5597, longitude: 13.2877 },
    timezone: 'Europe/Berlin',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - Netherlands
  {
    iataCode: 'AMS',
    icaoCode: 'EHAM',
    name: 'Amsterdam Airport Schiphol',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    region: 'Europe',
    coordinates: { latitude: 52.3105, longitude: 4.7683 },
    timezone: 'Europe/Amsterdam',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - Spain
  {
    iataCode: 'MAD',
    icaoCode: 'LEMD',
    name: 'Adolfo Suárez Madrid–Barajas Airport',
    city: 'Madrid',
    country: 'Spain',
    countryCode: 'ES',
    region: 'Europe',
    coordinates: { latitude: 40.4719, longitude: -3.5626 },
    timezone: 'Europe/Madrid',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BCN',
    icaoCode: 'LEBL',
    name: 'Barcelona–El Prat Airport',
    city: 'Barcelona',
    country: 'Spain',
    countryCode: 'ES',
    region: 'Europe',
    coordinates: { latitude: 41.2974, longitude: 2.0833 },
    timezone: 'Europe/Madrid',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - Italy
  {
    iataCode: 'FCO',
    icaoCode: 'LIRF',
    name: 'Leonardo da Vinci International Airport',
    city: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Europe',
    coordinates: { latitude: 41.8045, longitude: 12.2515 },
    timezone: 'Europe/Rome',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MXP',
    icaoCode: 'LIMC',
    name: 'Milan Malpensa Airport',
    city: 'Milan',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Europe',
    coordinates: { latitude: 45.6306, longitude: 8.7281 },
    timezone: 'Europe/Rome',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - Switzerland
  {
    iataCode: 'ZUR',
    icaoCode: 'LSZH',
    name: 'Zurich Airport',
    city: 'Zurich',
    country: 'Switzerland',
    countryCode: 'CH',
    region: 'Europe',
    coordinates: { latitude: 47.4647, longitude: 8.5492 },
    timezone: 'Europe/Zurich',
    type: 'airport',
    subtype: 'international'
  },

  // Europe - Austria
  {
    iataCode: 'VIE',
    icaoCode: 'LOWW',
    name: 'Vienna International Airport',
    city: 'Vienna',
    country: 'Austria',
    countryCode: 'AT',
    region: 'Europe',
    coordinates: { latitude: 48.1103, longitude: 16.5697 },
    timezone: 'Europe/Vienna',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Japan
  {
    iataCode: 'NRT',
    icaoCode: 'RJAA',
    name: 'Narita International Airport',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    coordinates: { latitude: 35.7647, longitude: 140.3864 },
    timezone: 'Asia/Tokyo',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'HND',
    icaoCode: 'RJTT',
    name: 'Haneda Airport',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    coordinates: { latitude: 35.5494, longitude: 139.7798 },
    timezone: 'Asia/Tokyo',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'KIX',
    icaoCode: 'RJBB',
    name: 'Kansai International Airport',
    city: 'Osaka',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    coordinates: { latitude: 34.4348, longitude: 135.2442 },
    timezone: 'Asia/Tokyo',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - South Korea
  {
    iataCode: 'ICN',
    icaoCode: 'RKSI',
    name: 'Incheon International Airport',
    city: 'Seoul',
    country: 'South Korea',
    countryCode: 'KR',
    region: 'Asia-Pacific',
    coordinates: { latitude: 37.4602, longitude: 126.4407 },
    timezone: 'Asia/Seoul',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'GMP',
    icaoCode: 'RKSS',
    name: 'Gimpo International Airport',
    city: 'Seoul',
    country: 'South Korea',
    countryCode: 'KR',
    region: 'Asia-Pacific',
    coordinates: { latitude: 37.5583, longitude: 126.7906 },
    timezone: 'Asia/Seoul',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - China
  {
    iataCode: 'PEK',
    icaoCode: 'ZBAA',
    name: 'Beijing Capital International Airport',
    city: 'Beijing',
    country: 'China',
    countryCode: 'CN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 40.0799, longitude: 116.6031 },
    timezone: 'Asia/Shanghai',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PVG',
    icaoCode: 'ZSPD',
    name: 'Shanghai Pudong International Airport',
    city: 'Shanghai',
    country: 'China',
    countryCode: 'CN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 31.1443, longitude: 121.8083 },
    timezone: 'Asia/Shanghai',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CAN',
    icaoCode: 'ZGGG',
    name: 'Guangzhou Baiyun International Airport',
    city: 'Guangzhou',
    country: 'China',
    countryCode: 'CN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 23.3924, longitude: 113.2988 },
    timezone: 'Asia/Shanghai',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Singapore
  {
    iataCode: 'SIN',
    icaoCode: 'WSSS',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    region: 'Asia-Pacific',
    coordinates: { latitude: 1.3644, longitude: 103.9915 },
    timezone: 'Asia/Singapore',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Hong Kong
  {
    iataCode: 'HKG',
    icaoCode: 'VHHH',
    name: 'Hong Kong International Airport',
    city: 'Hong Kong',
    country: 'Hong Kong',
    countryCode: 'HK',
    region: 'Asia-Pacific',
    coordinates: { latitude: 22.3080, longitude: 113.9185 },
    timezone: 'Asia/Hong_Kong',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Thailand
  {
    iataCode: 'BKK',
    icaoCode: 'VTBS',
    name: 'Suvarnabhumi Airport',
    city: 'Bangkok',
    country: 'Thailand',
    countryCode: 'TH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 13.6900, longitude: 100.7501 },
    timezone: 'Asia/Bangkok',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Malaysia
  {
    iataCode: 'KUL',
    icaoCode: 'WMKK',
    name: 'Kuala Lumpur International Airport',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    countryCode: 'MY',
    region: 'Asia-Pacific',
    coordinates: { latitude: 2.7456, longitude: 101.7072 },
    timezone: 'Asia/Kuala_Lumpur',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Indonesia
  {
    iataCode: 'CGK',
    icaoCode: 'WIII',
    name: 'Soekarno-Hatta International Airport',
    city: 'Jakarta',
    country: 'Indonesia',
    countryCode: 'ID',
    region: 'Asia-Pacific',
    coordinates: { latitude: -6.1256, longitude: 106.6559 },
    timezone: 'Asia/Jakarta',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Philippines
  {
    iataCode: 'MNL',
    icaoCode: 'RPLL',
    name: 'Ninoy Aquino International Airport',
    city: 'Manila',
    country: 'Philippines',
    countryCode: 'PH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 14.5086, longitude: 121.0194 },
    timezone: 'Asia/Manila',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - Australia
  {
    iataCode: 'SYD',
    icaoCode: 'YSSY',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -33.9399, longitude: 151.1753 },
    timezone: 'Australia/Sydney',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MEL',
    icaoCode: 'YMML',
    name: 'Melbourne Airport',
    city: 'Melbourne',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -37.6733, longitude: 144.8433 },
    timezone: 'Australia/Melbourne',
    type: 'airport',
    subtype: 'international'
  },

  // Asia-Pacific - New Zealand
  {
    iataCode: 'AKL',
    icaoCode: 'NZAA',
    name: 'Auckland Airport',
    city: 'Auckland',
    country: 'New Zealand',
    countryCode: 'NZ',
    region: 'Asia-Pacific',
    coordinates: { latitude: -37.0082, longitude: 174.7850 },
    timezone: 'Pacific/Auckland',
    type: 'airport',
    subtype: 'international'
  },

  // India - Major Airports
  {
    iataCode: 'DEL',
    icaoCode: 'VIDP',
    name: 'Indira Gandhi International Airport',
    city: 'New Delhi',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 28.5665, longitude: 77.1031 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BOM',
    icaoCode: 'VABB',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    city: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 19.0896, longitude: 72.8656 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BLR',
    icaoCode: 'VOBL',
    name: 'Kempegowda International Airport',
    city: 'Bangalore',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 13.1986, longitude: 77.7066 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MAA',
    icaoCode: 'VOMM',
    name: 'Chennai International Airport',
    city: 'Chennai',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 12.9941, longitude: 80.1709 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CCU',
    icaoCode: 'VECC',
    name: 'Netaji Subhash Chandra Bose International Airport',
    city: 'Kolkata',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 22.6546, longitude: 88.4467 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'HYD',
    icaoCode: 'VOHS',
    name: 'Rajiv Gandhi International Airport',
    city: 'Hyderabad',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 17.2313, longitude: 78.4298 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'AMD',
    icaoCode: 'VAAH',
    name: 'Sardar Vallabhbhai Patel International Airport',
    city: 'Ahmedabad',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 23.0776, longitude: 72.6347 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'COK',
    icaoCode: 'VOCI',
    name: 'Cochin International Airport',
    city: 'Kochi',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 10.1520, longitude: 76.4019 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PNQ',
    icaoCode: 'VAPO',
    name: 'Pune Airport',
    city: 'Pune',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 18.5820, longitude: 73.9197 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'domestic'
  },
  {
    iataCode: 'GOI',
    icaoCode: 'VAGO',
    name: 'Dabolim Airport',
    city: 'Goa',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 15.3808, longitude: 73.8314 },
    timezone: 'Asia/Kolkata',
    type: 'airport',
    subtype: 'international'
  },

  // Middle East - United Arab Emirates
  {
    iataCode: 'DXB',
    icaoCode: 'OMDB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Middle East',
    coordinates: { latitude: 25.2532, longitude: 55.3657 },
    timezone: 'Asia/Dubai',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'AUH',
    icaoCode: 'OMAA',
    name: 'Abu Dhabi International Airport',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Middle East',
    coordinates: { latitude: 24.4330, longitude: 54.6511 },
    timezone: 'Asia/Dubai',
    type: 'airport',
    subtype: 'international'
  },

  // Middle East - Qatar
  {
    iataCode: 'DOH',
    icaoCode: 'OTHH',
    name: 'Hamad International Airport',
    city: 'Doha',
    country: 'Qatar',
    countryCode: 'QA',
    region: 'Middle East',
    coordinates: { latitude: 25.2731, longitude: 51.6080 },
    timezone: 'Asia/Qatar',
    type: 'airport',
    subtype: 'international'
  },

  // Middle East - Saudi Arabia
  {
    iataCode: 'RUH',
    icaoCode: 'OERK',
    name: 'King Khalid International Airport',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    region: 'Middle East',
    coordinates: { latitude: 24.9576, longitude: 46.6988 },
    timezone: 'Asia/Riyadh',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'JED',
    icaoCode: 'OEJN',
    name: 'King Abdulaziz International Airport',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    region: 'Middle East',
    coordinates: { latitude: 21.6796, longitude: 39.1565 },
    timezone: 'Asia/Riyadh',
    type: 'airport',
    subtype: 'international'
  },

  // Middle East - Turkey
  {
    iataCode: 'IST',
    icaoCode: 'LTFM',
    name: 'Istanbul Airport',
    city: 'Istanbul',
    country: 'Turkey',
    countryCode: 'TR',
    region: 'Middle East',
    coordinates: { latitude: 41.2753, longitude: 28.7519 },
    timezone: 'Europe/Istanbul',
    type: 'airport',
    subtype: 'international'
  },

  // Middle East - Israel
  {
    iataCode: 'TLV',
    icaoCode: 'LLBG',
    name: 'Ben Gurion Airport',
    city: 'Tel Aviv',
    country: 'Israel',
    countryCode: 'IL',
    region: 'Middle East',
    coordinates: { latitude: 32.0004, longitude: 34.8706 },
    timezone: 'Asia/Jerusalem',
    type: 'airport',
    subtype: 'international'
  },

  // Africa - South Africa
  {
    iataCode: 'JNB',
    icaoCode: 'FAJS',
    name: 'OR Tambo International Airport',
    city: 'Johannesburg',
    country: 'South Africa',
    countryCode: 'ZA',
    region: 'Africa',
    coordinates: { latitude: -26.1367, longitude: 28.2411 },
    timezone: 'Africa/Johannesburg',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CPT',
    icaoCode: 'FACT',
    name: 'Cape Town International Airport',
    city: 'Cape Town',
    country: 'South Africa',
    countryCode: 'ZA',
    region: 'Africa',
    coordinates: { latitude: -33.9648, longitude: 18.6017 },
    timezone: 'Africa/Johannesburg',
    type: 'airport',
    subtype: 'international'
  },

  // Africa - Egypt
  {
    iataCode: 'CAI',
    icaoCode: 'HECA',
    name: 'Cairo International Airport',
    city: 'Cairo',
    country: 'Egypt',
    countryCode: 'EG',
    region: 'Africa',
    coordinates: { latitude: 30.1219, longitude: 31.4056 },
    timezone: 'Africa/Cairo',
    type: 'airport',
    subtype: 'international'
  },

  // Africa - Morocco
  {
    iataCode: 'CMN',
    icaoCode: 'GMMN',
    name: 'Mohammed V International Airport',
    city: 'Casablanca',
    country: 'Morocco',
    countryCode: 'MA',
    region: 'Africa',
    coordinates: { latitude: 33.3675, longitude: -7.5900 },
    timezone: 'Africa/Casablanca',
    type: 'airport',
    subtype: 'international'
  },

  // South America - Brazil
  {
    iataCode: 'GRU',
    icaoCode: 'SBGR',
    name: 'São Paulo-Guarulhos International Airport',
    city: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { latitude: -23.4356, longitude: -46.4731 },
    timezone: 'America/Sao_Paulo',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'GIG',
    icaoCode: 'SBGL',
    name: 'Rio de Janeiro–Galeão International Airport',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { latitude: -22.8099, longitude: -43.2505 },
    timezone: 'America/Sao_Paulo',
    type: 'airport',
    subtype: 'international'
  },

  // South America - Argentina
  {
    iataCode: 'EZE',
    icaoCode: 'SAEZ',
    name: 'Ezeiza International Airport',
    city: 'Buenos Aires',
    country: 'Argentina',
    countryCode: 'AR',
    region: 'South America',
    coordinates: { latitude: -34.8222, longitude: -58.5358 },
    timezone: 'America/Argentina/Buenos_Aires',
    type: 'airport',
    subtype: 'international'
  },

  // South America - Chile
  {
    iataCode: 'SCL',
    icaoCode: 'SCEL',
    name: 'Comodoro Arturo Merino Benítez International Airport',
    city: 'Santiago',
    country: 'Chile',
    countryCode: 'CL',
    region: 'South America',
    coordinates: { latitude: -33.3928, longitude: -70.7858 },
    timezone: 'America/Santiago',
    type: 'airport',
    subtype: 'international'
  },

  // South America - Colombia
  {
    iataCode: 'BOG',
    icaoCode: 'SKBO',
    name: 'El Dorado International Airport',
    city: 'Bogotá',
    country: 'Colombia',
    countryCode: 'CO',
    region: 'South America',
    coordinates: { latitude: 4.7016, longitude: -74.1469 },
    timezone: 'America/Bogota',
    type: 'airport',
    subtype: 'international'
  },

  // South America - Peru
  {
    iataCode: 'LIM',
    icaoCode: 'SPJC',
    name: 'Jorge Chávez International Airport',
    city: 'Lima',
    country: 'Peru',
    countryCode: 'PE',
    region: 'South America',
    coordinates: { latitude: -12.0219, longitude: -77.1143 },
    timezone: 'America/Lima',
    type: 'airport',
    subtype: 'international'
  },

  // Additional European airports
  {
    iataCode: 'ARN',
    icaoCode: 'ESSA',
    name: 'Stockholm Arlanda Airport',
    city: 'Stockholm',
    country: 'Sweden',
    countryCode: 'SE',
    region: 'Europe',
    coordinates: { latitude: 59.6519, longitude: 17.9186 },
    timezone: 'Europe/Stockholm',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CPH',
    icaoCode: 'EKCH',
    name: 'Copenhagen Airport',
    city: 'Copenhagen',
    country: 'Denmark',
    countryCode: 'DK',
    region: 'Europe',
    coordinates: { latitude: 55.6181, longitude: 12.6561 },
    timezone: 'Europe/Copenhagen',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'OSL',
    icaoCode: 'ENGM',
    name: 'Oslo Airport',
    city: 'Oslo',
    country: 'Norway',
    countryCode: 'NO',
    region: 'Europe',
    coordinates: { latitude: 60.1976, longitude: 11.1004 },
    timezone: 'Europe/Oslo',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'HEL',
    icaoCode: 'EFHK',
    name: 'Helsinki Airport',
    city: 'Helsinki',
    country: 'Finland',
    countryCode: 'FI',
    region: 'Europe',
    coordinates: { latitude: 60.3172, longitude: 24.9633 },
    timezone: 'Europe/Helsinki',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'WAW',
    icaoCode: 'EPWA',
    name: 'Warsaw Chopin Airport',
    city: 'Warsaw',
    country: 'Poland',
    countryCode: 'PL',
    region: 'Europe',
    coordinates: { latitude: 52.1657, longitude: 20.9671 },
    timezone: 'Europe/Warsaw',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PRG',
    icaoCode: 'LKPR',
    name: 'Václav Havel Airport Prague',
    city: 'Prague',
    country: 'Czech Republic',
    countryCode: 'CZ',
    region: 'Europe',
    coordinates: { latitude: 50.1008, longitude: 14.2632 },
    timezone: 'Europe/Prague',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BUD',
    icaoCode: 'LHBP',
    name: 'Budapest Ferenc Liszt International Airport',
    city: 'Budapest',
    country: 'Hungary',
    countryCode: 'HU',
    region: 'Europe',
    coordinates: { latitude: 47.4369, longitude: 19.2556 },
    timezone: 'Europe/Budapest',
    type: 'airport',
    subtype: 'international'
  },

  // Additional Middle East airports
  {
    iataCode: 'KWI',
    icaoCode: 'OKBK',
    name: 'Kuwait International Airport',
    city: 'Kuwait City',
    country: 'Kuwait',
    countryCode: 'KW',
    region: 'Middle East',
    coordinates: { latitude: 29.2267, longitude: 47.9689 },
    timezone: 'Asia/Kuwait',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BAH',
    icaoCode: 'OBBI',
    name: 'Bahrain International Airport',
    city: 'Manama',
    country: 'Bahrain',
    countryCode: 'BH',
    region: 'Middle East',
    coordinates: { latitude: 26.2708, longitude: 50.6336 },
    timezone: 'Asia/Bahrain',
    type: 'airport',
    subtype: 'international'
  },

  // Additional Asian airports
  {
    iataCode: 'TPE',
    icaoCode: 'RCTP',
    name: 'Taiwan Taoyuan International Airport',
    city: 'Taipei',
    country: 'Taiwan',
    countryCode: 'TW',
    region: 'Asia-Pacific',
    coordinates: { latitude: 25.0777, longitude: 121.2328 },
    timezone: 'Asia/Taipei',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'VVO',
    icaoCode: 'UHWW',
    name: 'Vladivostok International Airport',
    city: 'Vladivostok',
    country: 'Russia',
    countryCode: 'RU',
    region: 'Asia-Pacific',
    coordinates: { latitude: 43.3990, longitude: 132.1483 },
    timezone: 'Asia/Vladivostok',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SVO',
    icaoCode: 'UUEE',
    name: 'Sheremetyevo International Airport',
    city: 'Moscow',
    country: 'Russia',
    countryCode: 'RU',
    region: 'Europe',
    coordinates: { latitude: 55.9728, longitude: 37.4147 },
    timezone: 'Europe/Moscow',
    type: 'airport',
    subtype: 'international'
  },

  // Additional cities and smaller airports
  {
    iataCode: 'NYC',
    icaoCode: '',
    name: 'New York City - All Airports',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LON',
    icaoCode: '',
    name: 'London - All Airports',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
    timezone: 'Europe/London',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PAR',
    icaoCode: '',
    name: 'Paris - All Airports',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    region: 'Europe',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
    timezone: 'Europe/Paris',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'TYO',
    icaoCode: '',
    name: 'Tokyo - All Airports',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
    timezone: 'Asia/Tokyo',
    type: 'airport',
    subtype: 'international'
  },

  // More European airports
  {
    iataCode: 'LIS',
    icaoCode: 'LPPT',
    name: 'Humberto Delgado Airport',
    city: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Europe',
    coordinates: { latitude: 38.7813, longitude: -9.1361 },
    timezone: 'Europe/Lisbon',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'OPO',
    icaoCode: 'LPPR',
    name: 'Francisco Sá Carneiro Airport',
    city: 'Porto',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Europe',
    coordinates: { latitude: 41.2481, longitude: -8.6814 },
    timezone: 'Europe/Lisbon',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ATH',
    icaoCode: 'LGAV',
    name: 'Athens International Airport',
    city: 'Athens',
    country: 'Greece',
    countryCode: 'GR',
    region: 'Europe',
    coordinates: { latitude: 37.9364, longitude: 23.9445 },
    timezone: 'Europe/Athens',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DUB',
    icaoCode: 'EIDW',
    name: 'Dublin Airport',
    city: 'Dublin',
    country: 'Ireland',
    countryCode: 'IE',
    region: 'Europe',
    coordinates: { latitude: 53.4213, longitude: -6.2701 },
    timezone: 'Europe/Dublin',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'KEF',
    icaoCode: 'BIKF',
    name: 'Keflavik International Airport',
    city: 'Reykjavik',
    country: 'Iceland',
    countryCode: 'IS',
    region: 'Europe',
    coordinates: { latitude: 63.9850, longitude: -22.6056 },
    timezone: 'Atlantic/Reykjavik',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BRU',
    icaoCode: 'EBBR',
    name: 'Brussels Airport',
    city: 'Brussels',
    country: 'Belgium',
    countryCode: 'BE',
    region: 'Europe',
    coordinates: { latitude: 50.9014, longitude: 4.4844 },
    timezone: 'Europe/Brussels',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LUX',
    icaoCode: 'ELLX',
    name: 'Luxembourg Airport',
    city: 'Luxembourg',
    country: 'Luxembourg',
    countryCode: 'LU',
    region: 'Europe',
    coordinates: { latitude: 49.6233, longitude: 6.2044 },
    timezone: 'Europe/Luxembourg',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'GVA',
    icaoCode: 'LSGG',
    name: 'Geneva Airport',
    city: 'Geneva',
    country: 'Switzerland',
    countryCode: 'CH',
    region: 'Europe',
    coordinates: { latitude: 46.2381, longitude: 6.1089 },
    timezone: 'Europe/Zurich',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BSL',
    icaoCode: 'LFSB',
    name: 'Basel-Mulhouse Airport',
    city: 'Basel',
    country: 'Switzerland',
    countryCode: 'CH',
    region: 'Europe',
    coordinates: { latitude: 47.5896, longitude: 7.5298 },
    timezone: 'Europe/Zurich',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SOF',
    icaoCode: 'LBSF',
    name: 'Sofia Airport',
    city: 'Sofia',
    country: 'Bulgaria',
    countryCode: 'BG',
    region: 'Europe',
    coordinates: { latitude: 42.6969, longitude: 23.4114 },
    timezone: 'Europe/Sofia',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'OTP',
    icaoCode: 'LROP',
    name: 'Henri Coandă International Airport',
    city: 'Bucharest',
    country: 'Romania',
    countryCode: 'RO',
    region: 'Europe',
    coordinates: { latitude: 44.5711, longitude: 26.0850 },
    timezone: 'Europe/Bucharest',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BEG',
    icaoCode: 'LYBE',
    name: 'Belgrade Nikola Tesla Airport',
    city: 'Belgrade',
    country: 'Serbia',
    countryCode: 'RS',
    region: 'Europe',
    coordinates: { latitude: 44.8184, longitude: 20.3091 },
    timezone: 'Europe/Belgrade',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ZAG',
    icaoCode: 'LDZA',
    name: 'Zagreb Airport',
    city: 'Zagreb',
    country: 'Croatia',
    countryCode: 'HR',
    region: 'Europe',
    coordinates: { latitude: 45.7429, longitude: 16.0688 },
    timezone: 'Europe/Zagreb',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LJU',
    icaoCode: 'LJLJ',
    name: 'Ljubljana Jože Pučnik Airport',
    city: 'Ljubljana',
    country: 'Slovenia',
    countryCode: 'SI',
    region: 'Europe',
    coordinates: { latitude: 46.2238, longitude: 14.4576 },
    timezone: 'Europe/Ljubljana',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SKP',
    icaoCode: 'LWSK',
    name: 'Skopje Alexander the Great Airport',
    city: 'Skopje',
    country: 'North Macedonia',
    countryCode: 'MK',
    region: 'Europe',
    coordinates: { latitude: 41.9616, longitude: 21.6214 },
    timezone: 'Europe/Skopje',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'TIA',
    icaoCode: 'LATI',
    name: 'Tirana International Airport',
    city: 'Tirana',
    country: 'Albania',
    countryCode: 'AL',
    region: 'Europe',
    coordinates: { latitude: 41.4147, longitude: 19.7206 },
    timezone: 'Europe/Tirane',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'RIX',
    icaoCode: 'EVRA',
    name: 'Riga International Airport',
    city: 'Riga',
    country: 'Latvia',
    countryCode: 'LV',
    region: 'Europe',
    coordinates: { latitude: 56.9236, longitude: 23.9711 },
    timezone: 'Europe/Riga',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'TLL',
    icaoCode: 'EETN',
    name: 'Tallinn Airport',
    city: 'Tallinn',
    country: 'Estonia',
    countryCode: 'EE',
    region: 'Europe',
    coordinates: { latitude: 59.4133, longitude: 24.8328 },
    timezone: 'Europe/Tallinn',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'VNO',
    icaoCode: 'EYVI',
    name: 'Vilnius Airport',
    city: 'Vilnius',
    country: 'Lithuania',
    countryCode: 'LT',
    region: 'Europe',
    coordinates: { latitude: 54.6341, longitude: 25.2858 },
    timezone: 'Europe/Vilnius',
    type: 'airport',
    subtype: 'international'
  },

  // More North American airports
  {
    iataCode: 'YOW',
    icaoCode: 'CYOW',
    name: 'Ottawa Macdonald-Cartier International Airport',
    city: 'Ottawa',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 45.3225, longitude: -75.6692 },
    timezone: 'America/Toronto',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'YHZ',
    icaoCode: 'CYHZ',
    name: 'Halifax Stanfield International Airport',
    city: 'Halifax',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 44.8808, longitude: -63.5086 },
    timezone: 'America/Halifax',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'YWG',
    icaoCode: 'CYWG',
    name: 'Winnipeg Richardson International Airport',
    city: 'Winnipeg',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 49.9100, longitude: -97.2394 },
    timezone: 'America/Winnipeg',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'YEG',
    icaoCode: 'CYEG',
    name: 'Edmonton International Airport',
    city: 'Edmonton',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 53.3097, longitude: -113.5800 },
    timezone: 'America/Edmonton',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MEX',
    icaoCode: 'MMMX',
    name: 'Mexico City International Airport',
    city: 'Mexico City',
    country: 'Mexico',
    countryCode: 'MX',
    region: 'North America',
    coordinates: { latitude: 19.4363, longitude: -99.0720 },
    timezone: 'America/Mexico_City',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CUN',
    icaoCode: 'MMUN',
    name: 'Cancun International Airport',
    city: 'Cancun',
    country: 'Mexico',
    countryCode: 'MX',
    region: 'North America',
    coordinates: { latitude: 21.0365, longitude: -86.8771 },
    timezone: 'America/Cancun',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'GDL',
    icaoCode: 'MMGL',
    name: 'Miguel Hidalgo y Costilla Guadalajara International Airport',
    city: 'Guadalajara',
    country: 'Mexico',
    countryCode: 'MX',
    region: 'North America',
    coordinates: { latitude: 20.5218, longitude: -103.3111 },
    timezone: 'America/Mexico_City',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MTY',
    icaoCode: 'MMMY',
    name: 'General Mariano Escobedo International Airport',
    city: 'Monterrey',
    country: 'Mexico',
    countryCode: 'MX',
    region: 'North America',
    coordinates: { latitude: 25.7785, longitude: -100.1072 },
    timezone: 'America/Monterrey',
    type: 'airport',
    subtype: 'international'
  },

  // More US regional airports
  {
    iataCode: 'SLC',
    icaoCode: 'KSLC',
    name: 'Salt Lake City International Airport',
    city: 'Salt Lake City',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 40.7899, longitude: -111.9791 },
    timezone: 'America/Denver',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PDX',
    icaoCode: 'KPDX',
    name: 'Portland International Airport',
    city: 'Portland',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 45.5898, longitude: -122.5951 },
    timezone: 'America/Los_Angeles',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MSP',
    icaoCode: 'KMSP',
    name: 'Minneapolis-Saint Paul International Airport',
    city: 'Minneapolis',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 44.8848, longitude: -93.2223 },
    timezone: 'America/Chicago',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DTW',
    icaoCode: 'KDTW',
    name: 'Detroit Metropolitan Wayne County Airport',
    city: 'Detroit',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 42.2162, longitude: -83.3554 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CLT',
    icaoCode: 'KCLT',
    name: 'Charlotte Douglas International Airport',
    city: 'Charlotte',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 35.2140, longitude: -80.9431 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BWI',
    icaoCode: 'KBWI',
    name: 'Baltimore/Washington International Airport',
    city: 'Baltimore',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 39.1754, longitude: -76.6683 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'IAD',
    icaoCode: 'KIAD',
    name: 'Washington Dulles International Airport',
    city: 'Washington',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 38.9445, longitude: -77.4558 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DCA',
    icaoCode: 'KDCA',
    name: 'Ronald Reagan Washington National Airport',
    city: 'Washington',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 38.8521, longitude: -77.0377 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'domestic'
  },
  {
    iataCode: 'FLL',
    icaoCode: 'KFLL',
    name: 'Fort Lauderdale-Hollywood International Airport',
    city: 'Fort Lauderdale',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 26.0742, longitude: -80.1506 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'TPA',
    icaoCode: 'KTPA',
    name: 'Tampa International Airport',
    city: 'Tampa',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 27.9755, longitude: -82.5332 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SAN',
    icaoCode: 'KSAN',
    name: 'San Diego International Airport',
    city: 'San Diego',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 32.7336, longitude: -117.1897 },
    timezone: 'America/Los_Angeles',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'HNL',
    icaoCode: 'PHNL',
    name: 'Daniel K. Inouye International Airport',
    city: 'Honolulu',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 21.3099, longitude: -157.8581 },
    timezone: 'Pacific/Honolulu',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ANC',
    icaoCode: 'PANC',
    name: 'Ted Stevens Anchorage International Airport',
    city: 'Anchorage',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 61.1744, longitude: -149.9962 },
    timezone: 'America/Anchorage',
    type: 'airport',
    subtype: 'international'
  },

  // More Asian airports
  {
    iataCode: 'DXB',
    icaoCode: 'OMDB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Middle East',
    coordinates: { latitude: 25.2532, longitude: 55.3657 },
    timezone: 'Asia/Dubai',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DMK',
    icaoCode: 'VTBD',
    name: 'Don Mueang International Airport',
    city: 'Bangkok',
    country: 'Thailand',
    countryCode: 'TH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 13.9126, longitude: 100.6067 },
    timezone: 'Asia/Bangkok',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'HKT',
    icaoCode: 'VTSP',
    name: 'Phuket International Airport',
    city: 'Phuket',
    country: 'Thailand',
    countryCode: 'TH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 8.1132, longitude: 98.3169 },
    timezone: 'Asia/Bangkok',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CNX',
    icaoCode: 'VTCC',
    name: 'Chiang Mai International Airport',
    city: 'Chiang Mai',
    country: 'Thailand',
    countryCode: 'TH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 18.7669, longitude: 98.9626 },
    timezone: 'Asia/Bangkok',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SGN',
    icaoCode: 'VVTS',
    name: 'Tan Son Nhat International Airport',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    countryCode: 'VN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 10.8187, longitude: 106.6520 },
    timezone: 'Asia/Ho_Chi_Minh',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'HAN',
    icaoCode: 'VVNB',
    name: 'Noi Bai International Airport',
    city: 'Hanoi',
    country: 'Vietnam',
    countryCode: 'VN',
    region: 'Asia-Pacific',
    coordinates: { latitude: 21.2212, longitude: 105.8070 },
    timezone: 'Asia/Ho_Chi_Minh',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DPS',
    icaoCode: 'WADD',
    name: 'Ngurah Rai International Airport',
    city: 'Denpasar',
    country: 'Indonesia',
    countryCode: 'ID',
    region: 'Asia-Pacific',
    coordinates: { latitude: -8.7467, longitude: 115.1670 },
    timezone: 'Asia/Makassar',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SUB',
    icaoCode: 'WARR',
    name: 'Juanda International Airport',
    city: 'Surabaya',
    country: 'Indonesia',
    countryCode: 'ID',
    region: 'Asia-Pacific',
    coordinates: { latitude: -7.3798, longitude: 112.7866 },
    timezone: 'Asia/Jakarta',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MDN',
    icaoCode: 'WIMM',
    name: 'Polonia International Airport',
    city: 'Medan',
    country: 'Indonesia',
    countryCode: 'ID',
    region: 'Asia-Pacific',
    coordinates: { latitude: 3.6422, longitude: 98.8853 },
    timezone: 'Asia/Jakarta',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CEB',
    icaoCode: 'RPVM',
    name: 'Mactan-Cebu International Airport',
    city: 'Cebu',
    country: 'Philippines',
    countryCode: 'PH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 10.3075, longitude: 123.9806 },
    timezone: 'Asia/Manila',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DVO',
    icaoCode: 'RPMD',
    name: 'Francisco Bangoy International Airport',
    city: 'Davao',
    country: 'Philippines',
    countryCode: 'PH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 7.1255, longitude: 125.6456 },
    timezone: 'Asia/Manila',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CRK',
    icaoCode: 'RPLC',
    name: 'Clark International Airport',
    city: 'Angeles',
    country: 'Philippines',
    countryCode: 'PH',
    region: 'Asia-Pacific',
    coordinates: { latitude: 15.1859, longitude: 120.5602 },
    timezone: 'Asia/Manila',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BKI',
    icaoCode: 'WBKK',
    name: 'Kota Kinabalu International Airport',
    city: 'Kota Kinabalu',
    country: 'Malaysia',
    countryCode: 'MY',
    region: 'Asia-Pacific',
    coordinates: { latitude: 5.9372, longitude: 116.0517 },
    timezone: 'Asia/Kuala_Lumpur',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PEN',
    icaoCode: 'WMKP',
    name: 'Penang International Airport',
    city: 'Penang',
    country: 'Malaysia',
    countryCode: 'MY',
    region: 'Asia-Pacific',
    coordinates: { latitude: 5.2971, longitude: 100.2773 },
    timezone: 'Asia/Kuala_Lumpur',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'JHB',
    icaoCode: 'WMKJ',
    name: 'Sultan Abdul Aziz Shah Airport',
    city: 'Johor Bahru',
    country: 'Malaysia',
    countryCode: 'MY',
    region: 'Asia-Pacific',
    coordinates: { latitude: 1.6411, longitude: 103.6700 },
    timezone: 'Asia/Kuala_Lumpur',
    type: 'airport',
    subtype: 'international'
  },

  // More African airports
  {
    iataCode: 'ADD',
    icaoCode: 'HAAB',
    name: 'Addis Ababa Bole International Airport',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    countryCode: 'ET',
    region: 'Africa',
    coordinates: { latitude: 8.9806, longitude: 38.7992 },
    timezone: 'Africa/Addis_Ababa',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'NBO',
    icaoCode: 'HKJK',
    name: 'Jomo Kenyatta International Airport',
    city: 'Nairobi',
    country: 'Kenya',
    countryCode: 'KE',
    region: 'Africa',
    coordinates: { latitude: -1.3192, longitude: 36.9278 },
    timezone: 'Africa/Nairobi',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DAR',
    icaoCode: 'HTDA',
    name: 'Julius Nyerere International Airport',
    city: 'Dar es Salaam',
    country: 'Tanzania',
    countryCode: 'TZ',
    region: 'Africa',
    coordinates: { latitude: -6.8781, longitude: 39.2026 },
    timezone: 'Africa/Dar_es_Salaam',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LOS',
    icaoCode: 'DNMM',
    name: 'Murtala Muhammed International Airport',
    city: 'Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Africa',
    coordinates: { latitude: 6.5774, longitude: 3.3212 },
    timezone: 'Africa/Lagos',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ABV',
    icaoCode: 'DNAA',
    name: 'Nnamdi Azikiwe International Airport',
    city: 'Abuja',
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'Africa',
    coordinates: { latitude: 9.0068, longitude: 7.2631 },
    timezone: 'Africa/Lagos',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ACC',
    icaoCode: 'DGAA',
    name: 'Kotoka International Airport',
    city: 'Accra',
    country: 'Ghana',
    countryCode: 'GH',
    region: 'Africa',
    coordinates: { latitude: 5.6052, longitude: -0.1669 },
    timezone: 'Africa/Accra',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DKR',
    icaoCode: 'GOOY',
    name: 'Blaise Diagne International Airport',
    city: 'Dakar',
    country: 'Senegal',
    countryCode: 'SN',
    region: 'Africa',
    coordinates: { latitude: 14.6700, longitude: -17.0733 },
    timezone: 'Africa/Dakar',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ALG',
    icaoCode: 'DAAG',
    name: 'Houari Boumediene Airport',
    city: 'Algiers',
    country: 'Algeria',
    countryCode: 'DZ',
    region: 'Africa',
    coordinates: { latitude: 36.6910, longitude: 3.2154 },
    timezone: 'Africa/Algiers',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'TUN',
    icaoCode: 'DTTA',
    name: 'Tunis-Carthage International Airport',
    city: 'Tunis',
    country: 'Tunisia',
    countryCode: 'TN',
    region: 'Africa',
    coordinates: { latitude: 36.8510, longitude: 10.2272 },
    timezone: 'Africa/Tunis',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LUN',
    icaoCode: 'FLKK',
    name: 'Kenneth Kaunda International Airport',
    city: 'Lusaka',
    country: 'Zambia',
    countryCode: 'ZM',
    region: 'Africa',
    coordinates: { latitude: -15.3308, longitude: 28.4530 },
    timezone: 'Africa/Lusaka',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'HRE',
    icaoCode: 'FVHA',
    name: 'Robert Gabriel Mugabe International Airport',
    city: 'Harare',
    country: 'Zimbabwe',
    countryCode: 'ZW',
    region: 'Africa',
    coordinates: { latitude: -17.9318, longitude: 31.0928 },
    timezone: 'Africa/Harare',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MRU',
    icaoCode: 'FIMP',
    name: 'Sir Seewoosagur Ramgoolam International Airport',
    city: 'Port Louis',
    country: 'Mauritius',
    countryCode: 'MU',
    region: 'Africa',
    coordinates: { latitude: -20.4302, longitude: 57.6836 },
    timezone: 'Indian/Mauritius',
    type: 'airport',
    subtype: 'international'
  },

  // More South American airports
  {
    iataCode: 'UIO',
    icaoCode: 'SEQM',
    name: 'Mariscal Sucre International Airport',
    city: 'Quito',
    country: 'Ecuador',
    countryCode: 'EC',
    region: 'South America',
    coordinates: { latitude: -0.1292, longitude: -78.3577 },
    timezone: 'America/Guayaquil',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'GYE',
    icaoCode: 'SEGU',
    name: 'José Joaquín de Olmedo International Airport',
    city: 'Guayaquil',
    country: 'Ecuador',
    countryCode: 'EC',
    region: 'South America',
    coordinates: { latitude: -2.1574, longitude: -79.8836 },
    timezone: 'America/Guayaquil',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CCS',
    icaoCode: 'SVMI',
    name: 'Simón Bolívar International Airport',
    city: 'Caracas',
    country: 'Venezuela',
    countryCode: 'VE',
    region: 'South America',
    coordinates: { latitude: 10.6013, longitude: -67.0061 },
    timezone: 'America/Caracas',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ASU',
    icaoCode: 'SGAS',
    name: 'Silvio Pettirossi International Airport',
    city: 'Asuncion',
    country: 'Paraguay',
    countryCode: 'PY',
    region: 'South America',
    coordinates: { latitude: -25.2398, longitude: -57.5190 },
    timezone: 'America/Asuncion',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MVD',
    icaoCode: 'SUMU',
    name: 'Montevideo Airport',
    city: 'Montevideo',
    country: 'Uruguay',
    countryCode: 'UY',
    region: 'South America',
    coordinates: { latitude: -34.8384, longitude: -56.0307 },
    timezone: 'America/Montevideo',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'LPB',
    icaoCode: 'SLLP',
    name: 'El Alto International Airport',
    city: 'La Paz',
    country: 'Bolivia',
    countryCode: 'BO',
    region: 'South America',
    coordinates: { latitude: -16.5133, longitude: -68.1927 },
    timezone: 'America/La_Paz',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'VVI',
    icaoCode: 'SLVR',
    name: 'Viru Viru International Airport',
    city: 'Santa Cruz',
    country: 'Bolivia',
    countryCode: 'BO',
    region: 'South America',
    coordinates: { latitude: -17.6448, longitude: -63.1355 },
    timezone: 'America/La_Paz',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PBM',
    icaoCode: 'SMJP',
    name: 'Johan Adolf Pengel International Airport',
    city: 'Paramaribo',
    country: 'Suriname',
    countryCode: 'SR',
    region: 'South America',
    coordinates: { latitude: 5.4528, longitude: -55.1878 },
    timezone: 'America/Paramaribo',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'GEO',
    icaoCode: 'SYCJ',
    name: 'Cheddi Jagan International Airport',
    city: 'Georgetown',
    country: 'Guyana',
    countryCode: 'GY',
    region: 'South America',
    coordinates: { latitude: 6.4985, longitude: -58.2541 },
    timezone: 'America/Guyana',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'FEN',
    icaoCode: 'SOCA',
    name: 'Fernando de Noronha Airport',
    city: 'Fernando de Noronha',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { latitude: -3.8549, longitude: -32.4233 },
    timezone: 'America/Noronha',
    type: 'airport',
    subtype: 'domestic'
  },
  {
    iataCode: 'BSB',
    icaoCode: 'SBBR',
    name: 'Brasília International Airport',
    city: 'Brasília',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { latitude: -15.8711, longitude: -47.9172 },
    timezone: 'America/Sao_Paulo',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'FOR',
    icaoCode: 'SBFZ',
    name: 'Pinto Martins International Airport',
    city: 'Fortaleza',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { latitude: -3.7763, longitude: -38.5267 },
    timezone: 'America/Fortaleza',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'REC',
    icaoCode: 'SBRF',
    name: 'Guararapes-Gilberto Freyre International Airport',
    city: 'Recife',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { latitude: -8.1264, longitude: -34.9236 },
    timezone: 'America/Recife',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SSA',
    icaoCode: 'SBSV',
    name: 'Deputado Luís Eduardo Magalhães International Airport',
    city: 'Salvador',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    coordinates: { latitude: -12.9086, longitude: -38.3225 },
    timezone: 'America/Bahia',
    type: 'airport',
    subtype: 'international'
  },

  // Oceania airports
  {
    iataCode: 'BNE',
    icaoCode: 'YBBN',
    name: 'Brisbane Airport',
    city: 'Brisbane',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -27.3942, longitude: 153.1218 },
    timezone: 'Australia/Brisbane',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'PER',
    icaoCode: 'YPPH',
    name: 'Perth Airport',
    city: 'Perth',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -31.9403, longitude: 115.9669 },
    timezone: 'Australia/Perth',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ADL',
    icaoCode: 'YPAD',
    name: 'Adelaide Airport',
    city: 'Adelaide',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -34.9461, longitude: 138.5308 },
    timezone: 'Australia/Adelaide',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'DRW',
    icaoCode: 'YPDN',
    name: 'Darwin Airport',
    city: 'Darwin',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -12.4146, longitude: 130.8777 },
    timezone: 'Australia/Darwin',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CNS',
    icaoCode: 'YBCS',
    name: 'Cairns Airport',
    city: 'Cairns',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -16.8858, longitude: 145.7781 },
    timezone: 'Australia/Brisbane',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CHC',
    icaoCode: 'NZCH',
    name: 'Christchurch Airport',
    city: 'Christchurch',
    country: 'New Zealand',
    countryCode: 'NZ',
    region: 'Asia-Pacific',
    coordinates: { latitude: -43.4894, longitude: 172.5320 },
    timezone: 'Pacific/Auckland',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'WLG',
    icaoCode: 'NZWN',
    name: 'Wellington Airport',
    city: 'Wellington',
    country: 'New Zealand',
    countryCode: 'NZ',
    region: 'Asia-Pacific',
    coordinates: { latitude: -41.3272, longitude: 174.8049 },
    timezone: 'Pacific/Auckland',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ZQN',
    icaoCode: 'NZQN',
    name: 'Queenstown Airport',
    city: 'Queenstown',
    country: 'New Zealand',
    countryCode: 'NZ',
    region: 'Asia-Pacific',
    coordinates: { latitude: -45.0211, longitude: 168.7392 },
    timezone: 'Pacific/Auckland',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'NAN',
    icaoCode: 'NFFN',
    name: 'Nadi International Airport',
    city: 'Nadi',
    country: 'Fiji',
    countryCode: 'FJ',
    region: 'Asia-Pacific',
    coordinates: { latitude: -17.7553, longitude: 177.4431 },
    timezone: 'Pacific/Fiji',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'SUV',
    icaoCode: 'NFSU',
    name: 'Suva Airport',
    city: 'Suva',
    country: 'Fiji',
    countryCode: 'FJ',
    region: 'Asia-Pacific',
    coordinates: { latitude: -18.0435, longitude: 178.5592 },
    timezone: 'Pacific/Fiji',
    type: 'airport',
    subtype: 'domestic'
  },
  {
    iataCode: 'PPT',
    icaoCode: 'NTAA',
    name: 'Tahiti Faa\'a International Airport',
    city: 'Papeete',
    country: 'French Polynesia',
    countryCode: 'PF',
    region: 'Asia-Pacific',
    coordinates: { latitude: -17.5537, longitude: -149.6117 },
    timezone: 'Pacific/Tahiti',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'NCL',
    icaoCode: 'NWWW',
    name: 'La Tontouta International Airport',
    city: 'Noumea',
    country: 'New Caledonia',
    countryCode: 'NC',
    region: 'Asia-Pacific',
    coordinates: { latitude: -22.0146, longitude: 166.2130 },
    timezone: 'Pacific/Noumea',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'VLI',
    icaoCode: 'NVVV',
    name: 'Port Vila Bauerfield Airport',
    city: 'Port Vila',
    country: 'Vanuatu',
    countryCode: 'VU',
    region: 'Asia-Pacific',
    coordinates: { latitude: -17.6993, longitude: 168.3199 },
    timezone: 'Pacific/Efate',
    type: 'airport',
    subtype: 'international'
  },

  // Additional city codes for major metro areas
  {
    iataCode: 'WAS',
    icaoCode: '',
    name: 'Washington DC - All Airports',
    city: 'Washington',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 38.9072, longitude: -77.0369 },
    timezone: 'America/New_York',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'CHI',
    icaoCode: '',
    name: 'Chicago - All Airports',
    city: 'Chicago',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    coordinates: { latitude: 41.8781, longitude: -87.6298 },
    timezone: 'America/Chicago',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'YMQ',
    icaoCode: '',
    name: 'Montreal - All Airports',
    city: 'Montreal',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    coordinates: { latitude: 45.5017, longitude: -73.5673 },
    timezone: 'America/Toronto',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'BER',
    icaoCode: '',
    name: 'Berlin - All Airports',
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    coordinates: { latitude: 52.5200, longitude: 13.4050 },
    timezone: 'Europe/Berlin',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'MIL',
    icaoCode: '',
    name: 'Milan - All Airports',
    city: 'Milan',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Europe',
    coordinates: { latitude: 45.4642, longitude: 9.1900 },
    timezone: 'Europe/Rome',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'ROM',
    icaoCode: '',
    name: 'Rome - All Airports',
    city: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Europe',
    coordinates: { latitude: 41.9028, longitude: 12.4964 },
    timezone: 'Europe/Rome',
    type: 'airport',
    subtype: 'international'
  },
  {
    iataCode: 'STO',
    icaoCode: '',
    name: 'Stockholm - All Airports',
    city: 'Stockholm',
    country: 'Sweden',
    countryCode: 'SE',
    region: 'Europe',
    coordinates: { latitude: 59.3293, longitude: 18.0686 },
    timezone: 'Europe/Stockholm',
    type: 'airport',
    subtype: 'international'
  }
];

// Helper functions for searching
export function searchGlobalAirports(query: string, limit: number = 10): GlobalAirportData[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length < 2) {
    return [];
  }
  
  const results = GLOBAL_AIRPORTS.filter(airport => {
    const searchText = `${airport.iataCode} ${airport.name} ${airport.city} ${airport.country}`.toLowerCase();
    return searchText.includes(normalizedQuery) ||
           airport.iataCode.toLowerCase().startsWith(normalizedQuery) ||
           airport.name.toLowerCase().includes(normalizedQuery) ||
           airport.city.toLowerCase().includes(normalizedQuery) ||
           airport.country.toLowerCase().includes(normalizedQuery);
  });
  
  // Sort by relevance: IATA code match first, then city, then name
  results.sort((a, b) => {
    const aIataMatch = a.iataCode.toLowerCase().startsWith(normalizedQuery);
    const bIataMatch = b.iataCode.toLowerCase().startsWith(normalizedQuery);
    
    if (aIataMatch && !bIataMatch) return -1;
    if (!aIataMatch && bIataMatch) return 1;
    
    const aCityMatch = a.city.toLowerCase().startsWith(normalizedQuery);
    const bCityMatch = b.city.toLowerCase().startsWith(normalizedQuery);
    
    if (aCityMatch && !bCityMatch) return -1;
    if (!aCityMatch && bCityMatch) return 1;
    
    return a.name.localeCompare(b.name);
  });
  
  return results.slice(0, limit);
}

export function getGlobalAirportByCode(code: string): GlobalAirportData | undefined {
  return GLOBAL_AIRPORTS.find(airport => 
    airport.iataCode.toUpperCase() === code.toUpperCase()
  );
}

export function getAllAirports(): GlobalAirportData[] {
  return GLOBAL_AIRPORTS;
}

export function getAirportsByRegion(region: string): GlobalAirportData[] {
  return GLOBAL_AIRPORTS.filter(airport => 
    airport.region.toLowerCase() === region.toLowerCase()
  );
}

export function getAirportsByCountry(countryCode: string): GlobalAirportData[] {
  return GLOBAL_AIRPORTS.filter(airport => 
    airport.countryCode.toUpperCase() === countryCode.toUpperCase()
  );
}