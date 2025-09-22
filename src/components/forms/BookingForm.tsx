'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  
  // Payment details
  cardNumber: z.string().min(16, 'Valid card number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  cvv: z.string().min(3, 'Valid CVV is required'),
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  
  // Billing address
  billingAddress: z.string().min(1, 'Billing address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  totalPrice: number;
  loading?: boolean;
}

export default function BookingForm({ onSubmit, totalPrice, loading = false }: BookingFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });
  const { selectedCurrency } = useCurrency();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
        <p className="text-gray-600">Secure payment and passenger information</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Passenger Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Passenger Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                {...register('firstName')}
                placeholder="Enter first name"
                className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                  errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.firstName && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-1 duration-200">
                  <p className="text-red-700 text-sm flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">!</span>
                    </span>
                    {errors.firstName.message}
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                {...register('lastName')}
                placeholder="Enter last name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="Enter email address"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="Enter phone number"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              {...register('dateOfBirth')}
              type="date"
              className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                {...register('cardNumber')}
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  {...register('expiryDate')}
                  placeholder="MM/YY"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  {...register('cvv')}
                  placeholder="123"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  {...register('cardholderName')}
                  placeholder="John Doe"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Billing Address
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                {...register('billingAddress')}
                placeholder="123 Main Street"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  {...register('city')}
                  placeholder="New York"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  {...register('zipCode')}
                  placeholder="10001"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  {...register('country')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="JP">Japan</option>
                  <option value="AU">Australia</option>
                </select>
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Total and Submit */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-lg font-medium text-gray-700">Total Amount:</span>
              <p className="text-xs text-gray-500 mt-1">Including all taxes and fees</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">
                {selectedCurrency.symbol}{totalPrice.toLocaleString()}
              </span>
              <p className="text-sm text-gray-600">{selectedCurrency.code}</p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-8 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg transform ${
              loading
                ? 'bg-gray-400 cursor-not-allowed scale-100'
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0'
            } flex items-center justify-center space-x-3`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                <span>Complete Booking</span>
                <span className="bg-white/20 rounded-full p-1">
                  <span className="text-white text-sm">→</span>
                </span>
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-600 mt-4 flex items-center justify-center">
            <span className="w-4 h-4 text-green-600 mr-1">🔒</span>
            Secured by SSL encryption. Your information is safe with us.
          </p>
        </div>
      </form>
    </div>
  );
}