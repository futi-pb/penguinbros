'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductType } from '@/components/product/ProductBuilder';

// Define cart item type
export type CartItem = {
  id: string;
  productType: ProductType;
  catalogItemId?: string | null;
  squareVariationId?: string | null;
  topCookie?: string | null;
  bottomCookie?: string | null;
  iceCream: string;
  quantity: number;
  price: number;
  name: string;
};

// Define cart context type
type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize cart state from localStorage if available
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loaded]);

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'id'>) => {
    setItems(prevItems => {
      // Generate a unique ID for the new item
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      return [...prevItems, { ...item, id }];
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prevItems =>
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Calculate total item count
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Provide the cart context to children
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
