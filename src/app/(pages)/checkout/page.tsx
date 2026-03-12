'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

type PickupLocation = {
  slug: string;
  name: string;
  address: string;
};

const FALLBACK_PICKUP_LOCATIONS: PickupLocation[] = [
  {
    slug: 'provo',
    name: 'Provo Store',
    address: '1200 N University Ave, Provo, UT 84604',
  },
  {
    slug: 'orem',
    name: 'Orem Store',
    address: '800 S State St, Orem, UT 84058',
  },
];

// Available pickup times (generate for the next 7 days)
const generatePickupTimes = () => {
  const times: Array<{
    dateLabel: string;
    dateValue: string;
    timeSlots: Array<{ id: string; time: string }>;
  }> = [];
  const now = new Date();
  
  // Generate dates for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);
    
    // Format the date for display
    const dateLabel = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    const dateValue = date.toISOString().split('T')[0];
    
    // Generate time slots from 12pm to 9pm (store hours)
    const timeSlots: Array<{ id: string; time: string }> = [];
    for (let hour = 12; hour <= 21; hour++) {
      const formattedHour = hour <= 12 ? `${hour}:00 PM` : `${hour - 12}:00 PM`;
      timeSlots.push({
        id: `${String(hour).padStart(2, '0')}:00`,
        time: formattedHour
      });
    }
    
    times.push({
      dateLabel,
      dateValue,
      timeSlots
    });
  }
  
  return times;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<'pickup' | 'contact' | 'payment'>('pickup');
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [pickupTimes] = useState(generatePickupTimes());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const logClientEvent = async (eventName: string, metadata: Record<string, unknown> = {}) => {
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName,
          source: 'web',
          metadata,
        }),
      });
    } catch (error) {
      console.error(`Failed to log analytics event ${eventName}:`, error);
    }
  };

  // Calculate tax and total
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  useEffect(() => {
    logClientEvent('checkout_page_view', {
      itemCount: items.length,
      subtotal,
    });
    // Intentionally only once on page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load pickup locations from backend settings
  useEffect(() => {
    let mounted = true;

    const loadPickupLocations = async () => {
      try {
        const response = await fetch('/api/pickup/locations');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to load pickup locations');
        }
        if (mounted) {
          setPickupLocations(Array.isArray(data.locations) ? data.locations : []);
        }
      } catch (error) {
        console.error('Failed to fetch pickup locations:', error);
        if (mounted) {
          setPickupLocations(FALLBACK_PICKUP_LOCATIONS);
        }
      } finally {
        if (mounted) {
          setLocationsLoading(false);
        }
      }
    };

    loadPickupLocations();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle pickup form submission
  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (pickupLocation && pickupDate && pickupTime) {
      setCheckoutStep('contact');
    }
  };

  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (contactInfo.firstName && contactInfo.lastName && contactInfo.email && contactInfo.phone) {
      setCheckoutStep('payment');
    }
  };

  // Create backend checkout session and redirect to Square Hosted Checkout
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: items.map((item) => ({
            id: item.id,
            productType: item.productType,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            catalogItemId: item.catalogItemId ?? null,
            topCookie: item.topCookie ?? null,
            bottomCookie: item.bottomCookie ?? null,
            iceCream: item.iceCream ?? null,
          })),
          customer: contactInfo,
          pickup: {
            locationSlug: pickupLocation,
            pickupDate,
            pickupTime,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create checkout.');
      }

      if (!data.checkoutUrl) {
        throw new Error('Checkout URL was not returned.');
      }

      await logClientEvent('checkout_redirected_to_square', {
        orderId: data.orderId ?? null,
        totalCents: data?.amount?.totalCents ?? null,
      });
      window.location.assign(data.checkoutUrl as string);
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to continue to checkout.';
      setCheckoutError(errorMessage);
      await logClientEvent('checkout_client_error', {
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes for contact info
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const selectedDate = pickupTimes.find((dateOption) => dateOption.dateValue === pickupDate);
  const selectedTimeLabel =
    selectedDate?.timeSlots.find((timeSlot) => timeSlot.id === pickupTime)?.time ?? pickupTime;
  const selectedLocation = pickupLocations.find((location) => location.slug === pickupLocation);

  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      
      {/* Checkout Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'pickup' ? 'bg-cherry-pink text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <div className="h-1 w-12 bg-gray-200 mx-2"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'contact' ? 'bg-cherry-pink text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <div className="h-1 w-12 bg-gray-200 mx-2"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'payment' ? 'bg-cherry-pink text-white' : 'bg-gray-200'}`}>
            3
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Step 1: Pickup Selection */}
            {checkoutStep === 'pickup' && (
              <form onSubmit={handlePickupSubmit}>
                <h2 className="text-xl font-bold mb-4">Pickup Details</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Select Location</label>
                  {locationsLoading ? (
                    <p className="text-gray-600">Loading locations...</p>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pickupLocations.map(location => (
                      <div 
                        key={location.slug}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${pickupLocation === location.slug ? 'border-cherry-pink bg-cherry-pink bg-opacity-5' : 'border-gray-200 hover:border-cherry-pink'}`}
                        onClick={() => setPickupLocation(location.slug)}
                      >
                        <div className="flex items-start">
                          <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-1 ${pickupLocation === location.slug ? 'border-cherry-pink bg-cherry-pink' : 'border-gray-300'}`}>
                            {pickupLocation === location.slug && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold">{location.name}</h3>
                            <p className="text-sm text-gray-600">{location.address}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Select Date</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  >
                    <option value="">Select a date</option>
                    {pickupTimes.map(dateOption => (
                      <option key={dateOption.dateValue} value={dateOption.dateValue}>
                        {dateOption.dateLabel}
                      </option>
                    ))}
                  </select>
                </div>
                
                {pickupDate && (
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Select Time</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {pickupTimes.find(d => d.date === pickupDate)?.timeSlots.map(slot => (
                        <div 
                          key={slot.id}
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${pickupTime === slot.id ? 'border-cherry-pink bg-cherry-pink bg-opacity-5' : 'border-gray-200 hover:border-cherry-pink'}`}
                          onClick={() => setPickupTime(slot.id)}
                        >
                          {slot.time}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <Link 
                    href="/cart" 
                    className="text-cherry-pink hover:text-cherry-pink-dark flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Cart
                  </Link>
                  <button 
                    type="submit"
                    disabled={!pickupLocation || !pickupDate || !pickupTime || locationsLoading}
                    className="bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Contact Info
                  </button>
                </div>
              </form>
            )}
            
            {/* Step 2: Contact Information */}
            {checkoutStep === 'contact' && (
              <form onSubmit={handleContactSubmit}>
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text"
                      name="firstName"
                      value={contactInfo.firstName}
                      onChange={handleContactChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text"
                      name="lastName"
                      value={contactInfo.lastName}
                      onChange={handleContactChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input 
                      type="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input 
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button 
                    type="button"
                    onClick={() => setCheckoutStep('pickup')}
                    className="text-cherry-pink hover:text-cherry-pink-dark flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Pickup
                  </button>
                  <button 
                    type="submit"
                    disabled={!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phone}
                    className="bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}
            
            {/* Step 3: Payment */}
            {checkoutStep === 'payment' && (
              <form onSubmit={handlePaymentSubmit}>
                <h2 className="text-xl font-bold mb-4">Review and Payment</h2>
                
                <div className="bg-isabelline p-4 rounded-lg mb-6">
                  <h3 className="font-bold mb-2">Pickup Details</h3>
                  <p className="text-sm"><strong>Location:</strong> {selectedLocation?.name}</p>
                  <p className="text-sm"><strong>Date:</strong> {selectedDate?.dateLabel ?? pickupDate}</p>
                  <p className="text-sm"><strong>Time:</strong> {selectedTimeLabel}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700">
                    You will be redirected to our secure Square checkout page to complete payment.
                  </p>
                </div>

                {checkoutError && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                    {checkoutError}
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button 
                    type="button"
                    onClick={() => setCheckoutStep('contact')}
                    className="text-cherry-pink hover:text-cherry-pink-dark flex items-center"
                    disabled={isSubmitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Contact
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Continue to Secure Checkout'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-[150px]">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="divide-y divide-gray-200">
              {items.map(item => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x </span>
                    <span>{item.name}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mt-6 pt-6 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            {checkoutStep === 'pickup' && (
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-500">
                  <p>Select pickup details to continue</p>
                </div>
              </div>
            )}
            
            {checkoutStep === 'contact' && (
              <div className="mt-6">
                <div className="bg-isabelline p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Pickup Details</h3>
                  <p className="text-sm">
                    <strong>Location:</strong> {selectedLocation?.name}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {selectedDate?.dateLabel ?? pickupDate}
                  </p>
                  <p className="text-sm">
                    <strong>Time:</strong> {selectedTimeLabel}
                  </p>
                </div>
              </div>
            )}
            
            {checkoutStep === 'payment' && (
              <div className="mt-6">
                <div className="bg-isabelline p-4 rounded-lg mb-4">
                  <h3 className="font-bold mb-2">Pickup Details</h3>
                  <p className="text-sm">
                    <strong>Location:</strong> {selectedLocation?.name}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {selectedDate?.dateLabel ?? pickupDate}
                  </p>
                  <p className="text-sm">
                    <strong>Time:</strong> {selectedTimeLabel}
                  </p>
                </div>
                <div className="bg-isabelline p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Contact Information</h3>
                  <p className="text-sm">
                    <strong>Name:</strong> {contactInfo.firstName} {contactInfo.lastName}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {contactInfo.email}
                  </p>
                  <p className="text-sm">
                    <strong>Phone:</strong> {contactInfo.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
