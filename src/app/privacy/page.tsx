import Header from '@/components/ui/Header';
import { Shield, Calendar, Lock, Eye, Database, Users } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Last updated: January 15, 2024</span>
          </div>
        </div>

        {/* Privacy Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              FlightBooker ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this privacy policy carefully.
            </p>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
                <p className="leading-relaxed mb-2">We may collect personal information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Payment information (credit card details, billing address)</li>
                  <li>Travel preferences and booking history</li>
                  <li>Passport information and travel documents (when required)</li>
                  <li>Account credentials and profile information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Automatically Collected Information</h3>
                <p className="leading-relaxed mb-2">When you visit our website, we automatically collect certain information:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address, browser type, and device information</li>
                  <li>Pages visited, time spent on pages, and click data</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Location data (with your permission)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Process and fulfill your flight bookings and reservations</li>
              <li>Communicate with you about your bookings and account</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send promotional offers and marketing communications (with consent)</li>
              <li>Improve our website, services, and user experience</li>
              <li>Comply with legal obligations and prevent fraud</li>
              <li>Analyze usage patterns and website performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 With Airlines and Partners</h3>
                <p className="leading-relaxed">
                  We share your booking information with airlines and travel partners to process your reservations and provide travel services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Service Providers</h3>
                <p className="leading-relaxed">
                  We may share information with third-party service providers who help us operate our business, such as payment processors, hosting providers, and analytics services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3 Legal Requirements</h3>
                <p className="leading-relaxed">
                  We may disclose information if required by law, court order, or government request, or to protect our rights and prevent fraud.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">5. Data Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes using SSL encryption for data transmission, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, analyze usage patterns, and provide personalized content. Types of cookies we use include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                <li><strong>Marketing Cookies:</strong> Used to show relevant advertisements</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="leading-relaxed">
                You can control cookie settings through your browser preferences or by using our cookie consent tool.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">7. Your Rights and Choices</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request information about the personal data we have about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Object:</strong> Object to processing of your personal information for certain purposes</li>
              </ul>
              <p className="leading-relaxed">
                To exercise these rights, please contact us using the information provided in Section 11.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Booking information is typically retained for 7 years for accounting and legal purposes, while marketing preferences are kept until you opt out.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <p><strong>Privacy Officer</strong></p>
                <p><strong>Email:</strong> privacy@flightbooker.com</p>
                <p><strong>Phone:</strong> 1-800-FLIGHTS (1-800-354-4487)</p>
                <p><strong>Address:</strong> 123 Flight Street, Sky City, SC 12345</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of our services after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}