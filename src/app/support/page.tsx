import Header from '@/components/ui/Header';
import { Phone, Mail, MessageCircle, Clock, Globe, HelpCircle, Book, Shield, CreditCard, Plane } from 'lucide-react';

export default function SupportPage() {
  const supportOptions = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      details: '1-800-FLIGHTS (1-800-354-4487)',
      availability: '24/7 Support',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Email Support',
      description: 'Send us your questions via email',
      details: 'support@flightbooker.com',
      availability: 'Response within 2-4 hours',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Live Chat',
      description: 'Chat with our support agents',
      details: 'Available on website',
      availability: '24/7 Live Chat',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const quickHelp = [
    {
      icon: <Book className="w-6 h-6" />,
      title: 'Booking Help',
      description: 'How to search, book, and manage your flights',
      link: '/help'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Payment Issues',
      description: 'Payment methods, refunds, and billing questions',
      link: '/help'
    },
    {
      icon: <Plane className="w-6 h-6" />,
      title: 'Flight Changes',
      description: 'Modify, cancel, or reschedule your bookings',
      link: '/help'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Travel Insurance',
      description: 'Protection options for your trip',
      link: '/help'
    }
  ];

  const faqs = [
    {
      question: 'How can I cancel my flight booking?',
      answer: 'You can cancel your booking by visiting the "My Bookings" section, selecting your booking, and clicking "Cancel Booking". Cancellation fees may apply depending on the fare type and airline policy.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.'
    },
    {
      question: 'Can I change my flight dates after booking?',
      answer: 'Yes, you can modify your flight dates subject to airline policies and availability. Change fees may apply. Visit "My Bookings" to make changes or contact our support team for assistance.'
    },
    {
      question: 'How do I get my boarding pass?',
      answer: 'You can download your e-ticket from "My Bookings" section. For boarding passes, check-in online with the airline 24 hours before departure or at the airport kiosks.'
    },
    {
      question: 'What happens if my flight is delayed or cancelled?',
      answer: 'If your flight is delayed or cancelled by the airline, you\'ll be notified via email and SMS. We\'ll help you find alternative flights or process refunds according to airline policies.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Customer Support</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help you 24/7. Get assistance with bookings, payments, flight changes, and more.
          </p>
        </div>

        {/* Contact Options */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-3">
                  {option.description}
                </p>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    {option.details}
                  </p>
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      {option.availability}
                    </p>
                  </div>
                </div>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Contact Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Help */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Quick Help
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickHelp.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {item.description}
                </p>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="bg-red-50 rounded-lg p-8 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Emergency Travel Support
            </h2>
            <p className="text-gray-600 mb-4">
              For urgent travel emergencies, flight disruptions, or immediate assistance while traveling
            </p>
            <div className="space-y-2">
              <p className="text-xl font-bold text-red-600">
                1-800-URGENT-1 (1-800-874-3681)
              </p>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Globe className="w-4 h-4" />
                <span>Available 24/7 Worldwide</span>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need More Help?
            </h2>
            <p className="text-gray-600 mb-6">
              Visit our comprehensive help center for detailed guides and tutorials
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Visit Help Center
              </button>
              <button className="bg-white text-gray-700 px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}