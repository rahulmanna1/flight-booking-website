'use client';

import React, { useState, useMemo } from 'react';
import { Users, Plus, Minus, AlertCircle, Info, Check, UserPlus, Briefcase } from 'lucide-react';

interface PassengerDetails {
  id: string;
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  specialRequests?: string;
}

interface GroupBookingFormProps {
  flightPrice: number;
  onSubmit: (data: GroupBookingData) => void;
  maxPassengers?: number;
  className?: string;
}

interface GroupBookingData {
  passengers: PassengerDetails[];
  groupDiscount: number;
  totalPrice: number;
  leadPassenger: string;
  contactEmail: string;
  contactPhone: string;
  groupName?: string;
}

const GROUP_DISCOUNT_TIERS = [
  { minPassengers: 10, discount: 0.05, label: '5% off' },
  { minPassengers: 20, discount: 0.10, label: '10% off' },
  { minPassengers: 30, discount: 0.15, label: '15% off' },
  { minPassengers: 50, discount: 0.20, label: '20% off' },
];

const PASSENGER_TYPE_LABELS = {
  adult: { label: 'Adult', description: '12+ years', multiplier: 1.0 },
  child: { label: 'Child', description: '2-11 years', multiplier: 0.75 },
  infant: { label: 'Infant', description: '0-2 years', multiplier: 0.10 },
};

export default function GroupBookingForm({ 
  flightPrice, 
  onSubmit, 
  maxPassengers = 100,
  className = '' 
}: GroupBookingFormProps) {
  const [passengers, setPassengers] = useState<PassengerDetails[]>([
    {
      id: '1',
      type: 'adult',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
    },
  ]);

  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [groupName, setGroupName] = useState('');
  const [leadPassengerId, setLeadPassengerId] = useState('1');
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>('1');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const groupDiscount = useMemo(() => {
    const passengerCount = passengers.length;
    for (let i = GROUP_DISCOUNT_TIERS.length - 1; i >= 0; i--) {
      if (passengerCount >= GROUP_DISCOUNT_TIERS[i].minPassengers) {
        return GROUP_DISCOUNT_TIERS[i].discount;
      }
    }
    return 0;
  }, [passengers.length]);

  const totalPrice = useMemo(() => {
    const baseTotal = passengers.reduce((sum, passenger) => {
      const multiplier = PASSENGER_TYPE_LABELS[passenger.type].multiplier;
      return sum + (flightPrice * multiplier);
    }, 0);
    return baseTotal * (1 - groupDiscount);
  }, [passengers, flightPrice, groupDiscount]);

  const addPassenger = () => {
    if (passengers.length >= maxPassengers) return;
    
    const newPassenger: PassengerDetails = {
      id: Date.now().toString(),
      type: 'adult',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
    };
    setPassengers([...passengers, newPassenger]);
    setExpandedPassenger(newPassenger.id);
  };

  const removePassenger = (id: string) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter(p => p.id !== id));
    if (leadPassengerId === id) {
      setLeadPassengerId(passengers[0].id);
    }
    if (expandedPassenger === id) {
      setExpandedPassenger(null);
    }
  };

  const updatePassenger = (id: string, field: keyof PassengerDetails, value: string) => {
    setPassengers(passengers.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.contactEmail = 'Valid email required';
    }

    if (!contactPhone || !/^\+?[\d\s-()]+$/.test(contactPhone)) {
      newErrors.contactPhone = 'Valid phone number required';
    }

    passengers.forEach(passenger => {
      if (!passenger.firstName) {
        newErrors[`${passenger.id}-firstName`] = 'First name required';
      }
      if (!passenger.lastName) {
        newErrors[`${passenger.id}-lastName`] = 'Last name required';
      }
      if (!passenger.dateOfBirth) {
        newErrors[`${passenger.id}-dob`] = 'Date of birth required';
      }
      if (!passenger.nationality) {
        newErrors[`${passenger.id}-nationality`] = 'Nationality required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      passengers,
      groupDiscount,
      totalPrice,
      leadPassenger: leadPassengerId,
      contactEmail,
      contactPhone,
      groupName: groupName || undefined,
    });
  };

  const nextDiscountTier = useMemo(() => {
    const passengerCount = passengers.length;
    return GROUP_DISCOUNT_TIERS.find(tier => passengerCount < tier.minPassengers);
  }, [passengers.length]);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header with Group Info */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Group Booking</h2>
              </div>
              <p className="text-blue-100 mb-4">
                Manage multiple passengers and enjoy exclusive group discounts
              </p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="font-semibold">{passengers.length}</span> Passenger{passengers.length !== 1 ? 's' : ''}
                </div>
                {groupDiscount > 0 && (
                  <div className="bg-green-500/30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold">{(groupDiscount * 100).toFixed(0)}% Group Discount Applied</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-1">Total Price</div>
              <div className="text-3xl font-bold">${totalPrice.toFixed(2)}</div>
              {groupDiscount > 0 && (
                <div className="text-sm text-green-200 line-through">
                  ${(totalPrice / (1 - groupDiscount)).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Next Discount Tier Info */}
          {nextDiscountTier && (
            <div
              className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2 text-sm"
            >
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                Add {nextDiscountTier.minPassengers - passengers.length} more passenger
                {nextDiscountTier.minPassengers - passengers.length !== 1 ? 's' : ''} to unlock{' '}
                <span className="font-semibold">{nextDiscountTier.label}</span> discount!
              </span>
            </div>
          )}
        </div>

        {/* Group Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Group Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Smith Family Vacation"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="group@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contactPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Passengers List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Passengers
            </h3>
            <button
              type="button"
              onClick={addPassenger}
              disabled={passengers.length >= maxPassengers}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Passenger
            </button>
          </div>

          {passengers.map((passenger, index) => (
            <PassengerCard
              key={passenger.id}
              passenger={passenger}
              index={index}
              isExpanded={expandedPassenger === passenger.id}
              isLeadPassenger={leadPassengerId === passenger.id}
              onToggle={() => setExpandedPassenger(expandedPassenger === passenger.id ? null : passenger.id)}
              onUpdate={updatePassenger}
              onRemove={() => removePassenger(passenger.id)}
              onSetLead={() => setLeadPassengerId(passenger.id)}
              canRemove={passengers.length > 1}
              errors={errors}
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          Continue to Payment - ${totalPrice.toFixed(2)}
        </button>
      </form>
    </div>
  );
}

interface PassengerCardProps {
  passenger: PassengerDetails;
  index: number;
  isExpanded: boolean;
  isLeadPassenger: boolean;
  onToggle: () => void;
  onUpdate: (id: string, field: keyof PassengerDetails, value: string) => void;
  onRemove: () => void;
  onSetLead: () => void;
  canRemove: boolean;
  errors: Record<string, string>;
}

function PassengerCard({
  passenger,
  index,
  isExpanded,
  isLeadPassenger,
  onToggle,
  onUpdate,
  onRemove,
  onSetLead,
  canRemove,
  errors,
}: PassengerCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
            {index + 1}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {passenger.firstName || passenger.lastName
                ? `${passenger.firstName} ${passenger.lastName}`.trim()
                : `Passenger ${index + 1}`}
              {isLeadPassenger && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Lead
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {PASSENGER_TYPE_LABELS[passenger.type].label} • {PASSENGER_TYPE_LABELS[passenger.type].description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          <div
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className="border-t border-gray-200"
        >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passenger Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={passenger.type}
                    onChange={(e) => onUpdate(passenger.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(PASSENGER_TYPE_LABELS).map(([key, { label, description }]) => (
                      <option key={key} value={key}>
                        {label} ({description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => onUpdate(passenger.id, 'firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`${passenger.id}-firstName`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => onUpdate(passenger.id, 'lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`${passenger.id}-lastName`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => onUpdate(passenger.id, 'dateOfBirth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`${passenger.id}-dob`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.nationality}
                    onChange={(e) => onUpdate(passenger.id, 'nationality', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`${passenger.id}-nationality`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={passenger.passportNumber || ''}
                    onChange={(e) => onUpdate(passenger.id, 'passportNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Expiry
                  </label>
                  <input
                    type="date"
                    value={passenger.passportExpiry || ''}
                    onChange={(e) => onUpdate(passenger.id, 'passportExpiry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={passenger.specialRequests || ''}
                    onChange={(e) => onUpdate(passenger.id, 'specialRequests', e.target.value)}
                    rows={2}
                    placeholder="Dietary requirements, wheelchair assistance, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {!isLeadPassenger && (
                <button
                  type="button"
                  onClick={onSetLead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Set as Lead Passenger
                </button>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
