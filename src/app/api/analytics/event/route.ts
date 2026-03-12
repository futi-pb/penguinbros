import { NextRequest, NextResponse } from 'next/server';
import { logAnalyticsEvent } from '@/lib/analytics';

type AnalyticsPayload = {
  eventName?: string;
  source?: string;
  sessionId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  let payload: AnalyticsPayload;
  try {
    payload = (await request.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  if (!payload.eventName) {
    return NextResponse.json({ error: 'eventName is required.' }, { status: 400 });
  }

  try {
    await logAnalyticsEvent({
      eventName: payload.eventName,
      source: payload.source ?? 'web',
      sessionId: payload.sessionId ?? null,
      orderId: payload.orderId ?? null,
      metadata: payload.metadata ?? {},
    });
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }

  return NextResponse.json({ ok: true });
}
