import Link from 'next/link';
import { getBlockValue, getPageBlocks } from '@/lib/cms';

export default async function CateringPage() {
  const blocks = await getPageBlocks('catering');

  const header = getBlockValue(blocks, 'header', {
    title: 'Catering Services',
    subtitle: 'Make your event special with Penguin Brothers catering',
  });

  const cateringOptions = getBlockValue(blocks, 'options', [
    {
      id: 'white-cart',
      name: 'White Cart',
      description: 'Our classic white cart is perfect for smaller events and indoor venues.',
      capacity: 'Up to 100 guests',
      priceRange: '$500-$800',
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
  ]);

  const bookingProcess = getBlockValue(blocks, 'booking_process', [
    {
      step: 1,
      title: 'Choose Your Option',
      description: 'Select the catering option that best fits your event needs.',
    },
    {
      step: 2,
      title: 'Select Date & Time',
      description: 'Choose from our available dates and time slots for your event.',
    },
    {
      step: 3,
      title: 'Customize Your Menu',
      description: 'Select your cookie and ice cream flavors, plus any add-ons.',
    },
    {
      step: 4,
      title: 'Confirm & Pay Deposit',
      description: 'Review your booking details and secure your date with a deposit.',
    },
  ]);

  const faqs = getBlockValue(blocks, 'faq', [
    {
      question: 'How far in advance should I book?',
      answer:
        'We recommend booking at least 4-6 weeks in advance for peak season (May-September) and 2-4 weeks for off-peak times. Popular dates fill up quickly!',
    },
    {
      question: 'Is there a travel fee?',
      answer:
        'Events within 25 miles of our main location have no travel fee. Beyond that, a travel fee applies based on distance.',
    },
    {
      question: 'What is the deposit amount?',
      answer:
        'We require a 50% deposit to secure your booking date, with the remaining balance due 7 days before your event.',
    },
    {
      question: 'Can you accommodate dietary restrictions?',
      answer:
        'Yes! We offer gluten-free cookie options and dairy-free ice cream alternatives. Just let us know your requirements when booking.',
    },
  ]);

  const cta = getBlockValue(blocks, 'cta', {
    title: 'Ready to Make Your Event Special?',
    description:
      'Contact us today to discuss your event needs or book your catering package online.',
    primaryLabel: 'Book Online',
    primaryHref: '/catering/book',
    secondaryLabel: 'Contact Us',
    secondaryHref: '/contact',
  });

  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-4xl font-bold mb-2 text-center">{header.title}</h1>
      <p className="text-xl text-center mb-12 text-gray-600">
        {header.subtitle}
      </p>

      {/* Catering Options */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Catering Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(cateringOptions as Array<{
            id: string;
            name: string;
            description: string;
            capacity: string;
            priceRange: string;
            features: string[];
          }>).map((option) => (
            <div 
              key={option.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{option.name}</h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <div className="mb-4">
                  <p><strong>Capacity:</strong> {option.capacity}</p>
                  <p><strong>Price Range:</strong> {option.priceRange}</p>
                </div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="list-disc pl-5 mb-6">
                  {option.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">{feature}</li>
                  ))}
                </ul>
                <Link 
                  href={`/catering/book?option=${option.id}`}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium inline-block transition-colors"
                >
                  Book This Option
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Process */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Booking Process</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {(bookingProcess as Array<{ step: number; title: string; description: string }>).map((step) => (
            <div key={step.step} className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {step.step}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          {(faqs as Array<{ question: string; answer: string }>).map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-100 to-blue-100 p-8 rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-4">{cta.title}</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          {cta.description}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href={cta.primaryHref}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {cta.primaryLabel}
          </Link>
          <Link 
            href={cta.secondaryHref}
            className="bg-white hover:bg-gray-100 text-pink-500 border border-pink-500 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {cta.secondaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
