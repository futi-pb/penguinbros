'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_CATALOG_ITEMS, DEFAULT_CATEGORIES } from '@/lib/catalog';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  productType: 'sandwich' | 'pookie' | 'ice-cream';
};

type MenuCategory = {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
};

function buildFallbackCategories(): MenuCategory[] {
  return DEFAULT_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    items: DEFAULT_CATALOG_ITEMS.filter((item) => item.categoryId === category.id).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.priceCents / 100,
      productType: item.productType,
    })),
  }));
}

export default function MenuPage() {
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(buildFallbackCategories());
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCatalog = async () => {
      try {
        const response = await fetch('/api/catalog', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to load catalog');
        }

        const categories = Array.isArray(payload.categories) ? payload.categories : [];
        const items = Array.isArray(payload.items) ? payload.items : [];

        const hydratedCategories: MenuCategory[] = categories.map(
          (category: { id: string; name: string; description: string }) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            items: items
              .filter((item: { categoryId: string; isVisible?: boolean }) => item.categoryId === category.id && item.isVisible !== false)
              .map((item: {
                id: string;
                name: string;
                description: string;
                priceCents: number;
                productType: 'sandwich' | 'pookie' | 'ice-cream';
              }) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.priceCents / 100,
                productType: item.productType,
              })),
          })
        );

        if (mounted && hydratedCategories.length > 0) {
          setMenuCategories(hydratedCategories);
        }
      } catch (error) {
        console.error('Failed to load menu catalog:', error);
      } finally {
        if (mounted) {
          setIsLoadingCatalog(false);
        }
      }
    };

    loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const totalItems = useMemo(
    () => menuCategories.reduce((count, category) => count + category.items.length, 0),
    [menuCategories]
  );

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      productType: item.productType,
      catalogItemId: item.id,
      topCookie: null,
      bottomCookie: null,
      iceCream: item.id, // Use id as flavor reference
      quantity: 1,
      price: item.price,
      name: item.name,
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-4xl font-bold mb-2 text-center">Our Menu</h1>
      <p className="text-xl text-center mb-12 text-gray-600">
        Freshly baked cookies and premium ice cream
      </p>

      <p className="text-center text-sm text-gray-500 mb-8">
        {isLoadingCatalog ? 'Loading live catalog...' : `${totalItems} items available`}
      </p>

      {menuCategories.map((category) => (
        <section key={category.id} className="mb-16">
          <h2 className="text-3xl font-bold mb-4">{category.name}</h2>
          <p className="text-gray-600 mb-8">{category.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {category.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <button
                    className={`bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium inline-block transition-colors w-full ${addedId === item.id ? 'bg-green-500 hover:bg-green-500 cursor-default' : ''}`}
                    onClick={() => handleAddToCart(item)}
                    disabled={addedId === item.id}
                  >
                    {addedId === item.id ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="bg-blue-50 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Custom Orders</h2>
        <p className="mb-6">
          Want to create your own custom ice cream sandwich? Use our builder to mix and match cookies and ice cream flavors!
        </p>
        <Link 
          href="/order/builder"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-block transition-colors"
        >
          Build Your Own
        </Link>
      </div>
    </div>
  );
}
