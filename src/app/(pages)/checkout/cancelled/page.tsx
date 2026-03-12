import Link from 'next/link';

export default function CheckoutCancelledPage() {
  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold">Checkout cancelled</h1>
        <p className="mb-6 text-gray-600">
          Your payment session was cancelled. Your cart is still available if you want to try again.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/checkout"
            className="rounded-lg bg-cherry-pink px-5 py-2 font-semibold text-white hover:bg-cherry-pink-dark"
          >
            Return to Checkout
          </Link>
          <Link
            href="/cart"
            className="rounded-lg border border-black px-5 py-2 font-semibold text-black hover:bg-gray-100"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
