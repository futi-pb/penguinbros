'use client';

import { useState, useEffect } from 'react';
import { useBooking } from '@/context/BookingContext';

export default function EventDetails() {
  const { bookingData, updateBookingData } = useBooking();
  const [error, setError] = useState('');
  
  // Validate form
  useEffect(() => {
    if (!bookingData.eventAddress) {
      setError('Please enter the event address');
    } else if (!bookingData.eventCity) {
      setError('Please enter the event city');
    } else if (!bookingData.eventState) {
      setError('Please enter the event state');
    } else if (!bookingData.eventZip) {
      setError('Please enter the event zip code');
    } else if (!bookingData.contactName) {
      setError('Please enter your name');
    } else if (!bookingData.contactEmail) {
      setError('Please enter your email address');
    } else if (!bookingData.contactPhone) {
      setError('Please enter your phone number');
    } else {
      setError('');
    }
  }, [bookingData]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Event & Contact Details</h2>
      
      <form className="space-y-6">
        {/* Event Location Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Event Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="eventAddress" className="block text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                id="eventAddress"
                value={bookingData.eventAddress}
                onChange={(e) => updateBookingData({ eventAddress: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                placeholder="123 Main St"
              />
            </div>
            
            <div>
              <label htmlFor="eventCity" className="block text-gray-700 mb-2">City</label>
              <input
                type="text"
                id="eventCity"
                value={bookingData.eventCity}
                onChange={(e) => updateBookingData({ eventCity: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                placeholder="City"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventState" className="block text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  id="eventState"
                  value={bookingData.eventState}
                  onChange={(e) => updateBookingData({ eventState: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                  placeholder="State"
                />
              </div>
              
              <div>
                <label htmlFor="eventZip" className="block text-gray-700 mb-2">Zip Code</label>
                <input
                  type="text"
                  id="eventZip"
                  value={bookingData.eventZip}
                  onChange={(e) => updateBookingData({ eventZip: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                  placeholder="Zip"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Special Instructions */}
        <div>
          <h3 className="text-lg font-bold mb-4">Special Instructions</h3>
          <label htmlFor="specialInstructions" className="block text-gray-700 mb-2">
            Please provide any special instructions, dietary requirements, or venue details that will help us serve you better
          </label>
          <textarea
            id="specialInstructions"
            value={bookingData.specialInstructions}
            onChange={(e) => updateBookingData({ specialInstructions: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink h-32"
            placeholder="E.g., Venue access instructions, dietary requirements, setup preferences..."
          ></textarea>
        </div>
        
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="contactName" className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="contactName"
                value={bookingData.contactName}
                onChange={(e) => updateBookingData({ contactName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                placeholder="Your Name"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="contactEmail"
                value={bookingData.contactEmail}
                onChange={(e) => updateBookingData({ contactEmail: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                id="contactPhone"
                value={bookingData.contactPhone}
                onChange={(e) => updateBookingData({ contactPhone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                placeholder="(123) 456-7890"
              />
            </div>
          </div>
        </div>
      </form>
      
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-6">{error}</p>
      )}
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">What Happens Next?</h3>
        <p className="text-gray-600">
          After providing your event and contact details, you'll review your booking summary and secure your date with a 50% deposit payment.
          Our team will reach out to you within 24-48 hours to confirm all details and answer any questions you may have.
        </p>
      </div>
    </div>
  );
}
