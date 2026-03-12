import Link from 'next/link';
import Image from 'next/image';
import { getBlockValue, getPageBlocks } from '@/lib/cms';

export default async function Home() {
  const blocks = await getPageBlocks('home');
  const hero = getBlockValue(blocks, 'hero', {
    titleStart: 'Freshly Baked',
    highlightOne: 'Cookies',
    titleMiddle: 'with Premium',
    highlightTwo: 'Ice Cream',
    subtitle:
      'Handcrafted ice cream sandwiches made with love. Order online for pickup or visit our store today!',
    primaryCtaLabel: 'Order Now',
    primaryCtaHref: '/order',
    secondaryCtaLabel: 'Full Menu',
    secondaryCtaHref: '/menu',
    imageUrl: '/assets/Photos/hero-image2.jpg',
    imageAlt: 'Penguin Brothers Ice Cream Sandwich',
  });

  const featuredProducts = getBlockValue(blocks, 'featured_products', [
    {
      id: 'ron-burgundy',
      name: 'Ron Burgundy',
      description: 'Snickerdoodle cookies with strawberry nutella ice cream',
      price: '$7.99',
      image: '/assets/Photos/PB-16.jpg',
    },
    {
      id: 'luigis-mansion',
      name: "Luigi's Mansion",
      description: 'Double fudge cookies with mint oreo ice cream',
      price: '$7.99',
      image: '/assets/Photos/PB-20.jpg',
    },
    {
      id: 'frequent-flyer',
      name: 'Frequent Flyer',
      description: 'Snickerdoodle cookies with biscoff ice cream',
      price: '$7.99',
      image: '/assets/Photos/PB-22.jpg',
    },
  ]);

  const newsletter = getBlockValue(blocks, 'newsletter', {
    title: 'Join Our Sweet Community',
    description:
      'Subscribe to our newsletter for exclusive offers, new flavor announcements, and more sweet treats!',
    buttonLabel: 'Subscribe',
    placeholder: 'Your email address',
  });

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-l from-[#F8D9DD] to-[#F2F1ED] pt-32 pb-16 h-[80vh] flex items-center">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-black">
                {hero.titleStart} <span className="text-cherry-pink">{hero.highlightOne}</span>{' '}
                {hero.titleMiddle}{' '}
                <span className="text-columbia-blue">{hero.highlightTwo}</span>
              </h1>
              <p className="text-lg mb-8 text-black max-w-lg">
                {hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={hero.primaryCtaHref} className="bg-black text-white px-6 py-2 hover:bg-black-dark transition-colors">
                  {hero.primaryCtaLabel}
                </Link>
                <Link href={hero.secondaryCtaHref} className="border border-black text-black px-6 py-2 hover:border-black-dark transition-colors btn-arrow">
                  {hero.secondaryCtaLabel}
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-[400px] w-full">
                <Image
                  src={hero.imageUrl}
                  alt={hero.imageAlt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Our Favorites</h2>
            <p className="text-black max-w-2xl mx-auto">
              Try our most popular ice cream sandwich combinations, lovingly crafted with our signature cookies and premium ice cream.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(featuredProducts as Array<{
              id: string;
              name: string;
              description: string;
              price: string;
              image: string;
            }>).map((product, index) => (
              <div key={index} className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-56 bg-isabelline relative">
                  <Image 
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-black">{product.name}</h3>
                    <span className="font-semibold text-cherry-pink">{product.price}</span>
                  </div>
                  <p className="text-black mb-4">
                    {product.description}
                  </p>
                  <Link 
                    href={`/order/builder?item=${product.id}`} 
                    className="text-cherry-pink font-medium hover:text-cherry-pink-dark flex items-center"
                  >
                    Order Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/menu" className="border border-black text-black px-6 py-2 hover:border-black-dark transition-colors btn-arrow">
              Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">How It Works</h2>
            <p className="text-black max-w-2xl mx-auto">
              Ordering your custom ice cream sandwich is easy! Follow these simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Choose Your Cookies",
                description: "Select from our freshly baked cookie flavors for top and bottom"
              },
              {
                step: 2,
                title: "Pick Your Ice Cream",
                description: "Choose from our premium ice cream flavors"
              },
              {
                step: 3,
                title: "Add Toppings",
                description: "Customize with sprinkles, chocolate chips, and more"
              },
              {
                step: 4,
                title: "Pick Up & Enjoy",
                description: "Schedule pickup time and enjoy your creation"
              }
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-cherry-pink flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">{step.title}</h3>
                <p className="text-black">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/order" className="bg-black text-white px-6 py-2 hover:bg-black-dark transition-colors">
              Build Your Own
            </Link>
          </div>
        </div>
      </section>

      {/* Catering Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Catering for Events</h2>
              <p className="text-black mb-6">
                Make your next event extra special with our custom ice cream sandwich bar. Perfect for weddings, corporate events, birthdays, and more!
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cherry-pink mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-black">Custom ice cream flavors</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cherry-pink mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-black">Variety of cookie options</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cherry-pink mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-black">Professional setup and service</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cherry-pink mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-black">Customizable packages for any budget</span>
                </li>
              </ul>
              <Link href="/catering" className="bg-black text-white px-6 py-2 hover:bg-black-dark transition-colors btn-arrow">
                Book Us Now
              </Link>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative h-[350px] w-full">
                <Image
                  src="/assets/Photos/IMG_9408.jpg"
                  alt="Penguin Brothers Catering"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">What Our Customers Say</h2>
            <p className="text-black max-w-2xl mx-auto">
              Don't just take our word for it - here's what our customers have to say about Penguin Brothers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah J.",
                quote: "The best ice cream sandwiches I've ever had! The cookies are always fresh and the ice cream is so creamy.",
                rating: 5
              },
              {
                name: "Michael T.",
                quote: "We had Penguin Brothers cater our wedding and it was a huge hit! Our guests are still talking about it months later.",
                rating: 5
              },
              {
                name: "Emily R.",
                quote: "My kids love building their own ice cream sandwiches. It's become our Friday night tradition!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-isabelline p-6 shadow-md">
                <div className="flex items-center mb-4">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
                    </svg>
                  ))}
                </div>
                <p className="text-black mb-4 italic">"{testimonial.quote}"</p>
                <p className="font-medium text-black">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="section-padding bg-isabelline">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Visit Us</h2>
            <p className="text-black max-w-2xl mx-auto">
              Stop by our store or find our food truck around town!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-cherry-pink flex items-center justify-center text-white mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">Main Store</h3>
              </div>
              
              <div className="mb-4 relative h-40 w-full">
                <Image
                  src="/assets/Photos/PB-43.jpg"
                  alt="Penguin Brothers Main Store"
                  fill
                  className="object-cover"
                />
              </div>
              
              <p className="mb-4 text-black">123 Ice Cream Lane, Dessert City, SW 12345</p>
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-black">Hours:</h4>
                <ul className="space-y-1 text-black">
                  <li>Monday - Thursday: 11am - 9pm</li>
                  <li>Friday - Saturday: 11am - 10pm</li>
                  <li>Sunday: 12pm - 8pm</li>
                </ul>
              </div>
              <Link 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="border border-black text-black px-6 py-2 hover:border-black-dark transition-colors btn-arrow"
              >
                Get Directions
              </Link>
            </div>
            
            <div className="bg-white shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-cherry-pink flex items-center justify-center text-white mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">Food Truck</h3>
              </div>
              
              <div className="mb-4 relative h-40 w-full">
                <Image
                  src="/assets/Photos/IMG_9390.jpg"
                  alt="Penguin Brothers Food Truck"
                  fill
                  className="object-cover"
                />
              </div>
              
              <p className="mb-4 text-black">Various locations throughout the city</p>
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-black">Follow Us:</h4>
                <p className="text-black">Check our social media for daily locations and times</p>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="text-cherry-pink hover:text-cherry-pink-dark">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-cherry-pink hover:text-cherry-pink-dark">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-cherry-pink hover:text-cherry-pink-dark">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-[#FFE5EC]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">{newsletter.title}</h2>
            <p className="text-black mb-8">
              {newsletter.description}
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={newsletter.placeholder} 
                className="flex-grow px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cherry-pink"
                required
              />
              <button 
                type="submit"
                className="bg-black text-white px-6 py-2 hover:bg-black-dark transition-colors"
              >
                {newsletter.buttonLabel}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
