'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBooking, CATERING_OPTIONS } from '@/context/BookingContext';

export default function OptionSelection() {
  const { bookingData, updateBookingData, selectedOption } = useBooking();
  const [error, setError] = useState('');

  // Validate selection before proceeding to next step
  useEffect(() => {
    if (!bookingData.cateringOption) {
      setError('Please select a catering option to continue');
    } else {
      setError('');
    }
  }, [bookingData.cateringOption]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Select Your Catering Option</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {CATERING_OPTIONS.map((option) => (
          <div 
            key={option.id} 
            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
              bookingData.cateringOption === option.id 
                ? 'border-cherry-pink shadow-md' 
                : 'border-gray-200'
            }`}
            onClick={() => updateBookingData({ cateringOption: option.id })}
          >
            {/* Option Image Placeholder */}
            <div className="relative h-48 bg-isabelline">
              {option.id === 'white-cart' && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  White Cart Image
                </div>
              )}
              {option.id === 'pink-truck' && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Pink Truck Image
                </div>
              )}
              {option.id === 'pink-truck-pookies' && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Pink Truck Pookies Image
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start mb-3">
                <div 
                  className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-1 ${
                    bookingData.cateringOption === option.id 
                      ? 'border-cherry-pink bg-cherry-pink' 
                      : 'border-gray-300'
                  }`}
                >
                  {bookingData.cateringOption === option.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{option.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{option.priceRange}</p>
                  <p className="text-gray-600 text-sm mb-2">{option.capacity}</p>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-semibold mb-2 text-sm">Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cherry-pink mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Selected Option Summary */}
      {selectedOption && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">Selected Option: {selectedOption.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            Base price starts at ${selectedOption.basePrice}. Final price will depend on guest count, 
            duration, and any additional options you select.
          </p>
          <p className="text-sm text-gray-600">
            A 50% deposit (${selectedOption.basePrice * 0.5}) will be required to secure your booking.
          </p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      <div className="mt-6">
        <h3 className="font-bold mb-2">What happens next?</h3>
        <p className="text-gray-600">
          After selecting your catering option, you'll choose your event date and time,
          customize your menu, and provide event details before confirming your booking with a deposit.
        </p>
      </div>
    </div>
  );
}
