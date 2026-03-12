# Square + Supabase Rollout and Ops Runbook

This runbook is for launching and operating the Square-first checkout flow on Vercel.

## 1. Environment Checklist

Set these in Vercel for Preview and Production:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SQUARE_ENV` (`sandbox` or `production`)
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `SQUARE_WEBHOOK_NOTIFICATION_URL`
- `SQUARE_LOCATION_ID` (fallback)
- `SQUARE_LOCATION_ID_PROVO`
- `SQUARE_LOCATION_ID_OREM`
- `SQUARE_API_VERSION` (optional)

## 2. Sandbox Validation

Run these before any production pilot:

- Apply Supabase migrations from `supabase/migrations`.
- Create at least one admin row in `admin_users` tied to a Supabase Auth user.
- Verify admin dashboard works:
  - Sign in at `/admin/login`
  - Sync catalog from `/admin`
  - Save one site setting update
  - Save one content block update
- Place 3 sandbox orders covering:
  - standard successful payment
  - cancelled checkout
  - payment failure path
- Confirm webhook ingestion:
  - `webhook_events` row created and status updated
  - corresponding `orders.payment_status` transitions occur

## 3. Pilot Rollout (Single Location)

- Start with one location and conservative slot capacity.
- Publish during low-traffic window.
- Monitor first 20 orders manually:
  - order created in DB
  - payment status reaches `completed`
  - staff can identify order in Square
  - pickup details are correct
- Keep manual fallback process active for phone orders during pilot.

## 4. Daily Operations

Daily checks:

- Inspect failed webhook events:
  - `webhook_events.status = 'failed'`
- Inspect checkout failures:
  - `analytics_events.event_name = 'checkout_create_failed'`
- Validate open slot capacity:
  - `pickup_slots.reserved_count <= pickup_slots.capacity`

Operational ownership:

- **Shift lead:** monitors same-day order queue and pickup status
- **Ops manager:** reviews failed events and retries/manual remediation
- **Finance/admin:** runs end-of-day reconciliation

## 5. Reconciliation Process

For each business day:

1. Export paid online orders from Square.
2. Compare against `orders` with `payment_status = 'completed'`.
3. Verify totals, refunds, and cancellations.
4. Record discrepancies and corrective actions.

Recommended SQL checks:

```sql
-- Completed payments by day
select
  date_trunc('day', paid_at) as paid_day,
  count(*) as order_count,
  sum(total_cents) / 100.0 as gross_total
from public.orders
where payment_status = 'completed'
group by 1
order by 1 desc;
```

```sql
-- Failed webhook events needing attention
select event_id, event_type, error, received_at
from public.webhook_events
where status = 'failed'
order by received_at desc;
```

## 6. Incident Playbook

### Webhooks failing

- Confirm `SQUARE_WEBHOOK_SIGNATURE_KEY` and notification URL.
- Check Vercel function logs for payload errors.
- Mark unresolved events and replay from Square dashboard if needed.

### Checkout session creation failing

- Check `checkout_create_failed` analytics events and API logs.
- Validate Square token and location mapping settings.
- Temporarily disable online checkout CTA if failure rate is sustained.

### Slot overbooking

- Inspect `pickup_slots` for incorrect capacity values.
- Lower slot capacity and add blackout windows via admin settings.
- Contact affected customers proactively if manual rescheduling is needed.
