import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  calculateCheckoutTotals,
  getPickupLocations,
  persistPendingOrder,
  releasePickupSlot,
  reservePickupSlot,
  type CheckoutCartItem,
  type CheckoutCustomer,
  type CheckoutPickup,
} from '@/lib/orders';
import {
  createSquarePaymentLink,
  hasSquareConfig,
  SquareApiError,
} from '@/lib/square';
import { logAnalyticsEvent } from '@/lib/analytics';
import { getSupabaseServiceClient, hasSupabaseServiceConfig } from '@/lib/supabase';

type CheckoutRequestBody = {
  cartItems: CheckoutCartItem[];
  customer: CheckoutCustomer;
  pickup: CheckoutPickup;
  notes?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateCheckoutPayload(body: Partial<CheckoutRequestBody>) {
  if (!Array.isArray(body.cartItems) || body.cartItems.length === 0) {
    return 'Cart is empty.';
  }

  if (!body.customer) {
    return 'Customer information is required.';
  }

  if (
    !body.customer.firstName?.trim() ||
    !body.customer.lastName?.trim() ||
    !body.customer.email?.trim() ||
    !body.customer.phone?.trim()
  ) {
    return 'Complete customer information is required.';
  }

  if (!isValidEmail(body.customer.email)) {
    return 'A valid email address is required.';
  }

  if (!body.pickup?.locationSlug || !body.pickup?.pickupDate || !body.pickup?.pickupTime) {
    return 'Pickup location, date, and time are required.';
  }

  return null;
}

function buildSuccessRedirectUrl(request: NextRequest, orderId: string) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const successUrl = new URL('/checkout/success', appBaseUrl);
  successUrl.searchParams.set('orderId', orderId);
  return successUrl.toString();
}

function normalizePickupTime(value: string) {
  if (!value) {
    return null;
  }

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.length === 5 ? `${value}:00` : value;
  }

  const idMatch = value.match(/-(\d{1,2})$/);
  if (!idMatch) {
    return null;
  }

  const hour = Number.parseInt(idMatch[1], 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    return null;
  }

  return `${String(hour).padStart(2, '0')}:00:00`;
}

function toSquarePickupAt(pickupDate: string, pickupTime: string) {
  const normalizedTime = normalizePickupTime(pickupTime);
  if (!normalizedTime) {
    return null;
  }

  const localDateTime = new Date(`${pickupDate}T${normalizedTime}`);
  if (Number.isNaN(localDateTime.getTime())) {
    return null;
  }

  const utcOffsetMinutes = -localDateTime.getTimezoneOffset();
  const sign = utcOffsetMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(utcOffsetMinutes);
  const offsetHours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const offsetMinutes = String(absoluteMinutes % 60).padStart(2, '0');

  return `${pickupDate}T${normalizedTime}${sign}${offsetHours}:${offsetMinutes}`;
}

export async function POST(request: NextRequest) {
  if (!hasSquareConfig()) {
    return NextResponse.json(
      {
        error:
          'Square is not configured yet. Set SQUARE_ACCESS_TOKEN and location environment variables.',
      },
      { status: 503 }
    );
  }

  let payload: CheckoutRequestBody;
  try {
    payload = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const validationError = validateCheckoutPayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const locations = await getPickupLocations();
  const selectedLocation = locations.find((location) => location.slug === payload.pickup.locationSlug);
  if (!selectedLocation) {
    return NextResponse.json({ error: 'Invalid pickup location.' }, { status: 400 });
  }

  if (!selectedLocation.squareLocationId) {
    return NextResponse.json(
      {
        error:
          'Pickup location is missing Square location mapping. Update pickup location settings first.',
      },
      { status: 400 }
    );
  }

  const calculation = await calculateCheckoutTotals(payload.cartItems);
  if (calculation.normalizedItems.length === 0) {
    return NextResponse.json({ error: 'No valid cart items found.' }, { status: 400 });
  }

  try {
    await logAnalyticsEvent({
      eventName: 'checkout_create_requested',
      source: 'api',
      metadata: {
        cartItemCount: payload.cartItems.length,
        locationSlug: payload.pickup.locationSlug,
      },
    });
  } catch (analyticsError) {
    console.error('Failed to log checkout_create_requested:', analyticsError);
  }

  const idempotencyKey = randomUUID();
  let reserved = false;

  try {
    await reservePickupSlot({
      locationSlug: payload.pickup.locationSlug,
      squareLocationId: selectedLocation.squareLocationId,
      pickupDate: payload.pickup.pickupDate,
      pickupTime: payload.pickup.pickupTime,
    });
    reserved = true;

    const pickupAt = toSquarePickupAt(payload.pickup.pickupDate, payload.pickup.pickupTime);
    const pickupRecipientName = `${payload.customer.firstName} ${payload.customer.lastName}`.trim();

    const orderRecord = await persistPendingOrder({
      customer: payload.customer,
      pickup: payload.pickup,
      location: selectedLocation,
      calculation,
      cartItems: payload.cartItems,
      idempotencyKey,
      notes: payload.notes ?? null,
    });

    const paymentLink = await createSquarePaymentLink({
      idempotencyKey: randomUUID(),
      locationId: selectedLocation.squareLocationId,
      order: {
        location_id: selectedLocation.squareLocationId,
        reference_id: orderRecord.public_order_id,
        line_items: calculation.normalizedItems.map((lineItem) => ({
          name: lineItem.name,
          quantity: String(lineItem.quantity),
          catalog_object_id: lineItem.squareCatalogObjectId ?? undefined,
          base_price_money: {
            amount: lineItem.unitPriceCents,
            currency: calculation.currency,
          },
        })),
        taxes: [
          {
            name: 'Sales Tax',
            percentage: '8.25',
            scope: 'ORDER',
          },
        ],
        fulfillments: [
          {
            type: 'PICKUP',
            pickup_details: {
              schedule_type: pickupAt ? 'SCHEDULED' : 'ASAP',
              pickup_at: pickupAt ?? undefined,
              recipient: {
                display_name: pickupRecipientName || orderRecord.public_order_id,
              },
            },
          },
        ],
        note: payload.notes ?? undefined,
      },
      checkoutOptions: {
        allowTipping: false,
        redirectUrl: buildSuccessRedirectUrl(request, orderRecord.id),
      },
      note: `Order ${orderRecord.public_order_id}`,
    });

    if (hasSupabaseServiceConfig()) {
      const supabase = getSupabaseServiceClient();
      await supabase
        .from('orders')
        .update({
          square_checkout_id: paymentLink.id,
          square_order_id: paymentLink.orderId ?? null,
        })
        .eq('id', orderRecord.id);
    }

    try {
      await logAnalyticsEvent({
        eventName: 'checkout_create_succeeded',
        source: 'api',
        orderId: orderRecord.id,
        metadata: {
          locationSlug: payload.pickup.locationSlug,
          totalCents: calculation.totalCents,
          squareOrderId: paymentLink.orderId ?? null,
          squareCheckoutId: paymentLink.id ?? null,
        },
      });
    } catch (analyticsError) {
      console.error('Failed to log checkout_create_succeeded:', analyticsError);
    }

    return NextResponse.json({
      checkoutUrl: paymentLink.url,
      orderId: orderRecord.id,
      publicOrderId: orderRecord.public_order_id,
      amount: {
        subtotalCents: calculation.subtotalCents,
        taxCents: calculation.taxCents,
        totalCents: calculation.totalCents,
        currency: calculation.currency,
      },
    });
  } catch (error) {
    if (reserved) {
      try {
        await releasePickupSlot({
          locationSlug: payload.pickup.locationSlug,
          pickupDate: payload.pickup.pickupDate,
          pickupTime: payload.pickup.pickupTime,
        });
      } catch (releaseError) {
        console.error('Failed to release pickup slot after checkout error:', releaseError);
      }
    }

    if (error instanceof SquareApiError) {
      console.error('Square API error while creating checkout:', error.payload);
      try {
        await logAnalyticsEvent({
          eventName: 'checkout_create_failed',
          source: 'api',
          metadata: {
            reason: 'square_api_error',
            statusCode: error.statusCode,
            details: error.payload,
            locationSlug: payload.pickup.locationSlug,
          },
        });
      } catch (analyticsError) {
        console.error('Failed to log checkout_create_failed (Square):', analyticsError);
      }
      return NextResponse.json(
        {
          error: 'Unable to create Square checkout session.',
          details: error.payload,
        },
        { status: 502 }
      );
    }

    console.error('Checkout API failed:', error);
    try {
      await logAnalyticsEvent({
        eventName: 'checkout_create_failed',
        source: 'api',
        metadata: {
          reason: error instanceof Error ? error.message : 'unknown_error',
          locationSlug: payload.pickup.locationSlug,
          reserved,
        },
      });
    } catch (analyticsError) {
      console.error('Failed to log checkout_create_failed:', analyticsError);
    }
    return NextResponse.json(
      {
        error: reserved
          ? 'Checkout could not be created after reserving slot. Please try again or contact support.'
          : 'Checkout could not be created. Please try again.',
      },
      { status: 500 }
    );
  }
}
