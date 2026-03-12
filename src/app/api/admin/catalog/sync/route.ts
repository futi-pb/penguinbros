import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { syncSquareCatalogCache } from '@/lib/catalog';

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) {
      return errorResponse;
    }

    const result = await syncSquareCatalogCache();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error('Failed to sync Square catalog:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Catalog sync failed.',
      },
      { status: 500 }
    );
  }
}
