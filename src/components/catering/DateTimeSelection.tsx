'use client';

import { useState, useEffect } from 'react';
import { useBooking } from '@/context/BookingContext';

// Generate dates for the next 3 months
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  // Start from 2 weeks from now (minimum booking window)
  const startDate = new Date();
  startDate.setDate(today.getDate() + 14);
  
  // Generate dates for 3 months
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Skip dates that are already booked (this would come from a database in a real app)
    // For demo purposes, let's make some random dates unavailable
    const isUnavailable = Math.random() < 0.2; // 20% chance of being unavailable
    
    if (!isUnavailable) {
      dates.push({
        date,
        dateString: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      });
    }
  }
  
  return dates;
};

// Generate time slots
const generateTimeSlots = () => {
  const slots = [];
  
  // Available start times from 10 AM to 7 PM
  for (let hour = 10; hour <= 19; hour++) {
    const time = hour < 12 
      ? `${hour}:00 AM` 
      : hour === 12 
        ? '12:00 PM' 
        : `${hour - 12}:00 PM`;
    
    slots.push({
      id: `${hour}:00`,
      time
    });
  }
  
  return slots;
};

export default function DateTimeSelection() {
  const { bookingData, updateBookingData, selectedOption } = useBooking();
  const [availableDates, setAvailableDates] = useState(generateAvailableDates());
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [error, setError] = useState('');
  
  // Group dates by month for the month selector
  const months = [...new Set(availableDates.map(d => 
    d.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  ))];
  
  // Filter dates by selected month
  const filteredDates = selectedMonth 
    ? availableDates.filter(d => 
        d.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) === selectedMonth
      )
    : availableDates;
  
  // Set initial month when component mounts
  useEffect(() => {
    if (availableDates.length > 0 && !selectedMonth) {
      setSelectedMonth(availableDates[0].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
  }, [availableDates, selectedMonth]);

  // Validate selections
  useEffect(() => {
    if (!bookingData.eventDate) {
      setError('Please select an event date');
    } else if (!bookingData.eventTime) {
      setError('Please select an event time');
    } else {
      setError('');
    }
  }, [bookingData.eventDate, bookingData.eventTime]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Select Event Date & Time</h2>
      
      {selectedOption ? (
        <>
          {/* Date Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Event Date</h3>
            
            {/* Month selector */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Select Month</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Calendar date picker */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredDates.map((dateObj) => (
                <div
                  key={dateObj.dateString}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    bookingData.eventDate === dateObj.formattedDate
                      ? 'border-cherry-pink bg-cherry-pink bg-opacity-5'
                      : 'border-gray-200 hover:border-cherry-pink'
                  }`}
                  onClick={() => updateBookingData({ eventDate: dateObj.formattedDate })}
                >
                  <div className="text-sm font-medium">
                    {dateObj.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="font-bold">
                    {dateObj.date.toLocaleDateString('en-US', { day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Time Selection */}
          {bookingData.eventDate && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Event Time</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                      bookingData.eventTime === slot.time
                        ? 'border-cherry-pink bg-cherry-pink bg-opacity-5'
                        : 'border-gray-200 hover:border-cherry-pink'
                    }`}
                    onClick={() => updateBookingData({ eventTime: slot.time })}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Duration Selection */}
          {bookingData.eventTime && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Event Duration</h3>
              <p className="text-gray-600 mb-4">
                {selectedOption?.features.find(f => f.includes('hour'))
                  ? `Your selected package (${selectedOption.name}) includes ${
                      selectedOption.features.find(f => f.includes('hour'))?.match(/\d+/)?.[0] || '2'
                    }-hour service. Additional hours are $200 per hour.`
                  : 'Select how many hours you need service for your event.'}
              </p>
              
              <div className="flex items-center">
                <label className="mr-4">Hours:</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-l"
                    onClick={() => updateBookingData({ 
                      eventDuration: Math.max(2, bookingData.eventDuration - 1) 
                    })}
                  >
                    -
                  </button>
                  <span className="bg-gray-100 py-1 px-6">{bookingData.eventDuration}</span>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-r"
                    onClick={() => updateBookingData({ 
                      eventDuration: Math.min(8, bookingData.eventDuration + 1) 
                    })}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Selected Date/Time Summary */}
          {bookingData.eventDate && bookingData.eventTime && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-2">Selected Date & Time</h3>
              <p className="text-gray-700">
                <strong>Date:</strong> {bookingData.eventDate}
              </p>
              <p className="text-gray-700">
                <strong>Time:</strong> {bookingData.eventTime}
              </p>
              <p className="text-gray-700">
                <strong>Duration:</strong> {bookingData.eventDuration} hour{bookingData.eventDuration !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">Important Notes</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cherry-pink mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                We require a minimum of 2 weeks advance booking for all catering services.
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cherry-pink mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Setup time (30-60 minutes) is included in your booking and doesn't count toward your service hours.
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cherry-pink mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Dates shown are available based on our current schedule. If you need a specific date that's not listed, please contact us directly.
              </li>
            </ul>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">
            Please select a catering option first before choosing your date and time.
          </p>
        </div>
      )}
    </div>
  );
}
