import { Suspense } from 'react';
import CheckoutSuccessClient from './success-client';

function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <div className="max-w-3xl mx-auto rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold">Loading order...</h1>
        <p className="text-gray-600">Fetching your latest order status.</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
