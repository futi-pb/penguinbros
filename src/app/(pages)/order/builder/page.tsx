import { Suspense } from 'react';
import ProductBuilder from '@/components/product/ProductBuilder';
import Link from 'next/link';

export default function BuilderPage() {
  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <div className="mb-8">
        <Link 
          href="/order" 
          className="inline-flex items-center text-cherry-pink hover:text-cherry-pink-dark"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Order Menu
        </Link>
      </div>
      
      <Suspense fallback={<div className="text-center py-8">Loading product builder...</div>}>
        <ProductBuilder />
      </Suspense>
    </div>
  );
}
