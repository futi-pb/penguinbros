import { getSupabaseServiceClient, hasSupabaseServiceConfig } from './supabase';

export type AnalyticsEventInput = {
  eventName: string;
  source?: string;
  sessionId?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAnalyticsEvent(input: AnalyticsEventInput) {
  if (!hasSupabaseServiceConfig()) {
    return;
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from('analytics_events').insert({
    event_name: input.eventName,
    source: input.source ?? 'web',
    session_id: input.sessionId ?? null,
    order_id: input.orderId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw error;
  }
}
