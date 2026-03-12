import Image from 'next/image';
import Link from 'next/link';
import { getBlockValue, getPageBlocks } from '@/lib/cms';

export default async function AboutPage() {
  const blocks = await getPageBlocks('about');

  const header = getBlockValue(blocks, 'header', {
    title: 'About Penguin Brothers',
    subtitle: 'Our story, mission, and passion for ice cream',
  });

  const story = getBlockValue(blocks, 'story', {
    title: 'Our Story',
    paragraphs: [
      'Penguin Brothers was founded in 2018 by two brothers who shared a passion for ice cream and baking. What started as a small ice cream cart at local events has grown into a beloved dessert destination.',
      'Our commitment to quality ingredients and handcrafted treats has been at the heart of our business from day one. Every cookie is baked fresh daily, and our ice cream is made with premium ingredients.',
      'Today, Penguin Brothers continues to innovate with new flavors and treats while maintaining the same dedication to quality and customer experience that made us successful.',
    ],
    imageUrl: null,
    imageAlt: 'Penguin Brothers founders',
    imagePlaceholder: 'Founder Image Placeholder',
  });

  const values = getBlockValue(blocks, 'values', {
    title: 'Our Values',
    items: [
      {
        title: 'Quality Ingredients',
        description:
          'We use only the finest ingredients in our cookies and ice cream, sourcing locally whenever possible.',
      },
      {
        title: 'Handcrafted with Love',
        description:
          'Every cookie is baked fresh daily, and our ice cream is made in small batches to ensure quality.',
      },
      {
        title: 'Community First',
        description:
          'We believe in giving back to the community that has supported us through partnerships and events.',
      },
    ],
  });

  const team = getBlockValue(blocks, 'team', {
    title: 'Meet Our Team',
    members: [
      {
        name: 'John Penguin',
        title: 'Co-Founder & Head Baker',
        bio: 'John is the cookie mastermind behind our famous recipes.',
        imageUrl: null,
      },
      {
        name: 'James Penguin',
        title: 'Co-Founder & Ice Cream Specialist',
        bio: 'James creates our unique ice cream flavors with passion and creativity.',
        imageUrl: null,
      },
      {
        name: 'Sarah Smith',
        title: 'Catering Manager',
        bio: 'Sarah ensures our catering events run smoothly and exceed expectations.',
        imageUrl: null,
      },
      {
        name: 'Michael Johnson',
        title: 'Store Manager',
        bio: 'Michael leads our amazing team at the main store location.',
        imageUrl: null,
      },
    ],
  });

  const cta = getBlockValue(blocks, 'careers_cta', {
    title: 'Join the Penguin Brothers Family',
    description: "We're always looking for passionate people to join our growing team.",
    buttonLabel: 'Contact Us About Careers',
    buttonHref: '/contact',
  });

  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <h1 className="text-4xl font-bold mb-2 text-center">{header.title}</h1>
      <p className="text-xl text-center mb-12 text-gray-600">
        {header.subtitle}
      </p>
      
      {/* Our Story Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{story.title}</h2>
            {(story.paragraphs as string[]).map((paragraph, index) => (
              <p
                key={`story-${index}`}
                className={index < (story.paragraphs as string[]).length - 1 ? 'text-gray-600 mb-4' : 'text-gray-600'}
              >
                {paragraph}
              </p>
            ))}
          </div>
          {story.imageUrl ? (
            <div className="relative h-80 overflow-hidden rounded-lg">
              <Image src={story.imageUrl} alt={story.imageAlt} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              {story.imagePlaceholder}
            </div>
          )}
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="mb-16 bg-blue-50 p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-8 text-center">{values.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(values.items as Array<{ title: string; description: string }>).map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold mb-4">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Team Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">{team.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {(team.members as Array<{ name: string; title: string; bio: string; imageUrl?: string | null }>).map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              {member.imageUrl ? (
                <div className="relative h-48">
                  <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  Team Photo Placeholder
                </div>
              )}
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-pink-500 font-medium mb-2">{member.title}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Join Us CTA */}
      <section className="bg-gradient-to-r from-pink-100 to-blue-100 p-8 rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-4">{cta.title}</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          {cta.description}
        </p>
        <Link 
          href={cta.buttonHref}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {cta.buttonLabel}
        </Link>
      </section>
    </div>
  );
}
