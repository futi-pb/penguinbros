import { NextResponse } from 'next/server';
import { getPickupLocations } from '@/lib/orders';

export async function GET() {
  try {
    const locations = await getPickupLocations();
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Failed to load pickup locations:', error);
    return NextResponse.json({ error: 'Failed to load pickup locations.' }, { status: 500 });
  }
}
