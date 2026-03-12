export type ProductType = 'sandwich' | 'pookie' | 'ice-cream';

export type CatalogCategory = {
  id: string;
  name: string;
  description: string;
};

export type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  productType: ProductType;
  categoryId: string;
  imageUrl: string | null;
  isFeatured: boolean;
  featureRank: number;
  isVisible: boolean;
  tags: string[];
  squareItemId: string | null;
  squareVariationId: string | null;
};

export type CatalogData = {
  source: 'square-cache' | 'fallback';
  syncedAt: string | null;
  categories: CatalogCategory[];
  items: CatalogItem[];
};

export type CatalogSyncResult = {
  syncedCount: number;
  skippedCount: number;
  syncedAt: string;
};

export type SquareCatalogVariation = {
  squareItemId: string;
  squareVariationId: string;
  name: string;
  description: string | null;
  category: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  isArchived: boolean;
  raw: Record<string, unknown>;
};
