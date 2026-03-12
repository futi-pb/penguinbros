import Link from 'next/link';
import { getSiteSetting } from '@/lib/cms';

export default async function Footer() {
  const contactDetails = await getSiteSetting('contact_details', {
    phone: '(555) 123-4567',
    email: 'info@penguinbrothers.com',
    address: '123 Ice Cream Lane, Dessert City, SW 12345',
  });

  const addressParts = String(contactDetails.address ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Penguin Brothers</h3>
            <p className="mb-4">Delicious ice cream sandwiches made with love.</p>
            <p> {new Date().getFullYear()} Penguin Brothers. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-cherry-pink transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-cherry-pink transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/catering" className="hover:text-cherry-pink transition-colors">
                  Catering
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cherry-pink transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            {addressParts.length > 0 ? (
              <>
                <p className="mb-2">{addressParts[0]}</p>
                {addressParts[1] && <p className="mb-2">{addressParts[1]}</p>}
              </>
            ) : (
              <p className="mb-2">{contactDetails.address}</p>
            )}
            <p className="mb-2">Phone: {contactDetails.phone}</p>
            <p>Email: {contactDetails.email}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
