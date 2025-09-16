import Header from '@/components/ui/Header';
import { FileText, Calendar } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Last updated: January 15, 2024</span>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using FlightBooker's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of FlightBooker's website materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Reservations</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>3.1 Booking Process:</strong> All flight bookings are subject to availability and confirmation by the respective airlines. FlightBooker acts as an intermediary between you and the airlines.
              </p>
              <p className="leading-relaxed">
                <strong>3.2 Pricing:</strong> All prices displayed are in the selected currency and include applicable taxes and fees unless otherwise specified. Prices are subject to change without notice until payment is confirmed.
              </p>
              <p className="leading-relaxed">
                <strong>3.3 Payment:</strong> Payment must be made at the time of booking. We accept major credit cards, PayPal, and bank transfers as specified on our payment page.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation and Refunds</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>4.1 Cancellation Rights:</strong> You may cancel your booking in accordance with the airline's cancellation policy. Cancellation fees may apply as determined by the airline.
              </p>
              <p className="leading-relaxed">
                <strong>4.2 Refund Processing:</strong> Refunds will be processed within 7-14 business days after cancellation approval. Refunds will be credited to the original payment method.
              </p>
              <p className="leading-relaxed">
                <strong>4.3 Non-Refundable Bookings:</strong> Some promotional fares and special offers may be non-refundable. Such restrictions will be clearly indicated during the booking process.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Travel Documents and Requirements</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for ensuring that you have all necessary travel documents including valid passports, visas, and health certificates as required by your destination country. FlightBooker is not responsible for any issues arising from inadequate travel documentation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Flight Changes and Disruptions</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>6.1 Schedule Changes:</strong> Airlines may change flight schedules, routes, or cancel flights due to operational requirements, weather conditions, or other factors beyond our control.
              </p>
              <p className="leading-relaxed">
                <strong>6.2 Our Role:</strong> FlightBooker will assist in rebooking or processing refunds for airline-initiated changes, but we are not liable for any additional costs or inconveniences caused by such changes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              FlightBooker shall not be liable for any damages including, without limitation, indirect or consequential damages, or any damages whatsoever arising from use or loss of use, data, or profits, whether in contract, tort or otherwise, arising out of or in connection with the use of this website or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices regarding the collection and use of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              FlightBooker reserves the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>If you have any questions about these Terms & Conditions, please contact us:</p>
              <p><strong>Email:</strong> legal@flightbooker.com</p>
              <p><strong>Phone:</strong> 1-800-FLIGHTS (1-800-354-4487)</p>
              <p><strong>Address:</strong> 123 Flight Street, Sky City, SC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}