'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();

  // Format product name based on product type and selections
  const formatProductName = (item: any) => {
    switch (item.productType) {
      case 'sandwich':
        return `${item.name} (Ice Cream Sandwich)`;
      case 'pookie':
        return `${item.name} (Pookie)`;
      case 'ice-cream':
        return `${item.name} (Ice Cream)`;
      default:
        return item.name;
    }
  };

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 pt-[150px]">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            href="/order" 
            className="inline-block bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Start Ordering
          </Link>
        </div>
      </div>
    );
  }

  // Cart with items view
  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">Items ({items.length})</h2>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {items.map(item => (
                <li key={item.id} className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Product Image Placeholder */}
                    <div className="w-20 h-20 bg-isabelline rounded-md flex items-center justify-center text-sm text-gray-500">
                      {item.productType === 'sandwich' && 'Sandwich'}
                      {item.productType === 'pookie' && 'Pookie'}
                      {item.productType === 'ice-cream' && 'Ice Cream'}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-cherry-pink">{formatProductName(item)}</h3>
                      <p className="text-sm text-gray-600">{item.name}</p>
                      <div className="mt-2 flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded-l"
                          >
                            -
                          </button>
                          <span className="bg-gray-100 py-1 px-4">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded-r"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-4 border-t">
              <button 
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <Link 
              href="/order" 
              className="text-cherry-pink hover:text-cherry-pink-dark flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-[150px]">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${(subtotal * 0.0825).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${(subtotal * 1.0825).toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold py-3 px-4 rounded-lg transition-colors inline-block text-center"
            >
              Proceed to Checkout
            </Link>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Secure checkout with pickup scheduling and payment options.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
