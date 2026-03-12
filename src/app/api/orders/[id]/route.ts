import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orders';
import { getSupabaseServiceClient, hasSupabaseServiceConfig } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    let lineItems: Array<Record<string, unknown>> = [];
    if (hasSupabaseServiceConfig()) {
      const supabase = getSupabaseServiceClient();
      const { data } = await supabase
        .from('order_items')
        .select('id,name,quantity,unit_price_cents,total_price_cents,item_key')
        .eq('order_id', order.id);
      lineItems = data ?? [];
    }

    return NextResponse.json({
      ...order,
      lineItems,
    });
  } catch (error) {
    console.error('Failed to fetch order status:', error);
    return NextResponse.json({ error: 'Failed to fetch order status.' }, { status: 500 });
  }
}
