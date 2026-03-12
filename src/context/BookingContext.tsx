'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Catering option types
export type CateringOption = {
  id: string;
  name: string;
  description: string;
  capacity: string;
  priceRange: string;
  basePrice: number; // Base price in dollars
  features: string[];
};

// Available catering options
export const CATERING_OPTIONS: CateringOption[] = [
  {
    id: 'white-cart',
    name: 'White Cart',
    description: 'Our classic white cart is perfect for smaller events and indoor venues.',
    capacity: 'Up to 100 guests',
    priceRange: '$500-$800',
    basePrice: 500,
    features: [
      '2-hour service',
      '3 cookie flavors',
      '3 ice cream flavors',
      'Branded setup',
      'Dedicated server'
    ]
  },
  {
    id: 'pink-truck',
    name: 'Pink Truck',
    description: 'Our signature pink truck is ideal for larger outdoor events and provides a stunning visual element.',
    capacity: 'Up to 300 guests',
    priceRange: '$1000-$1500',
    basePrice: 1000,
    features: [
      '3-hour service',
      '5 cookie flavors',
      '5 ice cream flavors',
      'Full branded experience',
      'Multiple serving staff',
      'Custom menu options available'
    ]
  },
  {
    id: 'pink-truck-pookies',
    name: 'Pink Truck Pookies',
    description: 'Our premium offering featuring our famous warm pookies with ice cream on top.',
    capacity: 'Up to 250 guests',
    priceRange: '$1200-$1800',
    basePrice: 1200,
    features: [
      '3-hour service',
      '4 pookie flavors',
      '4 ice cream flavors',
      'Full branded experience',
      'Multiple serving staff',
      'Includes warming equipment',
      'Custom menu options available'
    ]
  }
];

// Cookie and ice cream flavor options
export const COOKIE_FLAVORS = [
  { id: 'chocolate-chip', name: 'Chocolate Chip' },
  { id: 'sugar', name: 'Sugar' },
  { id: 'peanut-butter', name: 'Peanut Butter' },
  { id: 'double-chocolate', name: 'Double Chocolate' },
  { id: 'snickerdoodle', name: 'Snickerdoodle' },
  { id: 'oatmeal-raisin', name: 'Oatmeal Raisin' },
  { id: 'white-chocolate-macadamia', name: 'White Chocolate Macadamia' },
  { id: 'gluten-free-chocolate-chip', name: 'Gluten-Free Chocolate Chip' }
];

export const ICE_CREAM_FLAVORS = [
  { id: 'vanilla', name: 'Vanilla' },
  { id: 'chocolate', name: 'Chocolate' },
  { id: 'strawberry', name: 'Strawberry' },
  { id: 'mint-chip', name: 'Mint Chocolate Chip' },
  { id: 'cookie-dough', name: 'Cookie Dough' },
  { id: 'cookies-and-cream', name: 'Cookies and Cream' },
  { id: 'salted-caramel', name: 'Salted Caramel' },
  { id: 'dairy-free-vanilla', name: 'Dairy-Free Vanilla' },
  { id: 'dairy-free-chocolate', name: 'Dairy-Free Chocolate' }
];

// Add-on options
export const ADD_ONS = [
  { id: 'extra-hour', name: 'Extra Hour of Service', price: 200 },
  { id: 'additional-flavor', name: 'Additional Flavor', price: 50 },
  { id: 'branded-cups', name: 'Branded Cups and Napkins', price: 75 },
  { id: 'toppings-bar', name: 'Toppings Bar', price: 150 },
  { id: 'custom-menu', name: 'Custom Menu Sign', price: 50 }
];

// Booking data type
export type BookingData = {
  cateringOption: string;
  eventDate: string;
  eventTime: string;
  eventDuration: number; // in hours
  selectedCookies: string[];
  selectedIceCreams: string[];
  selectedAddOns: string[];
  guestCount: number;
  eventAddress: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  specialInstructions: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  subtotal: number;
  deposit: number;
};

// Initial booking data
const initialBookingData: BookingData = {
  cateringOption: '',
  eventDate: '',
  eventTime: '',
  eventDuration: 2,
  selectedCookies: [],
  selectedIceCreams: [],
  selectedAddOns: [],
  guestCount: 50,
  eventAddress: '',
  eventCity: '',
  eventState: '',
  eventZip: '',
  specialInstructions: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  subtotal: 0,
  deposit: 0
};

// Context type
type BookingContextType = {
  bookingData: BookingData;
  currentStep: number;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  calculateSubtotal: () => number;
  calculateDeposit: () => number;
  resetBooking: () => void;
  selectedOption: CateringOption | undefined;
};

// Create context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider component
export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
  const [currentStep, setCurrentStep] = useState(1);

  // Get the selected catering option
  const selectedOption = CATERING_OPTIONS.find(option => option.id === bookingData.cateringOption);

  // Calculate subtotal based on selections - memoized to prevent recalculation on every render
  const calculateSubtotalFromData = useCallback((data: BookingData): number => {
    let total = 0;
    
    // Add base price for selected catering option
    const option = CATERING_OPTIONS.find(opt => opt.id === data.cateringOption);
    if (option) {
      total += option.basePrice;
      
      // Add cost for additional hours beyond what's included
      const includedHoursFeature = option.features.find(f => f.includes('hour'));
      const includedHoursMatch = includedHoursFeature?.match(/\d+/);
      const baseHours = includedHoursMatch ? parseInt(includedHoursMatch[0]) : 2;
      const extraHours = Math.max(0, data.eventDuration - baseHours);
      
      if (extraHours > 0) {
        const extraHourAddon = ADD_ONS.find(addon => addon.id === 'extra-hour');
        if (extraHourAddon) {
          total += extraHourAddon.price * extraHours;
        }
      }
    }
    
    // Add cost for add-ons
    data.selectedAddOns.forEach(addonId => {
      const addon = ADD_ONS.find(a => a.id === addonId);
      if (addon) {
        total += addon.price;
      }
    });
    
    // Scale based on guest count
    if (data.guestCount > 100) {
      // Add 10% for each additional 50 guests over 100
      const additionalGroups = Math.ceil((data.guestCount - 100) / 50);
      total += total * (0.1 * additionalGroups);
    }
    
    return total;
  }, []);

  // Update booking data without causing infinite loops
  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData(prev => {
      const newData = { ...prev, ...data };
      
      // Only recalculate if price-affecting fields have changed
      const priceAffectingFieldsChanged = 
        'cateringOption' in data || 
        'eventDuration' in data || 
        'selectedAddOns' in data || 
        'guestCount' in data;
      
      if (priceAffectingFieldsChanged) {
        const subtotal = calculateSubtotalFromData(newData);
        const deposit = Math.round(subtotal * 0.5); // 50% deposit, rounded
        return { ...newData, subtotal, deposit };
      }
      
      return newData;
    });
  }, [calculateSubtotalFromData]);

  // Calculate subtotal - returns current value from state
  const calculateSubtotal = useCallback(() => {
    return bookingData.subtotal;
  }, [bookingData.subtotal]);

  // Calculate deposit - returns current value from state
  const calculateDeposit = useCallback(() => {
    return bookingData.deposit;
  }, [bookingData.deposit]);

  // Navigation functions
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  }, []);
  
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);
  
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);
  
  // Reset booking
  const resetBooking = useCallback(() => {
    setBookingData(initialBookingData);
    setCurrentStep(1);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        currentStep,
        updateBookingData,
        nextStep,
        prevStep,
        goToStep,
        calculateSubtotal,
        calculateDeposit,
        resetBooking,
        selectedOption
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// Custom hook to use the booking context
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
