import Header from '@/components/ui/Header';
import { HelpCircle, Search, Book, CreditCard, Plane, User, Shield, Phone, Mail, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  const helpCategories = [
    {
      icon: <Book className="w-8 h-8" />,
      title: 'Booking & Reservations',
      description: 'How to search, book, and manage your flights',
      articles: 8,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Payments & Billing',
      description: 'Payment methods, refunds, and billing questions',
      articles: 12,
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: <Plane className="w-8 h-8" />,
      title: 'Flight Changes',
      description: 'Modify, cancel, or reschedule your bookings',
      articles: 6,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <User className="w-8 h-8" />,
      title: 'Account Management',
      description: 'Profile settings, passwords, and preferences',
      articles: 5,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Travel Insurance',
      description: 'Protection options and coverage details',
      articles: 4,
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: 'General Questions',
      description: 'Common questions and troubleshooting',
      articles: 15,
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  const popularArticles = [
    'How to cancel or modify my booking',
    'What payment methods are accepted?',
    'How to check-in for my flight',
    'Baggage allowance and restrictions',
    'What happens if my flight is delayed?',
    'How to add special requests to my booking',
    'Travel insurance coverage details',
    'How to contact customer support'
  ];

  const faqs = [
    {
      category: 'Booking',
      question: 'How far in advance can I book a flight?',
      answer: 'You can typically book flights up to 11-12 months in advance. However, this varies by airline and route. For the best selection and prices, we recommend booking domestic flights 1-3 months ahead and international flights 2-8 months in advance.'
    },
    {
      category: 'Payment',
      question: 'Is it safe to enter my credit card information?',
      answer: 'Yes, absolutely. We use industry-standard SSL encryption to protect your payment information. All transactions are processed through secure payment gateways, and we never store your complete credit card information on our servers.'
    },
    {
      category: 'Changes',
      question: 'Can I change my flight after booking?',
      answer: 'Yes, most flights can be changed after booking, subject to airline policies and availability. Change fees may apply depending on the fare type and how close to departure you make the change. Premium and flexible fares typically have lower or no change fees.'
    },
    {
      category: 'Travel',
      question: 'What documents do I need for international travel?',
      answer: 'For international travel, you need a valid passport that doesn\'t expire within 6 months of your return date. Some countries also require visas or other documentation. Check with the embassy or consulate of your destination country for specific requirements.'
    },
    {
      category: 'Support',
      question: 'How can I contact customer support?',
      answer: 'We offer 24/7 customer support through multiple channels: phone (1-800-FLIGHTS), email (support@flightbooker.com), and live chat on our website. For urgent travel emergencies, call our emergency hotline at 1-800-URGENT-1.'
    },
    {
      category: 'Refunds',
      question: 'How long do refunds take to process?',
      answer: 'Refund processing times vary by payment method and airline policy. Credit card refunds typically take 5-10 business days to appear on your statement, while bank transfers may take 7-14 business days. We\'ll send you email updates throughout the refund process.'
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
            <h1 className="text-4xl font-bold text-gray-900">Help Center</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to your questions and get the help you need for a smooth travel experience.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help articles, FAQs, and guides..."
                className="block w-full pl-11 pr-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Search
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mb-4`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.articles} articles
                  </span>
                  <span className="text-blue-600 font-medium text-sm">
                    View All →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Articles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Popular Articles
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularArticles.map((article, index) => (
                <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700 hover:text-blue-600">{article}</span>
                </div>
              ))}
            </div>
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
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded mr-3">
                        {faq.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
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

        {/* Contact Support */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Still Need Help?
            </h2>
            <p className="text-gray-600">
              Our support team is available 24/7 to assist you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-sm text-gray-600 mb-3">1-800-FLIGHTS</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Call Now
              </button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-3">support@flightbooker.com</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Send Email
              </button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-3">Available 24/7</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Start Chat
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}