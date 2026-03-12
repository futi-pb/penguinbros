'use client';

import { useBooking, COOKIE_FLAVORS, ICE_CREAM_FLAVORS, ADD_ONS } from '@/context/BookingContext';

export default function BookingSummary() {
  const { 
    bookingData, 
    selectedOption,
    calculateSubtotal,
    calculateDeposit
  } = useBooking();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get names for selected items
  const getSelectedCookieNames = () => {
    return bookingData.selectedCookies.map(id => {
      const cookie = COOKIE_FLAVORS.find(c => c.id === id);
      return cookie ? cookie.name : '';
    }).filter(Boolean);
  };

  const getSelectedIceCreamNames = () => {
    return bookingData.selectedIceCreams.map(id => {
      const iceCream = ICE_CREAM_FLAVORS.find(c => c.id === id);
      return iceCream ? iceCream.name : '';
    }).filter(Boolean);
  };

  const getSelectedAddOnNames = () => {
    return bookingData.selectedAddOns.map(id => {
      const addon = ADD_ONS.find(a => a.id === id);
      return addon ? { name: addon.name, price: addon.price } : null;
    }).filter((addon): addon is { name: string, price: number } => addon !== null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>
      
      {selectedOption ? (
        <div className="space-y-6">
          {/* Catering Option */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Catering Package</h3>
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{selectedOption.name}</span>
                <span>{formatCurrency(selectedOption.basePrice)}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{selectedOption.description}</p>
              <p className="text-gray-600 text-sm">Capacity: {selectedOption.capacity}</p>
            </div>
          </div>
          
          {/* Event Details */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Event Details</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-1"><span className="font-medium">Date:</span> {bookingData.eventDate}</p>
                  <p className="mb-1"><span className="font-medium">Time:</span> {bookingData.eventTime}</p>
                  <p className="mb-1"><span className="font-medium">Duration:</span> {bookingData.eventDuration} hour{bookingData.eventDuration !== 1 ? 's' : ''}</p>
                  <p><span className="font-medium">Guest Count:</span> {bookingData.guestCount}</p>
                </div>
                <div>
                  <p className="mb-1"><span className="font-medium">Location:</span></p>
                  <p className="text-gray-600">
                    {bookingData.eventAddress}<br />
                    {bookingData.eventCity}, {bookingData.eventState} {bookingData.eventZip}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Selections */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Menu Selections</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium mb-2">Cookie Flavors:</h4>
                <ul className="list-disc pl-5 text-gray-600">
                  {getSelectedCookieNames().map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Ice Cream Flavors:</h4>
                <ul className="list-disc pl-5 text-gray-600">
                  {getSelectedIceCreamNames().map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
              
              {getSelectedAddOnNames().length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Add-ons:</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {getSelectedAddOnNames().map((addon, index) => (
                      <li key={index}>{addon.name} - {formatCurrency(addon.price)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Contact Information</h3>
            </div>
            <div className="p-4">
              <p className="mb-1"><span className="font-medium">Name:</span> {bookingData.contactName}</p>
              <p className="mb-1"><span className="font-medium">Email:</span> {bookingData.contactEmail}</p>
              <p><span className="font-medium">Phone:</span> {bookingData.contactPhone}</p>
            </div>
          </div>
          
          {/* Special Instructions */}
          {bookingData.specialInstructions && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="font-bold text-lg">Special Instructions</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 whitespace-pre-line">{bookingData.specialInstructions}</p>
              </div>
            </div>
          )}
          
          {/* Pricing Summary */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Pricing Summary</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Base Package ({selectedOption.name})</span>
                  <span>{formatCurrency(selectedOption.basePrice)}</span>
                </div>
                
                {/* Add-ons */}
                {getSelectedAddOnNames().map((addon, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{addon.name}</span>
                    <span>{formatCurrency(addon.price)}</span>
                  </div>
                ))}
                
                {/* Extra hours if applicable */}
                {bookingData.eventDuration > 2 && (
                  <div className="flex justify-between">
                    <span>Additional Hours ({bookingData.eventDuration - 2} hour{bookingData.eventDuration - 2 !== 1 ? 's' : ''})</span>
                    <span>{formatCurrency((bookingData.eventDuration - 2) * 200)}</span>
                  </div>
                )}
                
                {/* Guest count adjustment if applicable */}
                {bookingData.guestCount > 100 && (
                  <div className="flex justify-between">
                    <span>Additional Guest Fee ({bookingData.guestCount} guests)</span>
                    <span>{formatCurrency(selectedOption.basePrice * 0.1 * Math.ceil((bookingData.guestCount - 100) / 50))}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between font-bold text-lg">
                  <span>Required Deposit (50%)</span>
                  <span>{formatCurrency(calculateDeposit())}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  The remaining balance will be due 7 days before your event.
                </p>
              </div>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Terms and Conditions</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cherry-pink mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>A 50% deposit is required to secure your booking. The remaining balance is due 7 days prior to your event.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cherry-pink mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Cancellations made more than 30 days before your event will receive a full refund of your deposit. Cancellations within 30 days will forfeit the deposit.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cherry-pink mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Final guest count and menu selections must be confirmed 7 days prior to your event.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cherry-pink mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>By proceeding to payment, you agree to our full terms and conditions.</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">
              Please review all details carefully before proceeding to payment. If you need to make any changes, 
              you can go back to previous steps using the navigation buttons below.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">
            Please complete all previous steps before reviewing your booking summary.
          </p>
        </div>
      )}
    </div>
  );
}
