import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseServiceClient } from '@/lib/supabase';

type ProductOverrideInput = {
  id?: string;
  squareItemId: string;
  squareVariationId?: string | null;
  slug?: string | null;
  displayName?: string | null;
  displayDescription?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  featureRank?: number;
  categoryOverride?: string | null;
  tags?: string[];
  isVisible?: boolean;
  customBadge?: string | null;
};

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('product_overrides')
    .select(
      'id,square_item_id,square_variation_id,slug,display_name,display_description,image_url,is_featured,feature_rank,category_override,tags,is_visible,custom_badge,updated_at'
    )
    .order('feature_rank', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ overrides: data ?? [] });
}

export async function PUT(request: NextRequest) {
  const { admin, errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  let payload: { overrides?: ProductOverrideInput[] };
  try {
    payload = (await request.json()) as { overrides?: ProductOverrideInput[] };
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  if (!Array.isArray(payload.overrides)) {
    return NextResponse.json({ error: 'overrides array is required.' }, { status: 400 });
  }

  const rows = payload.overrides
    .filter((item) => item.squareItemId)
    .map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      square_item_id: item.squareItemId,
      square_variation_id: item.squareVariationId ?? null,
      slug: item.slug ?? null,
      display_name: item.displayName ?? null,
      display_description: item.displayDescription ?? null,
      image_url: item.imageUrl ?? null,
      is_featured: item.isFeatured ?? false,
      feature_rank: Number.isFinite(item.featureRank) ? Number(item.featureRank) : 999,
      category_override: item.categoryOverride ?? null,
      tags: Array.isArray(item.tags) ? item.tags : [],
      is_visible: item.isVisible ?? true,
      custom_badge: item.customBadge ?? null,
      updated_by: admin?.authUserId ?? null,
    }));

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('product_overrides')
    .upsert(rows, { onConflict: 'id' })
    .select(
      'id,square_item_id,square_variation_id,slug,display_name,display_description,image_url,is_featured,feature_rank,category_override,tags,is_visible,custom_badge,updated_at'
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ overrides: data ?? [] });
}
