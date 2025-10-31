'use client';

import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';

interface PromoCodeInputProps {
  userId: string;
  bookingAmount: number;
  route?: { origin: string; destination: string };
  airline?: string;
  onPromoApplied: (discount: number, promoCodeId: string) => void;
  onPromoRemoved: () => void;
}

interface AppliedPromo {
  id: string;
  code: string;
  description: string;
  discountAmount: number;
  finalAmount: number;
}

export default function PromoCodeInput({
  userId,
  bookingAmount,
  route,
  airline,
  onPromoApplied,
  onPromoRemoved,
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          userId,
          bookingAmount,
          route,
          airline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to validate promo code');
        return;
      }

      if (!data.valid) {
        setError(data.message || 'Invalid promo code');
        return;
      }

      // Success - apply promo code
      setAppliedPromo({
        id: data.promoCode.id,
        code: data.promoCode.code,
        description: data.promoCode.description,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
      });

      onPromoApplied(data.discountAmount, data.promoCode.id);
      setPromoCode('');
      setError('');
    } catch (error) {
      console.error('❌ Error validating promo code:', error);
      setError('Failed to validate promo code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setError('');
    onPromoRemoved();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromo();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Promo Code</h3>
      </div>

      {!appliedPromo ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter promo code"
              disabled={isValidating}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 uppercase"
            />
            <button
              onClick={handleApplyPromo}
              disabled={isValidating || !promoCode.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2 flex-1">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-900">
                    {appliedPromo.code}
                  </span>
                  <span className="text-sm text-green-700">Applied!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {appliedPromo.description}
                </p>
                <p className="text-sm font-semibold text-green-900 mt-2">
                  You saved ${appliedPromo.discountAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-green-700 hover:text-green-900 ml-2"
              aria-label="Remove promo code"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
