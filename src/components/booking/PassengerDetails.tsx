'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  issuingCountry: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  frequentFlyerNumber?: string;
  knownTravelerNumber?: string;
  redressNumber?: string;
}

interface PassengerDetailsProps {
  passengers: number;
  children: number;
  infants: number;
  onSubmit: (passengers: Passenger[], contactInfo: ContactInfo) => void;
  onBack: () => void;
}

interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Russia', 'South Korea',
  'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Belgium', 'Austria'
];

const specialRequestOptions = [
  'Wheelchair assistance',
  'Special meal (vegetarian)',
  'Special meal (vegan)', 
  'Special meal (kosher)',
  'Special meal (halal)',
  'Extra legroom seat',
  'Traveling with infant',
  'Unaccompanied minor',
  'Assistance with boarding',
  'Medical equipment'
];

export default function PassengerDetails({ passengers, children, infants, onSubmit, onBack }: PassengerDetailsProps) {
  const [passengerList, setPassengerList] = useState<Passenger[]>(() => {
    const initialPassengers: Passenger[] = [];
    
    // Create adult passengers
    for (let i = 0; i < passengers; i++) {
      initialPassengers.push({
        id: `adult-${i + 1}`,
        type: 'adult',
        firstName: '',
        lastName: '',
        gender: 'male',
        dateOfBirth: '',
        nationality: 'United States',
        passportNumber: '',
        passportExpiry: '',
        issuingCountry: 'United States',
        email: i === 0 ? '' : undefined, // Only first passenger needs email
        phone: i === 0 ? '' : undefined, // Only first passenger needs phone
        specialRequests: '',
        frequentFlyerNumber: '',
        knownTravelerNumber: '',
        redressNumber: ''
      });
    }
    
    // Create child passengers
    for (let i = 0; i < children; i++) {
      initialPassengers.push({
        id: `child-${i + 1}`,
        type: 'child',
        firstName: '',
        lastName: '',
        gender: 'male',
        dateOfBirth: '',
        nationality: 'United States',
        passportNumber: '',
        passportExpiry: '',
        issuingCountry: 'United States',
        specialRequests: ''
      });
    }
    
    // Create infant passengers
    for (let i = 0; i < infants; i++) {
      initialPassengers.push({
        id: `infant-${i + 1}`,
        type: 'infant',
        firstName: '',
        lastName: '',
        gender: 'male',
        dateOfBirth: '',
        nationality: 'United States',
        passportNumber: '',
        passportExpiry: '',
        issuingCountry: 'United States'
      });
    }
    
    return initialPassengers;
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    alternatePhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'spouse'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updatePassenger = (id: string, field: keyof Passenger, value: string) => {
    setPassengerList(prev => prev.map(passenger => 
      passenger.id === id ? { ...passenger, [field]: value } : passenger
    ));
    
    // Clear error when user starts typing
    if (errors[`${id}-${field}`]) {
      setErrors(prev => ({ ...prev, [`${id}-${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate each passenger
    passengerList.forEach(passenger => {
      if (!passenger.firstName.trim()) {
        newErrors[`${passenger.id}-firstName`] = 'First name is required';
      }
      if (!passenger.lastName.trim()) {
        newErrors[`${passenger.id}-lastName`] = 'Last name is required';
      }
      if (!passenger.dateOfBirth) {
        newErrors[`${passenger.id}-dateOfBirth`] = 'Date of birth is required';
      }
      if (!passenger.passportNumber.trim()) {
        newErrors[`${passenger.id}-passportNumber`] = 'Passport number is required';
      }
      if (!passenger.passportExpiry) {
        newErrors[`${passenger.id}-passportExpiry`] = 'Passport expiry is required';
      }
      
      // Email required for primary passenger
      if (passenger.email !== undefined && !passenger.email.trim()) {
        newErrors[`${passenger.id}-email`] = 'Email is required';
      }
      if (passenger.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
        newErrors[`${passenger.id}-email`] = 'Valid email is required';
      }
      
      // Phone required for primary passenger
      if (passenger.phone !== undefined && !passenger.phone.trim()) {
        newErrors[`${passenger.id}-phone`] = 'Phone number is required';
      }
    });

    // Validate contact info
    if (!contactInfo.email.trim()) {
      newErrors['contact-email'] = 'Contact email is required';
    }
    if (!contactInfo.phone.trim()) {
      newErrors['contact-phone'] = 'Contact phone is required';
    }
    if (!contactInfo.emergencyContactName.trim()) {
      newErrors['emergency-name'] = 'Emergency contact name is required';
    }
    if (!contactInfo.emergencyContactPhone.trim()) {
      newErrors['emergency-phone'] = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(passengerList, contactInfo);
    }
  };

  const getPassengerTitle = (passenger: Passenger, index: number) => {
    const typeTitle = passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1);
    const number = passengerList.filter(p => p.type === passenger.type).indexOf(passenger) + 1;
    return `${typeTitle} Passenger ${number}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Passenger Details</h2>
        <p className="text-gray-600 mt-2">Please provide information for all travelers</p>
      </div>

      {/* Passenger Forms */}
      <div className="space-y-8">
        {passengerList.map((passenger, index) => (
          <div key={passenger.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                {getPassengerTitle(passenger, index)}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                passenger.type === 'adult' ? 'bg-blue-100 text-blue-800' :
                passenger.type === 'child' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {passenger.type.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={passenger.firstName}
                  onChange={(e) => updatePassenger(passenger.id, 'firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`${passenger.id}-firstName`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors[`${passenger.id}-firstName`] && (
                  <p className="text-red-600 text-xs mt-1">{errors[`${passenger.id}-firstName`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(passenger.id, 'lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`${passenger.id}-lastName`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors[`${passenger.id}-lastName`] && (
                  <p className="text-red-600 text-xs mt-1">{errors[`${passenger.id}-lastName`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={passenger.gender}
                  onChange={(e) => updatePassenger(passenger.id, 'gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(e) => updatePassenger(passenger.id, 'dateOfBirth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`${passenger.id}-dateOfBirth`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors[`${passenger.id}-dateOfBirth`] && (
                  <p className="text-red-600 text-xs mt-1">{errors[`${passenger.id}-dateOfBirth`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality *
                </label>
                <select
                  value={passenger.nationality}
                  onChange={(e) => updatePassenger(passenger.id, 'nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Passport Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number *
                </label>
                <input
                  type="text"
                  value={passenger.passportNumber}
                  onChange={(e) => updatePassenger(passenger.id, 'passportNumber', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`${passenger.id}-passportNumber`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter passport number"
                />
                {errors[`${passenger.id}-passportNumber`] && (
                  <p className="text-red-600 text-xs mt-1">{errors[`${passenger.id}-passportNumber`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Expiry Date *
                </label>
                <input
                  type="date"
                  value={passenger.passportExpiry}
                  onChange={(e) => updatePassenger(passenger.id, 'passportExpiry', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`${passenger.id}-passportExpiry`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors[`${passenger.id}-passportExpiry`] && (
                  <p className="text-red-600 text-xs mt-1">{errors[`${passenger.id}-passportExpiry`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuing Country *
                </label>
                <select
                  value={passenger.issuingCountry}
                  onChange={(e) => updatePassenger(passenger.id, 'issuingCountry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Contact info for primary passenger */}
              {passenger.email !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => updatePassenger(passenger.id, 'email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`${passenger.id}-email`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors[`${passenger.id}-email`] && (
                    <p className="text-red-600 text-xs mt-1">{errors[`${passenger.id}-email`]}</p>
                  )}
                </div>
              )}

              {passenger.phone !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={passenger.phone}
                    onChange={(e) => updatePassenger(passenger.id, 'phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`${passenger.id}-phone`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors[`${passenger.id}-phone`] && (
                    <p className="text-red-600 text-xs mt-1">{errors[`${passenger.id}-phone`]}</p>
                  )}
                </div>
              )}

              {/* Frequent Flyer and TSA Info for adults */}
              {passenger.type === 'adult' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequent Flyer Number
                    </label>
                    <input
                      type="text"
                      value={passenger.frequentFlyerNumber}
                      onChange={(e) => updatePassenger(passenger.id, 'frequentFlyerNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Known Traveler Number (TSA PreCheck)
                    </label>
                    <input
                      type="text"
                      value={passenger.knownTravelerNumber}
                      onChange={(e) => updatePassenger(passenger.id, 'knownTravelerNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Redress Number
                    </label>
                    <input
                      type="text"
                      value={passenger.redressNumber}
                      onChange={(e) => updatePassenger(passenger.id, 'redressNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>
                </>
              )}

              {/* Special Requests */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={passenger.specialRequests}
                  onChange={(e) => updatePassenger(passenger.id, 'specialRequests', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special assistance needed, dietary requirements, etc."
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {specialRequestOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        const current = passenger.specialRequests || '';
                        const newRequest = current ? `${current}, ${option}` : option;
                        updatePassenger(passenger.id, 'specialRequests', newRequest);
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      + {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors['contact-email'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="booking@example.com"
            />
            {errors['contact-email'] && (
              <p className="text-red-600 text-xs mt-1">{errors['contact-email']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors['contact-phone'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors['contact-phone'] && (
              <p className="text-red-600 text-xs mt-1">{errors['contact-phone']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alternate Phone
            </label>
            <input
              type="tel"
              value={contactInfo.alternatePhone}
              onChange={(e) => setContactInfo(prev => ({ ...prev, alternatePhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 987-6543"
            />
          </div>

          {/* Emergency Contact */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={contactInfo.emergencyContactName}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['emergency-name'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Emergency contact name"
                />
                {errors['emergency-name'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['emergency-name']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={contactInfo.emergencyContactPhone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['emergency-phone'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors['emergency-phone'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['emergency-phone']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship *
                </label>
                <select
                  value={contactInfo.emergencyContactRelation}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-2">Important Information:</p>
            <ul className="space-y-1">
              <li>• Ensure all names match exactly as they appear on your passport</li>
              <li>• Passport must be valid for at least 6 months from travel date</li>
              <li>• Contact information will be used for booking confirmation and updates</li>
              <li>• Special requests are subject to availability and may incur additional fees</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back to Seats
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}