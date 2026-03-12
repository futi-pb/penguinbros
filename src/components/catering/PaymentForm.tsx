'use client';

import { useState } from 'react';
import { useBooking } from '@/context/BookingContext';

// Payment form props
interface PaymentFormProps {
  onComplete: () => void;
}

export default function PaymentForm({ onComplete }: PaymentFormProps) {
  const { bookingData, calculateDeposit } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    zipCode: ''
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiration date
  const formatExpirationDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s+/g, '').length < 16) {
      setPaymentError('Please enter a valid card number');
      return;
    }
    
    if (!cardDetails.expirationDate || cardDetails.expirationDate.length < 5) {
      setPaymentError('Please enter a valid expiration date (MM/YY)');
      return;
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setPaymentError('Please enter a valid CVV code');
      return;
    }
    
    if (!cardDetails.zipCode || cardDetails.zipCode.length < 5) {
      setPaymentError('Please enter a valid zip code');
      return;
    }
    
    // Process payment
    setIsProcessing(true);
    setPaymentError('');
    
    // Simulate payment processing with Square
    // In a real implementation, this would integrate with Square Web Payments SDK
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Secure Payment</h2>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">Deposit Amount:</h3>
            <p className="text-gray-600">50% of total booking cost</p>
          </div>
          <div className="text-2xl font-bold text-cherry-pink">
            {formatCurrency(calculateDeposit())}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Payment Information</h3>
        <p className="text-gray-600 mb-4">
          All transactions are secure and encrypted. Your credit card information is never stored on our servers.
        </p>
        
        <div className="flex items-center mb-4">
          <span className="mr-2">Powered by</span>
          <div className="text-xl font-bold text-[#006aff]">Square</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label htmlFor="cardNumber" className="block text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formatCardNumber(cardDetails.cardNumber)}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                setCardDetails({
                  ...cardDetails,
                  cardNumber: formatted
                });
              }}
              placeholder="1234 5678 9012 3456"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
              maxLength={19}
            />
          </div>
          
          {/* Expiration Date and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expirationDate" className="block text-gray-700 mb-2">Expiration Date</label>
              <input
                type="text"
                id="expirationDate"
                name="expirationDate"
                value={cardDetails.expirationDate}
                onChange={(e) => {
                  const formatted = formatExpirationDate(e.target.value);
                  setCardDetails({
                    ...cardDetails,
                    expirationDate: formatted
                  });
                }}
                placeholder="MM/YY"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                maxLength={5}
              />
            </div>
            
            <div>
              <label htmlFor="cvv" className="block text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleInputChange}
                placeholder="123"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                maxLength={4}
              />
            </div>
          </div>
          
          {/* Billing Zip Code */}
          <div>
            <label htmlFor="zipCode" className="block text-gray-700 mb-2">Billing Zip Code</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={cardDetails.zipCode}
              onChange={handleInputChange}
              placeholder="12345"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-pink"
              maxLength={10}
            />
          </div>
          
          {/* Error message */}
          {paymentError && (
            <div className="text-red-500 text-sm">{paymentError}</div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold py-3 px-4 rounded-lg transition-colors ${
              isProcessing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              `Pay Deposit: ${formatCurrency(calculateDeposit())}`
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-6">
        <h3 className="font-bold mb-2">Payment Security</h3>
        <p className="text-gray-600 mb-4">
          Your payment information is processed securely through Square. We never store your full credit card details on our servers.
        </p>
        
        <div className="flex items-center space-x-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-gray-600">Secure SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}
