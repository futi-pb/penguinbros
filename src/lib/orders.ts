import { randomUUID } from 'crypto';
import { getCatalogItemLookup } from './catalog';
import { getSupabaseServiceClient, hasSupabaseServiceConfig } from './supabase';

export type CheckoutLocation = {
  slug: string;
  name: string;
  address: string;
  squareLocationId: string;
};

export type CheckoutCartItem = {
  id: string;
  productType: 'sandwich' | 'pookie' | 'ice-cream';
  name: string;
  quantity: number;
  price: number;
  catalogItemId?: string | null;
  squareVariationId?: string | null;
  topCookie?: string | null;
  bottomCookie?: string | null;
  iceCream?: string | null;
};

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type CheckoutPickup = {
  locationSlug: string;
  pickupDate: string;
  pickupTime: string;
};

export type NormalizedLineItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  squareCatalogObjectId: string | null;
  itemKey: string | null;
  modifiers: Array<Record<string, unknown>>;
};

export type CalculatedCheckout = {
  normalizedItems: NormalizedLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
};

const FALLBACK_PICKUP_LOCATIONS: CheckoutLocation[] = [
  {
    slug: 'provo',
    name: 'Provo Store',
    address: '1200 N University Ave, Provo, UT 84604',
    squareLocationId: process.env.SQUARE_LOCATION_ID_PROVO ?? process.env.SQUARE_LOCATION_ID ?? '',
  },
  {
    slug: 'orem',
    name: 'Orem Store',
    address: '800 S State St, Orem, UT 84058',
    squareLocationId: process.env.SQUARE_LOCATION_ID_OREM ?? process.env.SQUARE_LOCATION_ID ?? '',
  },
];

const PRODUCT_BASE_PRICE_CENTS: Record<CheckoutCartItem['productType'], number> = {
  sandwich: 799,
  pookie: 899,
  'ice-cream': 499,
};

const DEFAULT_PICKUP_CAPACITY = 12;
const DEFAULT_LEAD_TIME_MINUTES = 60;
const DEFAULT_TAX_RATE = 0.0825;

function getFallbackSquareLocationId(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  if (normalizedSlug === 'provo') {
    return process.env.SQUARE_LOCATION_ID_PROVO ?? process.env.SQUARE_LOCATION_ID ?? '';
  }
  if (normalizedSlug === 'orem') {
    return process.env.SQUARE_LOCATION_ID_OREM ?? process.env.SQUARE_LOCATION_ID ?? '';
  }
  return process.env.SQUARE_LOCATION_ID ?? '';
}

function isReservePickupSlotAmbiguityError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === '42702' &&
    typeof maybeError.message === 'string' &&
    maybeError.message.includes('reserved_count') &&
    maybeError.message.includes('ambiguous')
  );
}

function toCents(value: number) {
  return Math.max(0, Math.round(value * 100));
}

function sanitizeQuantity(quantity: number) {
  const parsed = Number.isFinite(quantity) ? Math.round(quantity) : 0;
  return Math.max(1, parsed);
}

function sanitizeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid pickup date.');
  }
  return date.toISOString().split('T')[0];
}

function sanitizeTime(value: string) {
  if (!value) {
    throw new Error('Pickup time is required.');
  }

  // Accept either "HH:mm" or previous slot id format like "2026-03-11-14"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.length === 5 ? `${value}:00` : value;
  }

  const idMatch = value.match(/-(\d{1,2})$/);
  if (!idMatch) {
    throw new Error('Invalid pickup time format.');
  }

  const hour = Number.parseInt(idMatch[1], 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    throw new Error('Invalid pickup time hour.');
  }

  return `${String(hour).padStart(2, '0')}:00:00`;
}

function parseLocationSetting(raw: unknown): CheckoutLocation[] {
  if (!raw || typeof raw !== 'object') {
    return [];
  }

  const locations = (raw as { locations?: Array<Record<string, unknown>> }).locations;
  if (!Array.isArray(locations)) {
    return [];
  }

  return locations
    .map((location) => {
      const slug = String(location.slug ?? '');
      const squareLocationId =
        String(location.square_location_id ?? '').trim() || getFallbackSquareLocationId(slug);

      return {
        slug,
        name: String(location.name ?? ''),
        address: String(location.address ?? ''),
        squareLocationId,
      };
    })
    .filter((location) => location.slug && location.name);
}

export async function getPickupLocations(): Promise<CheckoutLocation[]> {
  if (!hasSupabaseServiceConfig()) {
    return FALLBACK_PICKUP_LOCATIONS;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('setting_key', 'pickup_locations')
    .maybeSingle();

  if (error || !data?.value) {
    return FALLBACK_PICKUP_LOCATIONS;
  }

  const parsed = parseLocationSetting(data.value);
  if (!parsed.length) {
    return FALLBACK_PICKUP_LOCATIONS;
  }

  return parsed;
}

async function getPickupDefaults() {
  if (!hasSupabaseServiceConfig()) {
    return {
      capacity: DEFAULT_PICKUP_CAPACITY,
      leadTimeMinutes: DEFAULT_LEAD_TIME_MINUTES,
    };
  }

  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('setting_key', 'pickup_default_capacity')
    .maybeSingle();

  const value = (data?.value ?? {}) as { capacity?: number; lead_time_minutes?: number };

  return {
    capacity: Number.isFinite(value.capacity) ? Number(value.capacity) : DEFAULT_PICKUP_CAPACITY,
    leadTimeMinutes: Number.isFinite(value.lead_time_minutes)
      ? Number(value.lead_time_minutes)
      : DEFAULT_LEAD_TIME_MINUTES,
  };
}

export async function calculateCheckoutTotals(cartItems: CheckoutCartItem[]): Promise<CalculatedCheckout> {
  const catalogLookup = await getCatalogItemLookup();
  const normalizedItems: NormalizedLineItem[] = [];
  let subtotalCents = 0;

  for (const cartItem of cartItems) {
    const quantity = sanitizeQuantity(cartItem.quantity);

    const matchedCatalogItem =
      (cartItem.catalogItemId ? catalogLookup.get(cartItem.catalogItemId) : undefined) ??
      (cartItem.squareVariationId ? catalogLookup.get(cartItem.squareVariationId) : undefined);

    const unitPriceCents =
      matchedCatalogItem?.priceCents ??
      PRODUCT_BASE_PRICE_CENTS[cartItem.productType] ??
      toCents(cartItem.price);
    const totalPriceCents = unitPriceCents * quantity;

    subtotalCents += totalPriceCents;

    normalizedItems.push({
      name: matchedCatalogItem?.name ?? cartItem.name,
      quantity,
      unitPriceCents,
      totalPriceCents,
      squareCatalogObjectId:
        matchedCatalogItem?.squareVariationId ?? cartItem.squareVariationId ?? null,
      itemKey: matchedCatalogItem?.id ?? cartItem.catalogItemId ?? null,
      modifiers: [
        {
          topCookie: cartItem.topCookie ?? null,
          bottomCookie: cartItem.bottomCookie ?? null,
          iceCream: cartItem.iceCream ?? null,
          productType: cartItem.productType,
        },
      ],
    });
  }

  const taxCents = Math.round(subtotalCents * DEFAULT_TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  return {
    normalizedItems,
    subtotalCents,
    taxCents,
    totalCents,
    currency: 'USD',
  };
}

export async function reservePickupSlot(input: {
  locationSlug: string;
  squareLocationId: string;
  pickupDate: string;
  pickupTime: string;
}) {
  if (!hasSupabaseServiceConfig()) {
    return {
      success: true,
      message: 'reserved_without_db',
    };
  }

  const defaults = await getPickupDefaults();
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase.rpc('reserve_pickup_slot', {
    p_location_slug: input.locationSlug,
    p_square_location_id: input.squareLocationId,
    p_slot_date: sanitizeDate(input.pickupDate),
    p_slot_time: sanitizeTime(input.pickupTime),
    p_default_capacity: defaults.capacity,
    p_lead_time_minutes: defaults.leadTimeMinutes,
  });

  if (error) {
    if (isReservePickupSlotAmbiguityError(error)) {
      console.warn(
        'reserve_pickup_slot uses a legacy function definition; falling back without reservation. Apply latest Supabase migration to restore capacity enforcement.',
        error
      );
      return {
        success: true,
        message: 'reserved_without_db',
      };
    }
    throw error;
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.success) {
    throw new Error(result?.message ?? 'Pickup slot is unavailable.');
  }

  return result;
}

export async function releasePickupSlot(input: {
  locationSlug: string;
  pickupDate: string;
  pickupTime: string;
}) {
  if (!hasSupabaseServiceConfig()) {
    return;
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.rpc('release_pickup_slot', {
    p_location_slug: input.locationSlug,
    p_slot_date: sanitizeDate(input.pickupDate),
    p_slot_time: sanitizeTime(input.pickupTime),
  });

  if (error) {
    throw error;
  }
}

export async function persistPendingOrder(input: {
  customer: CheckoutCustomer;
  pickup: CheckoutPickup;
  location: CheckoutLocation;
  calculation: CalculatedCheckout;
  cartItems: CheckoutCartItem[];
  squareOrderId?: string | null;
  squareCheckoutId?: string | null;
  idempotencyKey?: string | null;
  notes?: string | null;
}) {
  if (!hasSupabaseServiceConfig()) {
    return {
      id: randomUUID(),
      public_order_id: `PB-${Date.now()}`,
      status: 'pending_payment',
      payment_status: 'pending',
    };
  }

  const supabase = getSupabaseServiceClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      square_order_id: input.squareOrderId ?? null,
      square_checkout_id: input.squareCheckoutId ?? null,
      square_location_id: input.location.squareLocationId,
      location_slug: input.pickup.locationSlug,
      status: 'pending_payment',
      payment_status: 'pending',
      subtotal_cents: input.calculation.subtotalCents,
      tax_cents: input.calculation.taxCents,
      total_cents: input.calculation.totalCents,
      currency: input.calculation.currency,
      pickup_date: sanitizeDate(input.pickup.pickupDate),
      pickup_time: sanitizeTime(input.pickup.pickupTime),
      pickup_window_label: input.pickup.pickupTime,
      customer_first_name: input.customer.firstName,
      customer_last_name: input.customer.lastName,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      notes: input.notes ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      metadata: {
        locationName: input.location.name,
        locationAddress: input.location.address,
        originalCartItems: input.cartItems,
      },
    })
    .select('id,public_order_id,status,payment_status')
    .single();

  if (orderError || !order) {
    throw orderError ?? new Error('Failed to persist order record.');
  }

  const orderItemRows = input.calculation.normalizedItems.map((item) => ({
    order_id: order.id,
    square_catalog_object_id: item.squareCatalogObjectId,
    item_key: item.itemKey,
    name: item.name,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    total_price_cents: item.totalPriceCents,
    modifiers: item.modifiers,
  }));

  if (orderItemRows.length > 0) {
    const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemRows);
    if (orderItemsError) {
      throw orderItemsError;
    }
  }

  return order;
}

export async function getOrderById(orderId: string) {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id,public_order_id,status,payment_status,total_cents,currency,pickup_date,pickup_time,location_slug,customer_first_name,customer_last_name'
    )
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertWebhookEvent(input: {
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('webhook_events')
    .upsert(
      {
        provider: 'square',
        event_id: input.eventId,
        event_type: input.eventType,
        payload: input.payload,
      },
      { onConflict: 'event_id' }
    )
    .select('id,event_id,status')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateWebhookEventStatus(input: {
  eventId: string;
  status: 'processed' | 'failed' | 'ignored';
  error?: string | null;
}) {
  if (!hasSupabaseServiceConfig()) {
    return;
  }

  const supabase = getSupabaseServiceClient();
  await supabase
    .from('webhook_events')
    .update({
      status: input.status,
      error: input.error ?? null,
      processed_at: input.status === 'processed' ? new Date().toISOString() : null,
    })
    .eq('event_id', input.eventId);
}

export async function updateOrderPaymentStatus(input: {
  squareOrderId?: string | null;
  squarePaymentId?: string | null;
  status: string;
  paymentStatus: string;
}) {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  const supabase = getSupabaseServiceClient();
  let query = supabase.from('orders').update({
    status: input.status,
    payment_status: input.paymentStatus,
    square_payment_id: input.squarePaymentId ?? null,
    paid_at: input.paymentStatus === 'completed' ? new Date().toISOString() : null,
  });

  if (input.squareOrderId) {
    query = query.eq('square_order_id', input.squareOrderId);
  } else if (input.squarePaymentId) {
    query = query.eq('square_payment_id', input.squarePaymentId);
  } else {
    return null;
  }

  const { data, error } = await query.select('id,public_order_id,status,payment_status').maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
