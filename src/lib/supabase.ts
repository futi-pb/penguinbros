import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let browserClient: SupabaseClient | null = null;

function assertPublicConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase public environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

function assertServiceConfig() {
  assertPublicConfig();
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }
}

export function hasSupabasePublicConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function hasSupabaseServiceConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getSupabaseBrowserClient() {
  assertPublicConfig();

  if (!browserClient) {
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}

export function getSupabaseServerClient(accessToken?: string) {
  assertPublicConfig();

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function getSupabaseServiceClient() {
  assertServiceConfig();

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Backward-compatible default export for existing browser-only usage.
export const supabase =
  typeof window !== 'undefined' && hasSupabasePublicConfig()
    ? getSupabaseBrowserClient()
    : null;

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_prep'
  | 'ready'
  | 'picked_up'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type OrderRecord = {
  id: string;
  public_order_id: string;
  square_order_id: string | null;
  square_payment_id: string | null;
  square_checkout_id: string | null;
  square_location_id: string;
  location_slug: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  pickup_date: string;
  pickup_time: string;
  pickup_window_label: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  confirmed_at: string | null;
  ready_at: string | null;
  picked_up_at: string | null;
  canceled_at: string | null;
};

export type OrderItemRecord = {
  id: string;
  order_id: string;
  square_catalog_object_id: string | null;
  square_catalog_version: number | null;
  item_key: string | null;
  name: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  modifiers: Record<string, unknown>[];
  image_url: string | null;
  created_at: string;
};

export type PickupSlotRecord = {
  id: string;
  location_slug: string;
  square_location_id: string;
  slot_date: string;
  slot_time: string;
  capacity: number;
  reserved_count: number;
  lead_time_minutes: number;
  is_blackout: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettingRecord = {
  setting_key: string;
  setting_type: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductOverrideRecord = {
  id: string;
  square_item_id: string;
  square_variation_id: string | null;
  slug: string | null;
  display_name: string | null;
  display_description: string | null;
  image_url: string | null;
  is_featured: boolean;
  feature_rank: number;
  category_override: string | null;
  tags: string[];
  is_visible: boolean;
  custom_badge: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};
