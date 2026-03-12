import Link from 'next/link';

export default function OrderPage() {
  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-4xl font-bold mb-2 text-center">Order Online</h1>
      <p className="text-xl text-center mb-8 text-gray-600">
        Choose your favorite treat or create your own custom creation
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Ice Cream Sandwich Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-isabelline flex items-center justify-center">
            <div className="text-center p-4">
              <h3 className="text-2xl font-bold text-cherry-pink">Ice Cream Sandwich</h3>
              <p className="text-gray-600 mt-2">Choose your cookies and ice cream flavor</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">Our signature treat! Two freshly baked cookies with your choice of premium ice cream in between.</p>
            <Link 
              href="/order/builder?type=sandwich" 
              className="block w-full py-2 px-4 bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold rounded-lg text-center transition-colors"
            >
              Build Your Sandwich
            </Link>
          </div>
        </div>
        
        {/* Pookie Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-isabelline flex items-center justify-center">
            <div className="text-center p-4">
              <h3 className="text-2xl font-bold text-cherry-pink">Pookie</h3>
              <p className="text-gray-600 mt-2">A warm cookie topped with ice cream</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">A warm, freshly baked cookie topped with a generous scoop of your favorite ice cream flavor.</p>
            <Link 
              href="/order/builder?type=pookie" 
              className="block w-full py-2 px-4 bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold rounded-lg text-center transition-colors"
            >
              Build Your Pookie
            </Link>
          </div>
        </div>
        
        {/* Ice Cream Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-isabelline flex items-center justify-center">
            <div className="text-center p-4">
              <h3 className="text-2xl font-bold text-cherry-pink">Ice Cream</h3>
              <p className="text-gray-600 mt-2">Premium ice cream by the scoop</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">Enjoy our premium, small-batch ice cream in a variety of delicious flavors.</p>
            <Link 
              href="/order/builder?type=ice-cream" 
              className="block w-full py-2 px-4 bg-cherry-pink hover:bg-cherry-pink-dark text-white font-bold rounded-lg text-center transition-colors"
            >
              Choose Your Flavor
            </Link>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Popular Menu Items</h2>
        <p className="text-gray-600">Try one of our customer favorites</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Classic Sandwich */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="font-bold text-cherry-pink">Ron Burgundy</h3>
            <p className="text-sm text-gray-600">Snickerdoodle + Strawberry Nutella + Snickerdoodle</p>
            <div className="mt-4">
              <Link 
                href="/order/builder?item=ron-burgundy" 
                className="text-sm text-cherry-pink font-medium hover:text-cherry-pink-dark"
              >
                Order Now →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Double Chocolate */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="font-bold text-cherry-pink">Luigi's Mansion</h3>
            <p className="text-sm text-gray-600">Double Fudge + Mint Oreo + Double Fudge</p>
            <div className="mt-4">
              <Link 
                href="/order/builder?item=luigis-mansion" 
                className="text-sm text-cherry-pink font-medium hover:text-cherry-pink-dark"
              >
                Order Now →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Chocolate Pookie */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="font-bold text-cherry-pink">The Breakup</h3>
            <p className="text-sm text-gray-600">Chocolate Pookie + Dark Chocolate Sea Salt</p>
            <div className="mt-4">
              <Link 
                href="/order/builder?item=the-breakup" 
                className="text-sm text-cherry-pink font-medium hover:text-cherry-pink-dark"
              >
                Order Now →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Strawberry Ice Cream */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="font-bold text-cherry-pink">Strawberry Nutella</h3>
            <p className="text-sm text-gray-600">Premium Strawberry Nutella Ice Cream</p>
            <div className="mt-4">
              <Link 
                href="/order/builder?item=strawberry-nutella" 
                className="text-sm text-cherry-pink font-medium hover:text-cherry-pink-dark"
              >
                Order Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
