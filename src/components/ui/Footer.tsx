import { Plane, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FlightBooker</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner for flight bookings worldwide.
            </p>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>support@flightbooker.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>New York, NY</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors duration-200">Home</a></li>
              <li><a href="/search" className="hover:text-white transition-colors duration-200">Search Flights</a></li>
              <li><a href="/bookings" className="hover:text-white transition-colors duration-200">My Bookings</a></li>
              <li><a href="/support" className="hover:text-white transition-colors duration-200">Support</a></li>
              <li><a href="/help" className="hover:text-white transition-colors duration-200">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/login" className="hover:text-white transition-colors duration-200">Login</a></li>
              <li><a href="/register" className="hover:text-white transition-colors duration-200">Register</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Flight Booking</span></li>
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Hotel Reservations</span></li>
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Car Rentals</span></li>
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Travel Insurance</span></li>
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Group Bookings</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FlightBooker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}