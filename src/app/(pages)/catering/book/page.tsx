'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookingProvider, useBooking, CATERING_OPTIONS } from '@/context/BookingContext';

// Booking steps components
import OptionSelection from '@/components/catering/OptionSelection';
import DateTimeSelection from '@/components/catering/DateTimeSelection';
import MenuCustomization from '@/components/catering/MenuCustomization';
import EventDetails from '@/components/catering/EventDetails';
import BookingSummary from '@/components/catering/BookingSummary';
import PaymentForm from '@/components/catering/PaymentForm';
import BookingConfirmation from '@/components/catering/BookingConfirmation';

// Component that uses search params - wrapped in its own component for Suspense
function BookingFormWithParams() {
  const searchParams = useSearchParams();
  const { 
    bookingData, 
    updateBookingData, 
    currentStep, 
    nextStep, 
    prevStep, 
    goToStep,
    resetBooking
  } = useBooking();
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Handle pre-selected option from URL params
  useEffect(() => {
    const optionParam = searchParams.get('option');
    if (optionParam && CATERING_OPTIONS.some(opt => opt.id === optionParam)) {
      updateBookingData({ cateringOption: optionParam });
    }
  }, [searchParams, updateBookingData]);

  // Handle booking completion
  const completeBooking = () => {
    // Generate a random booking ID
    const randomBookingId = Math.floor(100000 + Math.random() * 900000).toString();
    setBookingId(randomBookingId);
    setBookingComplete(true);
    
    // In a real application, this would send the booking data to a server
    console.log('Booking completed:', bookingData);
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-3xl font-bold mb-6 text-center">Book Your Catering</h1>
      
      {/* Progress Steps */}
      {!bookingComplete && (
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            {/* Progress bar */}
            <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 transform -translate-y-1/2 z-0">
              <div 
                className="h-1 bg-cherry-pink transition-all duration-300" 
                style={{ width: `${(currentStep - 1) * 20}%` }}
              ></div>
            </div>
            
            {/* Step circles */}
            {['Option', 'Date & Time', 'Menu', 'Details', 'Summary', 'Payment'].map((label, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              
              return (
                <div 
                  key={stepNum}
                  className="flex flex-col items-center relative z-10"
                  onClick={() => isCompleted && goToStep(stepNum)}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      isActive ? 'bg-cherry-pink text-white' : 
                      isCompleted ? 'bg-cherry-pink text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-cherry-pink font-bold' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Current step content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {bookingComplete ? (
          <BookingConfirmation bookingId={bookingId} bookingData={bookingData} />
        ) : (
          <>
            {currentStep === 1 && <OptionSelection />}
            {currentStep === 2 && <DateTimeSelection />}
            {currentStep === 3 && <MenuCustomization />}
            {currentStep === 4 && <EventDetails />}
            {currentStep === 5 && <BookingSummary />}
            {currentStep === 6 && <PaymentForm onComplete={completeBooking} />}
          </>
        )}
      </div>
      
      {/* Navigation buttons */}
      {!bookingComplete && currentStep !== 6 && (
        <div className="flex justify-between">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="text-cherry-pink hover:text-cherry-pink-dark flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          ) : (
            <Link 
              href="/catering"
              className="text-cherry-pink hover:text-cherry-pink-dark flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Catering
            </Link>
          )}
          
          <button
            onClick={nextStep}
            className="bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

// Main booking form component that uses the booking context
function BookingForm() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading booking form...</div>}>
      <BookingFormWithParams />
    </Suspense>
  );
}

// Page component that wraps everything with the provider
export default function BookingPage() {
  return (
    <BookingProvider>
      <BookingForm />
    </BookingProvider>
  );
}
