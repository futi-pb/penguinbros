import { getDefaultCatalogData } from './defaults';
import type { CatalogData, CatalogItem, CatalogSyncResult, ProductType } from './types';
import { fetchSquareCatalogVariations, hasSquareConfig } from '../square';
import {
  getSupabaseServiceClient,
  hasSupabaseServiceConfig,
  type ProductOverrideRecord,
} from '../supabase';

type SquareCatalogRow = {
  square_item_id: string;
  square_variation_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  currency: string;
  is_archived: boolean;
  image_url: string | null;
  synced_at: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function inferProductTypeFromCategory(category?: string | null): ProductType {
  const normalized = (category ?? '').toLowerCase();

  if (normalized.includes('pookie')) {
    return 'pookie';
  }

  if (normalized.includes('ice cream') && !normalized.includes('sandwich')) {
    return 'ice-cream';
  }

  return 'sandwich';
}

function inferCategoryId(categoryName: string | null, productType: ProductType) {
  if (categoryName) {
    return slugify(categoryName);
  }
  if (productType === 'pookie') {
    return 'pookies';
  }
  if (productType === 'ice-cream') {
    return 'ice-cream';
  }
  return 'ice-cream-sandwiches';
}

export async function getCatalogData(options?: {
  includeHidden?: boolean;
}): Promise<CatalogData> {
  if (!hasSupabaseServiceConfig()) {
    return getDefaultCatalogData();
  }

  const supabase = getSupabaseServiceClient();
  const includeHidden = options?.includeHidden ?? false;

  const [{ data: catalogRows, error: catalogError }, { data: overrideRows, error: overrideError }] =
    await Promise.all([
      supabase
        .from('square_catalog_items')
        .select(
          'square_item_id,square_variation_id,name,description,category,price_cents,currency,is_archived,image_url,synced_at'
        )
        .eq('is_archived', false),
      supabase
        .from('product_overrides')
        .select(
          'id,square_item_id,square_variation_id,slug,display_name,display_description,image_url,is_featured,feature_rank,is_visible,tags,category_override,custom_badge,updated_by,created_at,updated_at'
        ),
    ]);

  if (catalogError || !catalogRows?.length) {
    return getDefaultCatalogData();
  }

  if (overrideError) {
    throw overrideError;
  }

  const overrides = (overrideRows ?? []) as ProductOverrideRecord[];
  const overrideByVariation = new Map<string, ProductOverrideRecord>();
  const overrideByItem = new Map<string, ProductOverrideRecord>();

  for (const override of overrides) {
    if (override.square_variation_id) {
      overrideByVariation.set(override.square_variation_id, override);
    }
    overrideByItem.set(override.square_item_id, override);
  }

  const categories = new Map<string, { id: string; name: string; description: string }>();
  const items: CatalogItem[] = [];
  let latestSync: string | null = null;

  for (const row of catalogRows as SquareCatalogRow[]) {
    const override =
      overrideByVariation.get(row.square_variation_id) ?? overrideByItem.get(row.square_item_id);
    const productType = inferProductTypeFromCategory(override?.category_override ?? row.category);
    const categoryName = override?.category_override ?? row.category ?? 'Menu';
    const categoryId = inferCategoryId(categoryName, productType);
    const isVisible = override?.is_visible ?? true;

    if (!includeHidden && !isVisible) {
      continue;
    }

    if (!categories.has(categoryId)) {
      categories.set(categoryId, {
        id: categoryId,
        name: categoryName,
        description: '',
      });
    }

    const displayName = override?.display_name ?? row.name;
    const slug = override?.slug ?? slugify(displayName);

    items.push({
      id: slug,
      slug,
      name: displayName,
      description: override?.display_description ?? row.description ?? '',
      priceCents: row.price_cents,
      currency: row.currency ?? 'USD',
      productType,
      categoryId,
      imageUrl: override?.image_url ?? row.image_url,
      isFeatured: override?.is_featured ?? false,
      featureRank: override?.feature_rank ?? 999,
      isVisible,
      tags: override?.tags ?? [],
      squareItemId: row.square_item_id,
      squareVariationId: row.square_variation_id,
    });

    if (!latestSync || row.synced_at > latestSync) {
      latestSync = row.synced_at;
    }
  }

  if (!items.length) {
    return getDefaultCatalogData();
  }

  const sortedItems = items.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }
    if (a.featureRank !== b.featureRank) {
      return a.featureRank - b.featureRank;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    source: 'square-cache',
    syncedAt: latestSync,
    categories: Array.from(categories.values()),
    items: sortedItems,
  };
}

export async function syncSquareCatalogCache(): Promise<CatalogSyncResult> {
  if (!hasSquareConfig()) {
    throw new Error('Square is not configured. Set SQUARE_ACCESS_TOKEN first.');
  }
  if (!hasSupabaseServiceConfig()) {
    throw new Error(
      'Supabase service role is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  const supabase = getSupabaseServiceClient();
  const squareVariations = await fetchSquareCatalogVariations();
  const syncedAt = new Date().toISOString();

  if (!squareVariations.length) {
    return {
      syncedCount: 0,
      skippedCount: 0,
      syncedAt,
    };
  }

  const payload = squareVariations.map((variation) => ({
    square_item_id: variation.squareItemId,
    square_variation_id: variation.squareVariationId,
    name: variation.name,
    description: variation.description,
    category: variation.category,
    price_cents: variation.priceCents,
    currency: variation.currency,
    is_archived: variation.isArchived,
    image_url: variation.imageUrl,
    raw: variation.raw,
    synced_at: syncedAt,
  }));

  const { error: archiveError } = await supabase
    .from('square_catalog_items')
    .update({ is_archived: true, synced_at: syncedAt })
    .neq('square_variation_id', '__none__');

  if (archiveError) {
    throw archiveError;
  }

  const { error: upsertError } = await supabase
    .from('square_catalog_items')
    .upsert(payload, { onConflict: 'square_variation_id' });

  if (upsertError) {
    throw upsertError;
  }

  return {
    syncedCount: payload.length,
    skippedCount: 0,
    syncedAt,
  };
}

export async function getCatalogItemLookup() {
  const catalog = await getCatalogData({ includeHidden: true });
  const byId = new Map<string, CatalogItem>();

  for (const item of catalog.items) {
    byId.set(item.id, item);
    if (item.squareVariationId) {
      byId.set(item.squareVariationId, item);
    }
    if (item.squareItemId) {
      byId.set(item.squareItemId, item);
    }
  }

  return byId;
}
