'use client';

import React, { useState } from 'react';
import { usePriceAlerts } from '@/contexts/PriceAlertContext';
import { CreatePriceAlertRequest } from '@/types/priceAlert';
import AirportSearchInput from '@/components/forms/AirportSearchInput';
import { 
  Bell, 
  Plane, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings, 
  Mail, 
  Smartphone,
  AlertCircle,
  Loader,
  Check,
  X
} from 'lucide-react';

interface CreatePriceAlertProps {
  initialData?: Partial<CreatePriceAlertRequest>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePriceAlert({ initialData, onSuccess, onCancel }: CreatePriceAlertProps) {
  const { createAlert } = usePriceAlerts();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreatePriceAlertRequest>({
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    departureDate: initialData?.departureDate || '',
    returnDate: initialData?.returnDate || '',
    tripType: initialData?.tripType || 'one-way',
    passengers: initialData?.passengers || { adults: 1, children: 0, infants: 0 },
    cabinClass: initialData?.cabinClass || 'economy',
    targetPrice: initialData?.targetPrice || 0,
    currency: initialData?.currency || 'USD',
    alertType: initialData?.alertType || 'price-below',
    frequency: initialData?.frequency || 'daily',
    emailNotifications: initialData?.emailNotifications !== false,
    pushNotifications: initialData?.pushNotifications !== false,
    expiresAt: initialData?.expiresAt || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('passengers.')) {
      const passengerType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        passengers: {
          ...prev.passengers,
          [passengerType]: parseInt(value) || 0
        }
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'targetPrice') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createAlert(formData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        setError(result.error || 'Failed to create price alert');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = formData.origin && formData.destination && formData.departureDate && 
                  formData.targetPrice > 0 && formData.passengers.adults > 0;

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Price Alert Created!</h2>
          <p className="text-gray-600">
            You'll receive notifications when prices change for your {formData.origin} → {formData.destination} flight.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Price Alert</h2>
          <p className="text-gray-600 mt-2">Get notified when flight prices change</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Flight Details */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Plane className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Flight Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AirportSearchInput
                  label="From *"
                  placeholder="Origin city or airport code"
                  value={formData.origin}
                  onChange={(airportCode) => {
                    setFormData(prev => ({ ...prev, origin: airportCode }));
                    if (error) setError(null);
                  }}
                />
              </div>

              <div>
                <AirportSearchInput
                  label="To *"
                  placeholder="Destination city or airport code"
                  value={formData.destination}
                  onChange={(airportCode) => {
                    setFormData(prev => ({ ...prev, destination: airportCode }));
                    if (error) setError(null);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tripType" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Type
                </label>
                <select
                  id="tripType"
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="one-way">One Way</option>
                  <option value="round-trip">Round Trip</option>
                </select>
              </div>

              <div>
                <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date *
                </label>
                <input
                  id="departureDate"
                  name="departureDate"
                  type="date"
                  required
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              {formData.tripType === 'round-trip' && (
                <div>
                  <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    id="returnDate"
                    name="returnDate"
                    type="date"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Passengers & Cabin */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Passengers & Class</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="passengers.adults" className="block text-sm font-medium text-gray-700 mb-2">
                  Adults *
                </label>
                <input
                  id="passengers.adults"
                  name="passengers.adults"
                  type="number"
                  min="1"
                  max="9"
                  required
                  value={formData.passengers.adults}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="passengers.children" className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <input
                  id="passengers.children"
                  name="passengers.children"
                  type="number"
                  min="0"
                  max="9"
                  value={formData.passengers.children}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="passengers.infants" className="block text-sm font-medium text-gray-700 mb-2">
                  Infants
                </label>
                <input
                  id="passengers.infants"
                  name="passengers.infants"
                  type="number"
                  min="0"
                  max="9"
                  value={formData.passengers.infants}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="cabinClass" className="block text-sm font-medium text-gray-700 mb-2">
                  Cabin Class
                </label>
                <select
                  id="cabinClass"
                  name="cabinClass"
                  value={formData.cabinClass}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="economy">Economy</option>
                  <option value="premium-economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price Alert Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Price Alert Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Price ({formData.currency}) *
                </label>
                <input
                  id="targetPrice"
                  name="targetPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={formData.targetPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="alertType" className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  id="alertType"
                  name="alertType"
                  value={formData.alertType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="price-below">Price drops below target</option>
                  <option value="price-above">Price goes above target</option>
                  <option value="price-drop">Any price drop</option>
                </select>
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Check Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                Alert Expiration (Optional)
              </label>
              <input
                id="expiresAt"
                name="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-start space-x-3">
                <input
                  name="emailNotifications"
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive price alerts via email
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  name="pushNotifications"
                  type="checkbox"
                  checked={formData.pushNotifications}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive push notifications on your device
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Creating Alert...</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Create Price Alert</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}