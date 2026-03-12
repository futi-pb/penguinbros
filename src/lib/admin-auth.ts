import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceClient } from './supabase';

export type AdminContext = {
  authUserId: string;
  email: string | null;
  role: string;
};

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.slice('Bearer '.length).trim();
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ admin: AdminContext | null; errorResponse: NextResponse | null }> {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }),
    };
  }

  const supabaseAuth = getSupabaseServerClient(accessToken);
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: 'Invalid session token.' }, { status: 401 }),
    };
  }

  const supabaseService = getSupabaseServiceClient();
  const { data: adminUser, error: adminError } = await supabaseService
    .from('admin_users')
    .select('auth_user_id,email,role,is_active')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (adminError || !adminUser) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }),
    };
  }

  return {
    admin: {
      authUserId: adminUser.auth_user_id,
      email: adminUser.email,
      role: adminUser.role,
    },
    errorResponse: null,
  };
}
