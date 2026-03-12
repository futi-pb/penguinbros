'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductOption from './ProductOption';
import ProductPreview from './ProductPreview';
import { useCart } from '@/context/CartContext';

// Product types
export type ProductType = 'sandwich' | 'pookie' | 'ice-cream';

type CookieOption = {
  id: string;
  name: string;
  image: string;
};

type IceCreamOption = {
  id: string;
  name: string;
  image: string;
};

// Cookie options matching official Penguin Brothers menu
const cookieOptions: CookieOption[] = [
  { id: 'chocolate-chip', name: 'Chocolate Chip', image: '/images/cookie 1.png' },
  { id: 'double-fudge', name: 'Double Fudge', image: '/images/cookie 2.png' },
  { id: 'snickerdoodle', name: 'Snickerdoodle', image: '/images/cookie 3.png' },
  { id: 'oatmeal', name: 'Oatmeal', image: '/images/cookie 4.png' },
  { id: 'tuxedo', name: 'Tuxedo', image: '/images/cookie 5.png' },
];

// Ice cream options matching official Penguin Brothers menu
const iceCreamOptions: IceCreamOption[] = [
  { id: 'vanilla-bean', name: 'Vanilla Bean', image: '/images/icecream 1.png' },
  { id: 'cookie-monster', name: 'Cookie Monster', image: '/images/icecream 2.png' },
  { id: 'dark-chocolate-sea-salt', name: 'Dark Chocolate Sea Salt', image: '/images/icecream 3.png' },
  { id: 'birthday-cake', name: 'Birthday Cake', image: '/images/icecream 4.png' },
  { id: 'strawberry-nutella', name: 'Strawberry Nutella', image: '/images/icecream 5.png' },
  { id: 'mint-oreo', name: 'Mint Oreo', image: '/images/icecream 6.png' },
  { id: 'biscoff', name: 'Biscoff', image: '/images/icecream 7.png' },
  { id: 'honeycomb', name: 'Honeycomb', image: '/images/icecream 8.png' },
  { id: 'smores', name: 'S\'mores', image: '/images/icecream 9.png' },
  { id: 'no-bake', name: 'No Bake', image: '/images/icecream 10.png' },
  { id: 'muddy-buddy', name: 'Muddy Buddy', image: '/images/icecream 11.png' },
];

// Pookie options using your actual images
const pookieOptions: CookieOption[] = [
  { id: 'pookie-1', name: 'Classic Pookie', image: '/images/pookie 1.png' },
  { id: 'pookie-2', name: 'Chocolate Pookie', image: '/images/pookie 2.png' },
  { id: 'pookie-3', name: 'Cinnamon Pookie', image: '/images/pookie 3.png' },
  { id: 'pookie-4', name: 'Special Pookie', image: '/images/pookie 4.png' },
];

// Predefined combinations matching official Penguin Brothers signature items
const menuItemPresets: Record<string, {topCookie?: string, iceCream: string, bottomCookie?: string, productType: ProductType}> = {
  // Signature Ice Cream Sandwiches
  'ron-burgundy': {
    topCookie: 'snickerdoodle',
    iceCream: 'strawberry-nutella',
    bottomCookie: 'snickerdoodle',
    productType: 'sandwich'
  },
  'frequent-flyer': {
    topCookie: 'snickerdoodle',
    iceCream: 'biscoff',
    bottomCookie: 'snickerdoodle',
    productType: 'sandwich'
  },
  'luigis-mansion': {
    topCookie: 'double-fudge',
    iceCream: 'mint-oreo',
    bottomCookie: 'double-fudge',
    productType: 'sandwich'
  },
  'golden-snitch': {
    topCookie: 'oatmeal',
    iceCream: 'honeycomb',
    bottomCookie: 'oatmeal',
    productType: 'sandwich'
  },
  'half-baked': {
    topCookie: 'oatmeal',
    iceCream: 'no-bake',
    bottomCookie: 'oatmeal',
    productType: 'sandwich'
  },
  'inception': {
    topCookie: 'chocolate-chip',
    iceCream: 'cookie-monster',
    bottomCookie: 'double-fudge',
    productType: 'sandwich'
  },
  // Signature Pookies
  'smores-sunday': {
    topCookie: 'pookie-1',
    iceCream: 'smores',
    bottomCookie: 'pookie-1',
    productType: 'pookie'
  },
  'the-breakup': {
    topCookie: 'pookie-2',
    iceCream: 'dark-chocolate-sea-salt',
    bottomCookie: 'pookie-2',
    productType: 'pookie'
  },
  'frequent-flyer-pookie': {
    topCookie: 'pookie-3',
    iceCream: 'biscoff',
    bottomCookie: 'pookie-3',
    productType: 'pookie'
  },
  // Individual Ice Cream Flavors
  'vanilla-bean': {
    iceCream: 'vanilla-bean',
    productType: 'ice-cream'
  },
  'cookie-monster': {
    iceCream: 'cookie-monster',
    productType: 'ice-cream'
  },
  'strawberry-nutella': {
    iceCream: 'strawberry-nutella',
    productType: 'ice-cream'
  }
};

function getMatchingPresetId(input: {
  productType: ProductType;
  topCookie: string | null;
  bottomCookie: string | null;
  iceCream: string | null;
}) {
  const { productType, topCookie, bottomCookie, iceCream } = input;
  if (!iceCream) {
    return null;
  }

  for (const [presetId, preset] of Object.entries(menuItemPresets)) {
    if (preset.productType !== productType) {
      continue;
    }

    if (productType === 'sandwich') {
      if (
        preset.topCookie === topCookie &&
        preset.bottomCookie === bottomCookie &&
        preset.iceCream === iceCream
      ) {
        return presetId;
      }
    }

    if (productType === 'pookie') {
      if (preset.bottomCookie === bottomCookie && preset.iceCream === iceCream) {
        return presetId;
      }
    }

    if (productType === 'ice-cream') {
      if (preset.iceCream === iceCream) {
        return presetId;
      }
    }
  }

  return null;
}

// Product type labels and descriptions
const productTypeInfo = {
  'sandwich': {
    title: 'Ice Cream Sandwich',
    description: 'Choose your cookies and ice cream flavor',
    price: 7.99
  },
  'pookie': {
    title: 'Pookie',
    description: 'A warm cookie topped with ice cream',
    price: 8.99
  },
  'ice-cream': {
    title: 'Ice Cream',
    description: 'Choose your favorite ice cream flavor',
    price: 4.99
  }
};

export default function ProductBuilder() {
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const [productType, setProductType] = useState<ProductType>('sandwich');
  const [bottomCookie, setBottomCookie] = useState<string | null>(null);
  const [iceCream, setIceCream] = useState<string | null>(null);
  const [topCookie, setTopCookie] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Apply preset selections based on URL parameter
  useEffect(() => {
    const itemId = searchParams.get('item');
    const typeParam = searchParams.get('type') as ProductType | null;
    
    if (typeParam && ['sandwich', 'pookie', 'ice-cream'].includes(typeParam)) {
      setProductType(typeParam);
    }
    
    if (itemId && menuItemPresets[itemId]) {
      const preset = menuItemPresets[itemId];
      if (preset.productType) {
        setProductType(preset.productType);
      }
      if (preset.topCookie) {
        setTopCookie(preset.topCookie);
      }
      setIceCream(preset.iceCream);
      if (preset.bottomCookie) {
        setBottomCookie(preset.bottomCookie);
      }
    }
  }, [searchParams]);

  const handleAddToCart = () => {
    const activeCookieOptions = productType === 'pookie' ? pookieOptions : cookieOptions;

    // Find the selected options
    const selectedBottomCookie = bottomCookie
      ? activeCookieOptions.find((c) => c.id === bottomCookie)
      : null;
    const selectedIceCream = iceCream ? iceCreamOptions.find(i => i.id === iceCream) : null;
    const selectedTopCookie = topCookie ? cookieOptions.find(c => c.id === topCookie) : null;
    
    if (!selectedIceCream) return;
    
    // Generate a descriptive name based on the selections
    let itemName = '';
    switch (productType) {
      case 'sandwich':
        if (selectedTopCookie && selectedBottomCookie) {
          itemName = `${selectedTopCookie.name} + ${selectedIceCream.name} + ${selectedBottomCookie.name}`;
        }
        break;
      case 'pookie':
        if (selectedBottomCookie) {
          itemName = `${selectedIceCream.name} on ${selectedBottomCookie.name}`;
        }
        break;
      case 'ice-cream':
        itemName = selectedIceCream.name;
        break;
    }

    const matchingPresetId = getMatchingPresetId({
      productType,
      topCookie,
      bottomCookie,
      iceCream,
    });
    
    // Add the item to the cart
    addItem({
      productType,
      catalogItemId: matchingPresetId,
      topCookie: topCookie,
      iceCream: iceCream || '',  // Ensure it's not null for TypeScript
      bottomCookie: bottomCookie,
      quantity,
      price: productTypeInfo[productType].price,
      name: itemName || productTypeInfo[productType].title
    });
    
    // Show a confirmation message
    alert('Added to cart!');
  };

  // Check if the product selection is complete based on product type
  const isComplete = () => {
    switch (productType) {
      case 'sandwich':
        return bottomCookie && iceCream && topCookie;
      case 'pookie':
        return bottomCookie && iceCream;
      case 'ice-cream':
        return iceCream;
      default:
        return false;
    }
  };

  // Get the base price based on product type
  const getBasePrice = () => {
    return productTypeInfo[productType].price;
  };

  // Find the selected options for preview
  const selectedBottomCookie = bottomCookie
    ? (productType === 'pookie' ? pookieOptions : cookieOptions).find((c) => c.id === bottomCookie) || null
    : null;
  const selectedIceCream = iceCream ? iceCreamOptions.find(i => i.id === iceCream) || null : null;
  const selectedTopCookie = topCookie ? cookieOptions.find(c => c.id === topCookie) || null : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">{productTypeInfo[productType].title} Builder</h1>
      <p className="text-center text-gray-600 mb-8">{productTypeInfo[productType].description}</p>
      
      {/* Product Type Selection */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setProductType('sandwich')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              productType === 'sandwich' 
                ? 'bg-cherry-pink text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200`}
          >
            Ice Cream Sandwich
          </button>
          <button
            type="button"
            onClick={() => setProductType('pookie')}
            className={`px-4 py-2 text-sm font-medium ${
              productType === 'pookie' 
                ? 'bg-cherry-pink text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border-t border-b border-gray-200`}
          >
            Pookie
          </button>
          <button
            type="button"
            onClick={() => setProductType('ice-cream')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              productType === 'ice-cream' 
                ? 'bg-cherry-pink text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200`}
          >
            Ice Cream
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Options Column */}
        <div className="space-y-10">
          {/* Top Cookie Selection - Only show for sandwich */}
          {productType === 'sandwich' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 1: Choose Top Cookie</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {cookieOptions.map((cookie) => (
                  <ProductOption
                    key={cookie.id}
                    id={cookie.id}
                    name={cookie.name}
                    image={cookie.image}
                    isSelected={topCookie === cookie.id}
                    onSelect={() => setTopCookie(cookie.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Ice Cream Selection - Show for all product types */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {productType === 'sandwich' ? 'Step 2: ' : productType === 'pookie' ? 'Step 2: ' : 'Step 1: '}
              Choose Ice Cream
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {iceCreamOptions.map((iceCreamOption) => (
                <ProductOption
                  key={iceCreamOption.id}
                  id={iceCreamOption.id}
                  name={iceCreamOption.name}
                  image={iceCreamOption.image}
                  isSelected={iceCream === iceCreamOption.id}
                  onSelect={() => setIceCream(iceCreamOption.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Bottom Cookie Selection - Show for sandwich */}
          {productType === 'sandwich' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 3: Choose Bottom Cookie</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {cookieOptions.map((cookie) => (
                  <ProductOption
                    key={cookie.id}
                    id={cookie.id}
                    name={cookie.name}
                    image={cookie.image}
                    isSelected={bottomCookie === cookie.id}
                    onSelect={() => setBottomCookie(cookie.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Pookie Selection - Show for pookie */}
          {productType === 'pookie' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 1: Choose Your Pookie</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pookieOptions.map((pookie) => (
                  <ProductOption
                    key={pookie.id}
                    id={pookie.id}
                    name={pookie.name}
                    image={pookie.image}
                    isSelected={bottomCookie === pookie.id}
                    onSelect={() => setBottomCookie(pookie.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Quantity Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {productType === 'sandwich' ? 'Step 4: ' : productType === 'pookie' ? 'Step 3: ' : 'Step 2: '}
              Quantity
            </h2>
            <div className="flex items-center">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
              >
                -
              </button>
              <span className="bg-gray-100 py-2 px-6">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview Column */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Creation</h2>
          
          <ProductPreview 
            productType={productType}
            bottomCookie={selectedBottomCookie}
            iceCream={selectedIceCream}
            topCookie={selectedTopCookie}
          />
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-cherry-pink">${(getBasePrice() * quantity).toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!isComplete()}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white ${
                isComplete() 
                  ? 'bg-cherry-pink hover:bg-cherry-pink-dark' 
                  : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {isComplete() ? 'Add to Cart' : 'Please Complete Your Selection'}
            </button>
            
            {!isComplete() && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Please select all options to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
