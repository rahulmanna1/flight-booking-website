'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Luggage, Plus, Minus, Info, AlertCircle, ShoppingBag, Weight, Package } from 'lucide-react';

interface BaggageItem {
  id: string;
  type: 'carry-on' | 'checked' | 'oversized';
  weight: number;
  description?: string;
}

interface BaggageCalculatorProps {
  passengerCount: number;
  flightClass: 'economy' | 'premium-economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip';
  onSubmit: (data: BaggageData) => void;
  className?: string;
}

interface BaggageData {
  items: BaggageItem[];
  totalWeight: number;
  totalCost: number;
  includedBags: number;
  additionalBags: number;
}

const BAGGAGE_TYPES = {
  'carry-on': {
    label: 'Carry-On',
    maxWeight: 10, // kg
    dimensions: '55 x 40 x 23 cm',
    basePrice: 0,
    icon: ShoppingBag,
    description: 'One personal item + one carry-on bag',
  },
  'checked': {
    label: 'Checked Bag',
    maxWeight: 23, // kg
    dimensions: '158 cm total (L+W+H)',
    basePrice: 35,
    icon: Luggage,
    description: 'Standard checked baggage',
  },
  'oversized': {
    label: 'Oversized/Sports Equipment',
    maxWeight: 32, // kg
    dimensions: 'Up to 277 cm total',
    basePrice: 150,
    icon: Package,
    description: 'Bikes, golf clubs, skis, etc.',
  },
};

const CLASS_ALLOWANCES = {
  'economy': { carryOn: 1, checked: 0, weightLimit: 23 },
  'premium-economy': { carryOn: 2, checked: 1, weightLimit: 23 },
  'business': { carryOn: 2, checked: 2, weightLimit: 32 },
  'first': { carryOn: 2, checked: 3, weightLimit: 32 },
};

const OVERWEIGHT_FEE_PER_KG = 15;
const EXTRA_BAG_MULTIPLIER = 1.5;

export default function BaggageCalculator({
  passengerCount,
  flightClass,
  tripType,
  onSubmit,
  className = '',
}: BaggageCalculatorProps) {
  const [baggageItems, setBaggageItems] = useState<BaggageItem[]>([]);
  const [selectedType, setSelectedType] = useState<keyof typeof BAGGAGE_TYPES>('checked');
  const [customWeight, setCustomWeight] = useState<string>('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const allowance = CLASS_ALLOWANCES[flightClass];

  const calculatedData = useMemo(() => {
    const carryOnCount = baggageItems.filter(item => item.type === 'carry-on').length;
    const checkedCount = baggageItems.filter(item => item.type === 'checked').length;
    const oversizedCount = baggageItems.filter(item => item.type === 'oversized').length;

    const includedCarryOn = Math.min(carryOnCount, allowance.carryOn * passengerCount);
    const includedChecked = Math.min(checkedCount, allowance.checked * passengerCount);
    
    const additionalCarryOn = Math.max(0, carryOnCount - includedCarryOn);
    const additionalChecked = Math.max(0, checkedCount - includedChecked);

    let totalCost = 0;

    // Calculate costs for additional carry-on bags
    totalCost += additionalCarryOn * BAGGAGE_TYPES['carry-on'].basePrice * EXTRA_BAG_MULTIPLIER;

    // Calculate costs for checked bags
    baggageItems.forEach(item => {
      if (item.type === 'checked') {
        const basePrice = BAGGAGE_TYPES.checked.basePrice;
        const isAdditional = checkedCount > (allowance.checked * passengerCount);
        const itemCost = isAdditional ? basePrice * EXTRA_BAG_MULTIPLIER : basePrice;
        
        // Add overweight fees
        if (item.weight > allowance.weightLimit) {
          const overweight = item.weight - allowance.weightLimit;
          totalCost += overweight * OVERWEIGHT_FEE_PER_KG;
        }
        
        if (isAdditional || (allowance.checked === 0)) {
          totalCost += itemCost;
        }
      } else if (item.type === 'oversized') {
        totalCost += BAGGAGE_TYPES.oversized.basePrice;
        
        // Oversized overweight fees
        if (item.weight > BAGGAGE_TYPES.oversized.maxWeight) {
          const overweight = item.weight - BAGGAGE_TYPES.oversized.maxWeight;
          totalCost += overweight * OVERWEIGHT_FEE_PER_KG;
        }
      }
    });

    // Apply round-trip discount
    if (tripType === 'round-trip') {
      totalCost *= 2;
    }

    const totalWeight = baggageItems.reduce((sum, item) => sum + item.weight, 0);
    const totalIncluded = includedCarryOn + includedChecked;
    const totalAdditional = additionalCarryOn + additionalChecked + oversizedCount;

    return {
      items: baggageItems,
      totalWeight,
      totalCost,
      includedBags: totalIncluded,
      additionalBags: totalAdditional,
    };
  }, [baggageItems, flightClass, passengerCount, allowance, tripType]);

  const addBaggage = () => {
    const weight = parseFloat(customWeight) || BAGGAGE_TYPES[selectedType].maxWeight;
    
    if (weight <= 0 || weight > 100) {
      return;
    }

    const newItem: BaggageItem = {
      id: Date.now().toString(),
      type: selectedType,
      weight,
      description: description || undefined,
    };

    setBaggageItems([...baggageItems, newItem]);
    setCustomWeight('');
    setDescription('');
    setShowAddForm(false);
  };

  const removeBaggage = (id: string) => {
    setBaggageItems(baggageItems.filter(item => item.id !== id));
  };

  const updateBaggageWeight = (id: string, weight: number) => {
    if (weight <= 0 || weight > 100) return;
    
    setBaggageItems(baggageItems.map(item =>
      item.id === id ? { ...item, weight } : item
    ));
  };

  const handleSubmit = () => {
    onSubmit(calculatedData);
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Luggage className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Baggage Calculator</h2>
                  <p className="text-sm text-gray-600">
                    {flightClass.charAt(0).toUpperCase() + flightClass.slice(1).replace('-', ' ')} Class
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total Cost</div>
              <div className="text-3xl font-bold text-gray-900">
                ${calculatedData.totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {tripType === 'round-trip' ? 'Round-trip' : 'One-way'}
              </div>
            </div>
          </div>

          {/* Allowance Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-center">
              <div className="text-xs text-blue-600 font-medium mb-1">Carry-On Included</div>
              <div className="text-lg font-bold text-blue-900">{allowance.carryOn * passengerCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-600 font-medium mb-1">Checked Included</div>
              <div className="text-lg font-bold text-blue-900">{allowance.checked * passengerCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-600 font-medium mb-1">Weight Limit</div>
              <div className="text-lg font-bold text-blue-900">{allowance.weightLimit} kg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-600 font-medium mb-1">Total Weight</div>
              <div className="text-lg font-bold text-blue-900">{calculatedData.totalWeight.toFixed(1)} kg</div>
            </div>
          </div>
        </div>

        {/* Current Baggage List */}
        {baggageItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Baggage</h3>
            <div className="space-y-3">
              {baggageItems.map((item, index) => {
                const bagType = BAGGAGE_TYPES[item.type];
                const Icon = bagType.icon;
                const isOverweight = item.weight > (item.type === 'oversized' ? bagType.maxWeight : allowance.weightLimit);
                const isIncluded = 
                  (item.type === 'carry-on' && index < allowance.carryOn * passengerCount) ||
                  (item.type === 'checked' && index < allowance.checked * passengerCount);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isOverweight ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isOverweight ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isOverweight ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{bagType.label}</span>
                          {isIncluded && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Included
                            </span>
                          )}
                          {isOverweight && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Overweight
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Weight className="w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              value={item.weight}
                              onChange={(e) => updateBaggageWeight(item.id, parseFloat(e.target.value))}
                              min="0.1"
                              max="100"
                              step="0.1"
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-600">kg</span>
                          </div>
                          {isOverweight && (
                            <span className="text-xs text-red-600 font-medium">
                              +${((item.weight - (item.type === 'oversized' ? bagType.maxWeight : allowance.weightLimit)) * OVERWEIGHT_FEE_PER_KG).toFixed(2)} overweight fee
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBaggage(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Baggage Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Baggage
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Baggage</h3>
              
              {/* Baggage Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(BAGGAGE_TYPES).map(([key, value]) => {
                  const Icon = value.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedType(key as keyof typeof BAGGAGE_TYPES)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedType === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedType === key ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            selectedType === key ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{value.label}</div>
                          <div className="text-xs text-gray-600 mb-2">{value.description}</div>
                          <div className="text-xs text-gray-500">
                            Max: {value.maxWeight}kg • {value.dimensions}
                          </div>
                          {value.basePrice > 0 && (
                            <div className="text-sm font-semibold text-blue-600 mt-2">
                              ${value.basePrice}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Weight Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    placeholder={`Max ${BAGGAGE_TYPES[selectedType].maxWeight} kg`}
                    min="0.1"
                    max="100"
                    step="0.1"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                    <Info className="w-4 h-4" />
                    <span>Max: {BAGGAGE_TYPES[selectedType].maxWeight}kg</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Golf clubs, Surfboard, Extra clothes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={addBaggage}
                  disabled={!customWeight || parseFloat(customWeight) <= 0}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Add Baggage
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setCustomWeight('');
                    setDescription('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Submit */}
        {baggageItems.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-blue-100 text-sm mb-1">Total Bags</div>
                <div className="text-2xl font-bold">{baggageItems.length}</div>
              </div>
              <div>
                <div className="text-blue-100 text-sm mb-1">Included</div>
                <div className="text-2xl font-bold">{calculatedData.includedBags}</div>
              </div>
              <div>
                <div className="text-blue-100 text-sm mb-1">Additional</div>
                <div className="text-2xl font-bold">{calculatedData.additionalBags}</div>
              </div>
              <div>
                <div className="text-blue-100 text-sm mb-1">Total Cost</div>
                <div className="text-2xl font-bold">${calculatedData.totalCost.toFixed(2)}</div>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full bg-white text-blue-600 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Continue to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
