'use client';

import { useState } from 'react';
import { Check, Info, Utensils, AlertCircle } from 'lucide-react';
import { MealOption, PassengerMealSelection } from '@/types/booking';
import { Button } from '../ui/button';

interface MealSelectionProps {
  flightNumber: string;
  segmentId: string;
  passengers: { id: string; name: string }[];
  availableMeals: MealOption[];
  onSelectionComplete: (selections: PassengerMealSelection[]) => void;
  onSkip?: () => void;
}

export default function MealSelection({
  flightNumber,
  segmentId,
  passengers,
  availableMeals,
  onSelectionComplete,
  onSkip
}: MealSelectionProps) {
  const [selections, setSelections] = useState<{ [passengerId: string]: MealOption | null }>({});

  const handleMealSelect = (passengerId: string, meal: MealOption) => {
    setSelections(prev => ({
      ...prev,
      [passengerId]: prev[passengerId]?.id === meal.id ? null : meal,
    }));
  };

  const handleSubmit = () => {
    const finalSelections: PassengerMealSelection[] = passengers
      .filter(p => selections[p.id])
      .map(p => ({
        passengerId: p.id,
        passengerName: p.name,
        segmentId,
        flightNumber,
        mealId: selections[p.id]!.id,
        mealCode: selections[p.id]!.code,
        mealName: selections[p.id]!.name,
        price: selections[p.id]!.price,
        dietaryRestrictions: [selections[p.id]!.category],
        allergens: selections[p.id]!.allergens || [],
      }));
    
    onSelectionComplete(finalSelections);
  };

  const totalCost = Object.values(selections).reduce((sum, meal) => sum + (meal?.price || 0), 0);

  const getMealIcon = (category: string) => {
    switch (category) {
      case 'vegetarian': return '🥗';
      case 'vegan': return '🌱';
      case 'kosher': return '✡️';
      case 'halal': return '☪️';
      case 'gluten-free': return '🌾';
      case 'child': return '🧒';
      default: return '🍽️';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-blue-600" />
          Select Meals & Dietary Preferences
        </h2>
        <p className="text-gray-600">Flight {flightNumber}</p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Meal Service Information</p>
          <p>Pre-order your meal to ensure availability. Special dietary requirements can be accommodated.</p>
        </div>
      </div>

      {/* Passenger Meal Selections */}
      <div className="space-y-6">
        {passengers.map(passenger => (
          <div key={passenger.id} className="border border-gray-200 rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{passenger.name}</h3>
              {selections[passenger.id] && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Selected: {selections[passenger.id]!.name} (+${selections[passenger.id]!.price})
                </p>
              )}
            </div>

            {/* Available Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableMeals.filter(m => m.available).map(meal => {
                const isSelected = selections[passenger.id]?.id === meal.id;
                
                return (
                  <div
                    key={meal.id}
                    onClick={() => handleMealSelect(passenger.id, meal)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Selection Check */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    {/* Meal Icon */}
                    <div className="text-3xl mb-2">
                      {getMealIcon(meal.category)}
                    </div>

                    {/* Meal Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{meal.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                      
                      {/* Category Badge */}
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium mb-2">
                        {meal.category.replace('-', ' ')}
                      </span>

                      {/* Allergens Warning */}
                      {meal.allergens && meal.allergens.length > 0 && (
                        <div className="flex items-start gap-1 mt-2 text-xs text-orange-600">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>Contains: {meal.allergens.join(', ')}</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          ${meal.price}
                        </span>
                        {meal.nutritionInfo && (
                          <span className="text-xs text-gray-500">
                            {meal.nutritionInfo.calories} cal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Selection Option */}
            <button
              onClick={() => setSelections(prev => ({ ...prev, [passenger.id]: null }))}
              className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              No meal preference for this passenger
            </button>
          </div>
        ))}
      </div>

      {/* Total Cost Summary */}
      {totalCost > 0 && (
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Meal Cost:</span>
            <span className="text-2xl font-bold text-green-600">${totalCost}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <Button
          type="button"
          onClick={onSkip}
          variant="outline"
          className="px-6"
        >
          Skip Meal Selection
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
