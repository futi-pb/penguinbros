import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_key,setting_type,value,updated_at')
    .order('setting_key', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data ?? [] });
}
