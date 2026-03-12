'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

type OrderStatusResponse = {
  id: string;
  public_order_id: string;
  status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  pickup_date: string;
  pickup_time: string;
  location_slug: string;
  customer_first_name: string;
  customer_last_name: string;
  lineItems: Array<{
    id: string;
    name: string;
    quantity: number;
    unit_price_cents: number;
    total_price_cents: number;
  }>;
};

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format((cents || 0) / 100);
}

function formatStatus(status: string) {
  switch (status) {
    case 'pending_payment':
      return 'Pending payment confirmation';
    case 'paid':
      return 'Paid - queued for prep';
    case 'in_prep':
      return 'In preparation';
    case 'ready':
      return 'Ready for pickup';
    case 'picked_up':
      return 'Picked up';
    case 'cancelled':
      return 'Cancelled';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
}

export default function CheckoutSuccessClient() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cartClearedRef = useRef(false);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      setError('Missing order id in the return URL.');
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to load order confirmation.');
        }

        if (!cancelled) {
          setOrder(data as OrderStatusResponse);
          setError(null);

          if (data.status === 'pending_payment') {
            pollTimer = setTimeout(fetchOrder, 3000);
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to fetch your order status.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, [orderId]);

  useEffect(() => {
    const paymentConfirmed = order?.payment_status === 'completed' || order?.status === 'paid';
    if (paymentConfirmed && !cartClearedRef.current) {
      cartClearedRef.current = true;
      clearCart();
      localStorage.removeItem('cart');
    }
  }, [order?.payment_status, order?.status, clearCart]);

  const headline = useMemo(() => {
    if (!order) {
      return 'Order status unavailable';
    }
    if (order.payment_status === 'completed') {
      return 'Payment confirmed';
    }
    if (order.payment_status === 'pending') {
      return 'Payment pending confirmation';
    }
    return 'Order update received';
  }, [order]);

  return (
    <div className="container mx-auto px-4 py-12 pt-[150px]">
      <div className="max-w-3xl mx-auto rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold">{headline}</h1>
        <p className="mb-6 text-gray-600">
          This page reflects your live order status from our backend.
        </p>

        {isLoading && <p className="text-gray-600">Loading order details...</p>}

        {!isLoading && error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!isLoading && order && (
          <div className="space-y-6">
            <div className="rounded-lg bg-isabelline p-4">
              <p>
                <strong>Order #:</strong> {order.public_order_id}
              </p>
              <p>
                <strong>Status:</strong> {formatStatus(order.status)}
              </p>
              <p>
                <strong>Payment:</strong> {order.payment_status}
              </p>
              <p>
                <strong>Pickup date:</strong> {order.pickup_date}
              </p>
              <p>
                <strong>Pickup time:</strong> {order.pickup_time}
              </p>
              <p>
                <strong>Location:</strong> {order.location_slug}
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold">Items</h2>
              <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                {order.lineItems?.map((lineItem) => (
                  <div key={lineItem.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{lineItem.name}</p>
                      <p className="text-sm text-gray-600">Qty {lineItem.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(lineItem.total_price_cents, order.currency)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t pt-3 font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total_cents, order.currency)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-cherry-pink px-5 py-2 font-semibold text-white hover:bg-cherry-pink-dark"
          >
            Back Home
          </Link>
          <Link
            href="/menu"
            className="rounded-lg border border-black px-5 py-2 font-semibold text-black hover:bg-gray-100"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
