import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import type { SquareCatalogVariation } from './catalog/types';

const squareEnvironment = process.env.SQUARE_ENV ?? process.env.SQUARE_ENVIRONMENT ?? 'sandbox';
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
const squareApiVersion = process.env.SQUARE_API_VERSION ?? '2025-01-23';

function getSquareBaseUrl() {
  return squareEnvironment === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

export function hasSquareConfig() {
  return Boolean(squareAccessToken);
}

export function verifySquareWebhookSignature(input: {
  signature: string | null;
  signatureKey: string;
  notificationUrl: string;
  requestBody: string;
}) {
  if (!input.signature) {
    return false;
  }

  const generated = createHmac('sha256', input.signatureKey)
    .update(input.notificationUrl + input.requestBody)
    .digest('base64');

  const a = Buffer.from(generated);
  const b = Buffer.from(input.signature);

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

export class SquareApiError extends Error {
  statusCode: number;
  payload?: unknown;

  constructor(message: string, statusCode: number, payload?: unknown) {
    super(message);
    this.name = 'SquareApiError';
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

async function squareRequest<TResponse>(
  path: string,
  init: RequestInit = {}
): Promise<TResponse> {
  if (!squareAccessToken) {
    throw new Error('Missing SQUARE_ACCESS_TOKEN environment variable.');
  }

  const response = await fetch(`${getSquareBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${squareAccessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': squareApiVersion,
      ...(init.headers ?? {}),
    },
  });

  const responseText = await response.text();
  const parsed = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new SquareApiError(
      `Square API request failed: ${response.status}`,
      response.status,
      parsed
    );
  }

  return parsed as TResponse;
}

function toIntegerAmount(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.round(value);
}

function parseVariationName(itemName: string, variationName?: string) {
  if (!variationName || variationName.toLowerCase() === 'regular') {
    return itemName;
  }

  return `${itemName} - ${variationName}`;
}

function parseProductCategory(categoryName: string | null): 'sandwich' | 'pookie' | 'ice-cream' {
  const normalizedCategory = (categoryName ?? '').toLowerCase();
  if (normalizedCategory.includes('pookie')) {
    return 'pookie';
  }
  if (
    normalizedCategory.includes('ice cream') &&
    !normalizedCategory.includes('sandwich')
  ) {
    return 'ice-cream';
  }
  return 'sandwich';
}

export async function fetchSquareCatalogVariations(): Promise<SquareCatalogVariation[]> {
  type SquareCatalogSearchResponse = {
    objects?: Array<Record<string, unknown>>;
    related_objects?: Array<Record<string, unknown>>;
  };

  const result = await squareRequest<SquareCatalogSearchResponse>('/v2/catalog/search', {
    method: 'POST',
    body: JSON.stringify({
      object_types: ['ITEM'],
      include_related_objects: true,
      include_deleted_objects: false,
      limit: 1000,
    }),
  });

  const objects = result.objects ?? [];
  const relatedObjects = result.related_objects ?? [];
  const imageById = new Map<string, string>();
  const categoryNameById = new Map<string, string>();

  for (const related of relatedObjects) {
    const relatedType = related.type;
    if (relatedType === 'IMAGE' && typeof related.id === 'string') {
      const imageData = related.image_data as { url?: string } | undefined;
      if (imageData?.url) {
        imageById.set(related.id, imageData.url);
      }
    }
    if (relatedType === 'CATEGORY' && typeof related.id === 'string') {
      const categoryData = related.category_data as { name?: string } | undefined;
      if (categoryData?.name) {
        categoryNameById.set(related.id, categoryData.name);
      }
    }
  }

  const variations: SquareCatalogVariation[] = [];

  for (const object of objects) {
    if (object.type !== 'ITEM' || typeof object.id !== 'string') {
      continue;
    }

    const itemData = object.item_data as
      | {
          name?: string;
          description?: string;
          category_id?: string;
          image_ids?: string[];
          variations?: Array<Record<string, unknown>>;
        }
      | undefined;

    if (!itemData?.name || !itemData.variations?.length) {
      continue;
    }

    const itemImageUrl = itemData.image_ids?.find((id) => imageById.has(id));
    const categoryName = itemData.category_id ? categoryNameById.get(itemData.category_id) ?? null : null;

    for (const variation of itemData.variations) {
      if (typeof variation.id !== 'string') {
        continue;
      }

      const variationData = variation.item_variation_data as
        | {
            name?: string;
            price_money?: { amount?: number; currency?: string };
          }
        | undefined;

      const amount = toIntegerAmount(variationData?.price_money?.amount);
      if (amount <= 0) {
        continue;
      }

      variations.push({
        squareItemId: object.id,
        squareVariationId: variation.id,
        name: parseVariationName(itemData.name, variationData?.name),
        description: itemData.description ?? null,
        category: categoryName,
        priceCents: amount,
        currency: variationData?.price_money?.currency ?? 'USD',
        imageUrl: itemImageUrl ? imageById.get(itemImageUrl) ?? null : null,
        isArchived: Boolean(object.is_deleted),
        raw: {
          item: object,
          variation,
          inferredProductType: parseProductCategory(categoryName),
        },
      });
    }
  }

  return variations;
}

export type CreateSquareOrderInput = {
  idempotencyKey?: string;
  locationId: string;
  lineItems: Array<{
    name: string;
    quantity: number;
    basePriceMoney: {
      amount: number;
      currency: string;
    };
    catalogObjectId?: string | null;
    note?: string | null;
    modifiers?: Array<{
      name: string;
      basePriceMoney?: {
        amount: number;
        currency: string;
      };
    }>;
  }>;
  taxes?: Array<{
    name: string;
    percentage: string;
    scope?: 'ORDER' | 'LINE_ITEM';
  }>;
  customerNote?: string | null;
  referenceId: string;
};

export async function createSquareOrder(input: CreateSquareOrderInput) {
  type SquareCreateOrderResponse = {
    order?: {
      id?: string;
      location_id?: string;
      total_money?: { amount?: number; currency?: string };
    };
  };

  const response = await squareRequest<SquareCreateOrderResponse>('/v2/orders', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: input.idempotencyKey ?? randomUUID(),
      order: {
        location_id: input.locationId,
        reference_id: input.referenceId,
        line_items: input.lineItems.map((lineItem) => ({
          name: lineItem.name,
          quantity: String(lineItem.quantity),
          catalog_object_id: lineItem.catalogObjectId ?? undefined,
          note: lineItem.note ?? undefined,
          base_price_money: lineItem.basePriceMoney,
          modifiers: lineItem.modifiers?.map((modifier) => ({
            name: modifier.name,
            base_price_money: modifier.basePriceMoney,
          })),
        })),
        taxes: input.taxes,
        fulfillments: [
          {
            type: 'PICKUP',
            pickup_details: {
              recipient: {
                display_name: input.referenceId,
              },
            },
          },
        ],
        note: input.customerNote ?? undefined,
      },
    }),
  });

  if (!response.order?.id) {
    throw new Error('Square order creation did not return an order id.');
  }

  return response.order;
}

export type CreateSquarePaymentLinkInput = {
  idempotencyKey?: string;
  orderId: string;
  locationId: string;
  checkoutOptions?: {
    allowTipping?: boolean;
    redirectUrl?: string;
  };
  prePopulatedData?: {
    buyerEmail?: string;
  };
  note?: string;
};

export async function createSquarePaymentLink(input: CreateSquarePaymentLinkInput) {
  type SquareCreatePaymentLinkResponse = {
    payment_link?: {
      id?: string;
      url?: string;
      order_id?: string;
    };
  };

  const response = await squareRequest<SquareCreatePaymentLinkResponse>(
    '/v2/online-checkout/payment-links',
    {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: input.idempotencyKey ?? randomUUID(),
        order_id: input.orderId,
        checkout_options: {
          ask_for_shipping_address: false,
          redirect_url: input.checkoutOptions?.redirectUrl,
          allow_tipping: input.checkoutOptions?.allowTipping ?? false,
        },
        pre_populated_data: {
          buyer_email: input.prePopulatedData?.buyerEmail,
        },
        quick_pay: undefined,
        payment_note: input.note,
      }),
    }
  );

  if (!response.payment_link?.id || !response.payment_link?.url) {
    throw new Error('Square payment link creation did not return link details.');
  }

  return response.payment_link;
}
