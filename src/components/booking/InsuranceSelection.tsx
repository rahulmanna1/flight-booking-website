'use client';

import { useState } from 'react';
import { Check, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { TravelInsuranceOption, BookingInsurance } from '@/types/booking';
import { Button } from '../ui/button';

interface InsuranceSelectionProps {
  insuranceOptions: TravelInsuranceOption[];
  passengers: { id: string; name: string }[];
  tripCost: number;
  onSelectionComplete: (insurance: BookingInsurance | null) => void;
  onSkip?: () => void;
}

export default function InsuranceSelection({
  insuranceOptions,
  passengers,
  tripCost,
  onSelectionComplete,
  onSkip
}: InsuranceSelectionProps) {
  const [selectedInsurance, setSelectedInsurance] = useState<TravelInsuranceOption | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSelectInsurance = (insurance: TravelInsuranceOption) => {
    setSelectedInsurance(selectedInsurance?.id === insurance.id ? null : insurance);
    setTermsAccepted(false);
  };

  const handleSubmit = () => {
    if (!selectedInsurance) {
      onSelectionComplete(null);
      return;
    }

    const bookingInsurance: BookingInsurance = {
      insuranceId: selectedInsurance.id,
      provider: selectedInsurance.provider,
      planName: selectedInsurance.planName,
      totalCost: selectedInsurance.price,
      costPerPassenger: selectedInsurance.pricePerPassenger,
      coverage: selectedInsurance.coverage,
      coveredPassengers: passengers.map(p => p.id),
      termsAccepted,
      termsAcceptedAt: new Date().toISOString(),
    };

    onSelectionComplete(bookingInsurance);
  };

  const toggleExpand = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Protect Your Trip
        </h2>
        <p className="text-gray-600">
          Optional travel insurance for {passengers.length} passenger{passengers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Why get travel insurance?</p>
          <p>Protect yourself from unexpected cancellations, medical emergencies, baggage loss, and more.</p>
        </div>
      </div>

      {/* Insurance Plans */}
      <div className="space-y-4 mb-6">
        {insuranceOptions.map(plan => {
          const isSelected = selectedInsurance?.id === plan.id;
          const isExpanded = expandedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`border-2 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => handleSelectInsurance(plan)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Plan Header */}
                    <div className="flex items-center gap-3 mb-2">
                      {/* Selection Radio */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{plan.planName}</h3>
                          {plan.recommended && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              Recommended
                            </span>
                          )}
                          {plan.popular && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{plan.provider}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 ml-9">{plan.description}</p>

                    {/* Key Coverage Highlights */}
                    <div className="ml-9 grid grid-cols-2 gap-2 text-sm">
                      {plan.coverage.tripCancellation.covered && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Trip Cancellation (${plan.coverage.tripCancellation.maxAmount.toLocaleString()})</span>
                        </div>
                      )}
                      {plan.coverage.medicalExpenses.covered && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Medical (${plan.coverage.medicalExpenses.maxAmount.toLocaleString()})</span>
                        </div>
                      )}
                      {plan.coverage.baggageLoss.covered && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Baggage Loss (${plan.coverage.baggageLoss.maxAmount.toLocaleString()})</span>
                        </div>
                      )}
                      {plan.coverage.tripDelay.covered && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Trip Delay</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-gray-900">${plan.price}</p>
                    <p className="text-xs text-gray-500">Total for all passengers</p>
                    <p className="text-xs text-gray-500 mt-1">${plan.pricePerPassenger} per person</p>
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(plan.id);
                  }}
                  className="mt-3 ml-9 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      View Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View Full Coverage Details
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Coverage Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 ml-9 border-t border-gray-200 mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Trip Protection</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Trip Cancellation: ${plan.coverage.tripCancellation.maxAmount.toLocaleString()}</li>
                        <li>✓ Trip Interruption: ${plan.coverage.tripInterruption.maxAmount.toLocaleString()}</li>
                        <li>✓ Trip Delay: ${plan.coverage.tripDelay.compensation}/day</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Medical & Emergency</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Medical Expenses: ${plan.coverage.medicalExpenses.maxAmount.toLocaleString()}</li>
                        {plan.coverage.medicalExpenses.emergencyEvacuation && <li>✓ Emergency Evacuation</li>}
                        <li>✓ Flight Accident: ${plan.coverage.flightAccident.maxAmount.toLocaleString()}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Baggage Protection</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Baggage Loss: ${plan.coverage.baggageLoss.maxAmount.toLocaleString()}</li>
                        <li>✓ Baggage Delay: ${plan.coverage.baggageDelay.compensation}</li>
                      </ul>
                    </div>
                    {plan.coverage.covid19.covered && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">COVID-19 Coverage</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>✓ COVID-19 Protection: ${plan.coverage.covid19.maxAmount.toLocaleString()}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <a
                    href={plan.termsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-sm text-blue-600 hover:underline"
                  >
                    View Full Terms & Conditions →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Terms Acceptance */}
      {selectedInsurance && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the{' '}
              <a
                href={selectedInsurance.termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                insurance terms and conditions
              </a>
            </span>
          </label>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          onClick={() => onSkip ? onSkip() : onSelectionComplete(null)}
          variant="outline"
          className="px-6"
        >
          Skip Insurance
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={selectedInsurance !== null && !termsAccepted}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-8"
        >
          {selectedInsurance ? `Continue with Insurance ($${selectedInsurance.price})` : 'Continue without Insurance'}
        </Button>
      </div>
    </div>
  );
}
