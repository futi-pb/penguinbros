'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BookingData, CATERING_OPTIONS, COOKIE_FLAVORS, ICE_CREAM_FLAVORS, ADD_ONS } from '@/context/BookingContext';

// BookingConfirmation props
interface BookingConfirmationProps {
  bookingId: string;
  bookingData: BookingData;
}

export default function BookingConfirmation({ bookingId, bookingData }: BookingConfirmationProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get selected option details
  const selectedOption = CATERING_OPTIONS.find(option => option.id === bookingData.cateringOption);

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
      return addon ? addon.name : '';
    }).filter(Boolean);
  };

  // Simulate sending a confirmation email
  useEffect(() => {
    console.log('Sending confirmation email to:', bookingData.contactEmail);
    // In a real application, this would trigger an API call to send an email
  }, [bookingData.contactEmail]);

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">
          Thank you for booking with Penguin Brothers Catering. We've received your deposit and secured your date.
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-8 text-left">
        <h3 className="font-bold text-lg mb-4">Booking Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-2"><span className="font-medium">Booking ID:</span> {bookingId}</p>
            <p className="mb-2"><span className="font-medium">Package:</span> {selectedOption?.name}</p>
            <p className="mb-2"><span className="font-medium">Event Date:</span> {bookingData.eventDate}</p>
            <p className="mb-2"><span className="font-medium">Event Time:</span> {bookingData.eventTime}</p>
            <p className="mb-2"><span className="font-medium">Duration:</span> {bookingData.eventDuration} hour{bookingData.eventDuration !== 1 ? 's' : ''}</p>
            <p className="mb-2"><span className="font-medium">Guest Count:</span> {bookingData.guestCount}</p>
          </div>
          
          <div>
            <p className="mb-2"><span className="font-medium">Location:</span></p>
            <p className="text-gray-600 mb-4">
              {bookingData.eventAddress}<br />
              {bookingData.eventCity}, {bookingData.eventState} {bookingData.eventZip}
            </p>
            
            <p className="mb-2"><span className="font-medium">Contact:</span></p>
            <p className="text-gray-600">
              {bookingData.contactName}<br />
              {bookingData.contactEmail}<br />
              {bookingData.contactPhone}
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-blue-100">
          <h4 className="font-medium mb-2">Menu Selections:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Cookie Flavors:</p>
              <p className="text-gray-600 text-sm">{getSelectedCookieNames().join(', ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Ice Cream Flavors:</p>
              <p className="text-gray-600 text-sm">{getSelectedIceCreamNames().join(', ')}</p>
            </div>
          </div>
          
          {getSelectedAddOnNames().length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Add-ons:</p>
              <p className="text-gray-600 text-sm">{getSelectedAddOnNames().join(', ')}</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Deposit Paid:</p>
              <p className="text-sm text-gray-600">50% of total booking cost</p>
            </div>
            <p className="font-bold text-lg">{formatCurrency(bookingData.deposit)}</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="font-medium">Balance Due:</p>
              <p className="text-sm text-gray-600">Due 7 days before event</p>
            </div>
            <p className="font-bold text-lg">{formatCurrency(bookingData.subtotal - bookingData.deposit)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
        <h3 className="font-bold text-lg mb-4">What Happens Next?</h3>
        <ol className="space-y-4">
          <li className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-cherry-pink text-white rounded-full flex items-center justify-center mr-3 mt-0.5">1</div>
            <div>
              <p className="font-medium">Confirmation Email</p>
              <p className="text-gray-600 text-sm">
                We've sent a confirmation email to {bookingData.contactEmail} with all your booking details.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-cherry-pink text-white rounded-full flex items-center justify-center mr-3 mt-0.5">2</div>
            <div>
              <p className="font-medium">Personal Follow-up</p>
              <p className="text-gray-600 text-sm">
                Our catering coordinator will contact you within 24-48 hours to confirm all details and answer any questions.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-cherry-pink text-white rounded-full flex items-center justify-center mr-3 mt-0.5">3</div>
            <div>
              <p className="font-medium">Final Confirmation</p>
              <p className="text-gray-600 text-sm">
                7 days before your event, we'll confirm final guest count and menu selections, and collect the remaining balance.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-cherry-pink text-white rounded-full flex items-center justify-center mr-3 mt-0.5">4</div>
            <div>
              <p className="font-medium">Event Day</p>
              <p className="text-gray-600 text-sm">
                We'll arrive with plenty of time to set up before your event start time. Get ready for a delicious experience!
              </p>
            </div>
          </li>
        </ol>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <Link 
          href="/"
          className="bg-cherry-pink hover:bg-cherry-pink-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Return to Home
        </Link>
        <Link 
          href="/contact"
          className="bg-white hover:bg-gray-100 text-cherry-pink border border-cherry-pink px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Contact Us
        </Link>
      </div>
      
      <p className="text-gray-600 text-sm">
        Questions about your booking? Contact us at <a href="mailto:catering@penguinbrothers.com" className="text-cherry-pink hover:underline">catering@penguinbrothers.com</a> or call <a href="tel:+18001234567" className="text-cherry-pink hover:underline">(800) 123-4567</a>.
      </p>
    </div>
  );
}
