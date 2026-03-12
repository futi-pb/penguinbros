import { NextRequest, NextResponse } from 'next/server';
import {
  updateOrderPaymentStatus,
  updateWebhookEventStatus,
  upsertWebhookEvent,
} from '@/lib/orders';
import { logAnalyticsEvent } from '@/lib/analytics';
import { getSupabaseServiceClient, hasSupabaseServiceConfig } from '@/lib/supabase';
import { verifySquareWebhookSignature } from '@/lib/square';

type SquareWebhookEvent = {
  event_id?: string;
  type?: string;
  data?: {
    object?: Record<string, unknown>;
    id?: string;
  };
};

function getPaymentObject(event: SquareWebhookEvent) {
  const dataObject = event.data?.object as { payment?: Record<string, unknown> } | undefined;
  if (dataObject?.payment) {
    return dataObject.payment;
  }
  if (event.data?.object) {
    return event.data.object;
  }
  return null;
}

function getRefundObject(event: SquareWebhookEvent) {
  const dataObject = event.data?.object as { refund?: Record<string, unknown> } | undefined;
  if (dataObject?.refund) {
    return dataObject.refund;
  }
  if (event.data?.object) {
    return event.data.object;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey) {
    return NextResponse.json(
      { error: 'Webhook signature key is not configured.' },
      { status: 503 }
    );
  }

  const signature = request.headers.get('x-square-hmacsha256-signature');
  const requestBody = await request.text();
  const configuredWebhookUrl =
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ??
    `${request.nextUrl.origin}/api/square/webhook`;

  const isValidSignature = verifySquareWebhookSignature({
    signature,
    signatureKey,
    notificationUrl: configuredWebhookUrl,
    requestBody,
  });

  if (!isValidSignature) {
    try {
      await logAnalyticsEvent({
        eventName: 'square_webhook_failed',
        source: 'api',
        metadata: {
          reason: 'invalid_signature',
        },
      });
    } catch (analyticsError) {
      console.error('Failed to log square_webhook_failed signature event:', analyticsError);
    }
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let payload: SquareWebhookEvent;
  try {
    payload = JSON.parse(requestBody) as SquareWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const eventId = payload.event_id;
  const eventType = payload.type;
  if (!eventId || !eventType) {
    return NextResponse.json({ error: 'Missing event metadata.' }, { status: 400 });
  }

  try {
    const webhookEvent = await upsertWebhookEvent({
      eventId,
      eventType,
      payload: payload as Record<string, unknown>,
    });

    if (webhookEvent?.status === 'processed') {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    if (eventType.startsWith('payment.')) {
      const payment = getPaymentObject(payload);
      const paymentStatus = String(payment?.status ?? '').toUpperCase();
      const squareOrderId = typeof payment?.order_id === 'string' ? payment.order_id : null;
      const squarePaymentId = typeof payment?.id === 'string' ? payment.id : null;

      if (paymentStatus === 'COMPLETED') {
        await updateOrderPaymentStatus({
          squareOrderId,
          squarePaymentId,
          status: 'paid',
          paymentStatus: 'completed',
        });
      } else if (paymentStatus === 'CANCELED') {
        await updateOrderPaymentStatus({
          squareOrderId,
          squarePaymentId,
          status: 'cancelled',
          paymentStatus: 'cancelled',
        });
      } else if (paymentStatus === 'FAILED') {
        await updateOrderPaymentStatus({
          squareOrderId,
          squarePaymentId,
          status: 'cancelled',
          paymentStatus: 'failed',
        });
      }
    } else if (eventType.startsWith('refund.')) {
      const refund = getRefundObject(payload);
      const squareRefundId = typeof refund?.id === 'string' ? refund.id : null;
      const squarePaymentId = typeof refund?.payment_id === 'string' ? refund.payment_id : null;
      const refundStatus = String(refund?.status ?? 'pending').toLowerCase();
      const amount =
        typeof refund?.amount_money === 'object' && refund.amount_money !== null
          ? (refund.amount_money as { amount?: number })
          : {};

      if (hasSupabaseServiceConfig() && squareRefundId) {
        const supabase = getSupabaseServiceClient();
        await supabase.from('refunds').upsert(
          {
            square_refund_id: squareRefundId,
            square_payment_id: squarePaymentId,
            amount_cents: Number.isFinite(amount.amount) ? amount.amount : 0,
            currency:
              typeof (refund?.amount_money as { currency?: string } | undefined)?.currency ===
              'string'
                ? (refund?.amount_money as { currency: string }).currency
                : 'USD',
            reason: typeof refund?.reason === 'string' ? refund.reason : null,
            status: refundStatus,
            metadata: refund as Record<string, unknown>,
          },
          { onConflict: 'square_refund_id' }
        );
      }

      if (refundStatus === 'completed') {
        await updateOrderPaymentStatus({
          squarePaymentId,
          status: 'refunded',
          paymentStatus: 'refunded',
        });
      }
    }

    await updateWebhookEventStatus({
      eventId,
      status: 'processed',
    });

    try {
      await logAnalyticsEvent({
        eventName: 'square_webhook_processed',
        source: 'api',
        metadata: {
          eventType,
          eventId,
        },
      });
    } catch (analyticsError) {
      console.error('Failed to log square_webhook_processed:', analyticsError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);

    await updateWebhookEventStatus({
      eventId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown webhook error',
    });

    try {
      await logAnalyticsEvent({
        eventName: 'square_webhook_failed',
        source: 'api',
        metadata: {
          eventType,
          eventId,
          reason: error instanceof Error ? error.message : 'Unknown webhook error',
        },
      });
    } catch (analyticsError) {
      console.error('Failed to log square_webhook_failed:', analyticsError);
    }

    return NextResponse.json({ error: 'Failed to process webhook event.' }, { status: 500 });
  }
}
