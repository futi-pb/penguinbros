'use client';

import { useState, useEffect } from 'react';
import { useBooking, COOKIE_FLAVORS, ICE_CREAM_FLAVORS, ADD_ONS } from '@/context/BookingContext';

export default function MenuCustomization() {
  const { bookingData, updateBookingData, selectedOption } = useBooking();
  const [error, setError] = useState('');
  
  // Determine max selections based on the selected catering option
  const getMaxCookieSelections = () => {
    if (!selectedOption) return 3;
    
    const cookieFeature = selectedOption.features.find(f => 
      f.includes('cookie') || f.includes('pookie')
    );
    
    if (cookieFeature) {
      const match = cookieFeature.match(/\d+/);
      return match ? parseInt(match[0]) : 3;
    }
    
    return 3; // Default
  };
  
  const getMaxIceCreamSelections = () => {
    if (!selectedOption) return 3;
    
    const iceCreamFeature = selectedOption.features.find(f => 
      f.includes('ice cream')
    );
    
    if (iceCreamFeature) {
      const match = iceCreamFeature.match(/\d+/);
      return match ? parseInt(match[0]) : 3;
    }
    
    return 3; // Default
  };
  
  const maxCookies = getMaxCookieSelections();
  const maxIceCreams = getMaxIceCreamSelections();
  
  // Handle cookie selection
  const toggleCookie = (id: string) => {
    const currentSelections = [...bookingData.selectedCookies];
    const index = currentSelections.indexOf(id);
    
    if (index === -1) {
      // Add if not at max
      if (currentSelections.length < maxCookies) {
        updateBookingData({ 
          selectedCookies: [...currentSelections, id] 
        });
      }
    } else {
      // Remove
      currentSelections.splice(index, 1);
      updateBookingData({ selectedCookies: currentSelections });
    }
  };
  
  // Handle ice cream selection
  const toggleIceCream = (id: string) => {
    const currentSelections = [...bookingData.selectedIceCreams];
    const index = currentSelections.indexOf(id);
    
    if (index === -1) {
      // Add if not at max
      if (currentSelections.length < maxIceCreams) {
        updateBookingData({ 
          selectedIceCreams: [...currentSelections, id] 
        });
      }
    } else {
      // Remove
      currentSelections.splice(index, 1);
      updateBookingData({ selectedIceCreams: currentSelections });
    }
  };
  
  // Handle add-on selection
  const toggleAddOn = (id: string) => {
    const currentSelections = [...bookingData.selectedAddOns];
    const index = currentSelections.indexOf(id);
    
    if (index === -1) {
      // Add
      updateBookingData({ 
        selectedAddOns: [...currentSelections, id] 
      });
    } else {
      // Remove
      currentSelections.splice(index, 1);
      updateBookingData({ selectedAddOns: currentSelections });
    }
  };
  
  // Validate selections
  useEffect(() => {
    if (bookingData.selectedCookies.length === 0) {
      setError('Please select at least one cookie flavor');
    } else if (bookingData.selectedIceCreams.length === 0) {
      setError('Please select at least one ice cream flavor');
    } else {
      setError('');
    }
  }, [bookingData.selectedCookies, bookingData.selectedIceCreams]);
  
  // Initialize selections if empty
  useEffect(() => {
    if (selectedOption && bookingData.selectedCookies.length === 0 && bookingData.selectedIceCreams.length === 0) {
      // Pre-select first few options as defaults
      const defaultCookies = COOKIE_FLAVORS.slice(0, maxCookies).map(c => c.id);
      const defaultIceCreams = ICE_CREAM_FLAVORS.slice(0, maxIceCreams).map(i => i.id);
      
      // Only update if we have valid defaults to prevent loops
      if (defaultCookies.length > 0 && defaultIceCreams.length > 0) {
        updateBookingData({
          selectedCookies: defaultCookies,
          selectedIceCreams: defaultIceCreams
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, maxCookies, maxIceCreams]);
  // Intentionally omitting updateBookingData from dependencies to prevent infinite loops
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customize Your Menu</h2>
      
      {selectedOption ? (
        <>
          {/* Cookie Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Cookie Flavors</h3>
              <span className="text-sm text-gray-600">
                Select up to {maxCookies} flavors
                <span className="ml-2 font-medium">
                  ({bookingData.selectedCookies.length}/{maxCookies})
                </span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COOKIE_FLAVORS.map((cookie) => {
                const isSelected = bookingData.selectedCookies.includes(cookie.id);
                const isDisabled = !isSelected && bookingData.selectedCookies.length >= maxCookies;
                
                return (
                  <div
                    key={cookie.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isDisabled 
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed' 
                        : isSelected
                          ? 'border-cherry-pink bg-cherry-pink bg-opacity-5'
                          : 'border-gray-200 hover:border-cherry-pink'
                    }`}
                    onClick={() => !isDisabled && toggleCookie(cookie.id)}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 ${
                          isSelected 
                            ? 'border-cherry-pink bg-cherry-pink' 
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span>{cookie.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Ice Cream Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Ice Cream Flavors</h3>
              <span className="text-sm text-gray-600">
                Select up to {maxIceCreams} flavors
                <span className="ml-2 font-medium">
                  ({bookingData.selectedIceCreams.length}/{maxIceCreams})
                </span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ICE_CREAM_FLAVORS.map((iceCream) => {
                const isSelected = bookingData.selectedIceCreams.includes(iceCream.id);
                const isDisabled = !isSelected && bookingData.selectedIceCreams.length >= maxIceCreams;
                
                return (
                  <div
                    key={iceCream.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isDisabled 
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed' 
                        : isSelected
                          ? 'border-cherry-pink bg-cherry-pink bg-opacity-5'
                          : 'border-gray-200 hover:border-cherry-pink'
                    }`}
                    onClick={() => !isDisabled && toggleIceCream(iceCream.id)}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 ${
                          isSelected 
                            ? 'border-cherry-pink bg-cherry-pink' 
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span>{iceCream.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Add-ons Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Additional Options</h3>
            <p className="text-gray-600 mb-4">
              Enhance your catering experience with these additional options:
            </p>
            
            <div className="space-y-3">
              {ADD_ONS.map((addon) => {
                const isSelected = bookingData.selectedAddOns.includes(addon.id);
                
                return (
                  <div
                    key={addon.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-cherry-pink bg-cherry-pink bg-opacity-5'
                        : 'border-gray-200 hover:border-cherry-pink'
                    }`}
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 ${
                            isSelected 
                              ? 'border-cherry-pink bg-cherry-pink' 
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-medium">${addon.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Guest Count Estimation */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Estimated Guest Count</h3>
            <p className="text-gray-600 mb-4">
              This helps us prepare the right amount of product for your event.
              Your final price may be adjusted based on guest count.
            </p>
            
            <div className="flex items-center">
              <label className="mr-4">Number of Guests:</label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-l"
                  onClick={() => updateBookingData({ 
                    guestCount: Math.max(25, bookingData.guestCount - 25) 
                  })}
                >
                  -
                </button>
                <input
                  type="number"
                  value={bookingData.guestCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 25) {
                      updateBookingData({ guestCount: value });
                    }
                  }}
                  className="bg-gray-100 py-1 px-4 w-20 text-center"
                  min="25"
                  step="25"
                />
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-r"
                  onClick={() => updateBookingData({ 
                    guestCount: bookingData.guestCount + 25 
                  })}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {/* Menu Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Your Menu Selections</h3>
            
            <div className="mb-2">
              <h4 className="font-medium">Cookie Flavors:</h4>
              <ul className="list-disc pl-5">
                {bookingData.selectedCookies.map(id => {
                  const cookie = COOKIE_FLAVORS.find(c => c.id === id);
                  return cookie && <li key={id}>{cookie.name}</li>;
                })}
              </ul>
            </div>
            
            <div className="mb-2">
              <h4 className="font-medium">Ice Cream Flavors:</h4>
              <ul className="list-disc pl-5">
                {bookingData.selectedIceCreams.map(id => {
                  const iceCream = ICE_CREAM_FLAVORS.find(c => c.id === id);
                  return iceCream && <li key={id}>{iceCream.name}</li>;
                })}
              </ul>
            </div>
            
            {bookingData.selectedAddOns.length > 0 && (
              <div>
                <h4 className="font-medium">Add-ons:</h4>
                <ul className="list-disc pl-5">
                  {bookingData.selectedAddOns.map(id => {
                    const addon = ADD_ONS.find(a => a.id === id);
                    return addon && <li key={id}>{addon.name} (${addon.price})</li>;
                  })}
                </ul>
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">Special Requests</h3>
            <p className="text-gray-600 mb-3">
              If you have any special requests or dietary requirements, you'll be able to note them in the next step.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">
            Please select a catering option and event date/time before customizing your menu.
          </p>
        </div>
      )}
    </div>
  );
}
