import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseServiceClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ key: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  const { key } = await context.params;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_key,setting_type,value,updated_at')
    .eq('setting_key', key)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Setting not found.' }, { status: 404 });
  }

  return NextResponse.json({ setting: data });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { admin, errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  const { key } = await context.params;
  let payload: { value?: Record<string, unknown>; settingType?: string };
  try {
    payload = (await request.json()) as { value?: Record<string, unknown>; settingType?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  if (!payload.value || typeof payload.value !== 'object') {
    return NextResponse.json({ error: 'A JSON value object is required.' }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('site_settings')
    .upsert(
      {
        setting_key: key,
        setting_type: payload.settingType ?? 'json',
        value: payload.value,
        updated_by: admin?.authUserId ?? null,
      },
      { onConflict: 'setting_key' }
    )
    .select('setting_key,setting_type,value,updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ setting: data });
}
