import ContactForm from '@/components/ContactForm';
import { getBlockValue, getPageBlocks, getSiteSetting } from '@/lib/cms';

export default async function ContactPage() {
  const blocks = await getPageBlocks('contact');
  const contactSettings = await getSiteSetting('contact_details', {
    phone: '(555) 123-4567',
    email: 'info@penguinbrothers.com',
    address: '123 Ice Cream Lane, Dessert City, SW 12345',
  });

  const header = getBlockValue(blocks, 'header', {
    title: 'Contact Us',
    subtitle: "We'd love to hear from you",
  });

  const storeInfo = getBlockValue(blocks, 'store_info', {
    heading: 'Get In Touch',
    storeTitle: 'Main Store',
    hoursTitle: 'Hours',
    hours: [
      'Monday - Thursday: 11am - 9pm',
      'Friday - Saturday: 11am - 10pm',
      'Sunday: 12pm - 8pm',
    ],
  });

  const socialLinks = getBlockValue(blocks, 'social_links', [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'Twitter', href: '#' },
  ]);

  const mapBlock = getBlockValue(blocks, 'map', {
    title: 'Find Us',
    placeholder: 'Map Placeholder - Google Maps will be integrated here',
  });

  const addressParts = String(contactSettings.address ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-4xl font-bold mb-2 text-center">{header.title}</h1>
      <p className="text-xl text-center mb-12 text-gray-600">
        {header.subtitle}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{storeInfo.heading}</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{storeInfo.storeTitle}</h3>
              {addressParts.length > 0 ? (
                addressParts.map((line, index) => (
                  <p key={`address-${index}`} className="text-gray-600">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-gray-600">{contactSettings.address}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">{storeInfo.hoursTitle}</h3>
              {(storeInfo.hours as string[]).map((line, index) => (
                <p key={`hours-${index}`} className="text-gray-600">
                  {line}
                </p>
              ))}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-gray-600">Phone: {contactSettings.phone}</p>
              <p className="text-gray-600">Email: {contactSettings.email}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
              <div className="flex space-x-4">
                {(socialLinks as Array<{ label: string; href: string }>).map((social, index) => (
                  <a
                    key={`social-${index}`}
                    href={social.href}
                    className="text-pink-500 hover:text-pink-600"
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
          <ContactForm />
        </div>
      </div>
      
      {/* Map (Placeholder) */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">{mapBlock.title}</h2>
        <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
          {mapBlock.placeholder}
        </div>
      </div>
    </div>
  );
}
