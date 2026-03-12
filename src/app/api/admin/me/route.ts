import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { admin, errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  return NextResponse.json({ admin });
}
