import { NextRequest, NextResponse } from 'next/server';
import { getCatalogData } from '@/lib/catalog';

export async function GET(request: NextRequest) {
  try {
    const includeHidden = request.nextUrl.searchParams.get('includeHidden') === 'true';
    const catalog = await getCatalogData({ includeHidden });
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Failed to fetch catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog data.' }, { status: 500 });
  }
}
