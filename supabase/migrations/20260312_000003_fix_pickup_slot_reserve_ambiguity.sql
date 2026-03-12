-- Fix ambiguous column references in reserve_pickup_slot.
-- The RETURNS TABLE output columns (reserved_count/capacity) can shadow unqualified
-- identifiers in PL/pgSQL, so we fully qualify pickup_slots columns with an alias.

create or replace function public.reserve_pickup_slot(
  p_location_slug text,
  p_square_location_id text,
  p_slot_date date,
  p_slot_time time,
  p_default_capacity integer default 12,
  p_lead_time_minutes integer default 60
)
returns table(
  success boolean,
  message text,
  slot_id uuid,
  reserved_count integer,
  capacity integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.pickup_slots%rowtype;
begin
  insert into public.pickup_slots (
    location_slug,
    square_location_id,
    slot_date,
    slot_time,
    capacity,
    reserved_count,
    lead_time_minutes
  )
  values (
    p_location_slug,
    p_square_location_id,
    p_slot_date,
    p_slot_time,
    greatest(p_default_capacity, 0),
    0,
    greatest(p_lead_time_minutes, 0)
  )
  on conflict (location_slug, slot_date, slot_time) do nothing;

  update public.pickup_slots as ps
  set
    reserved_count = ps.reserved_count + 1,
    updated_at = now()
  where ps.location_slug = p_location_slug
    and ps.slot_date = p_slot_date
    and ps.slot_time = p_slot_time
    and ps.is_blackout = false
    and ps.reserved_count < ps.capacity
  returning * into v_slot;

  if found then
    return query select true, 'reserved', v_slot.id, v_slot.reserved_count, v_slot.capacity;
    return;
  end if;

  select * into v_slot
  from public.pickup_slots
  where location_slug = p_location_slug
    and slot_date = p_slot_date
    and slot_time = p_slot_time;

  if v_slot.id is null then
    return query select false, 'slot_unavailable', null::uuid, 0, p_default_capacity;
    return;
  end if;

  if v_slot.is_blackout then
    return query select false, 'slot_blackout', v_slot.id, v_slot.reserved_count, v_slot.capacity;
  elsif v_slot.reserved_count >= v_slot.capacity then
    return query select false, 'slot_full', v_slot.id, v_slot.reserved_count, v_slot.capacity;
  else
    return query select false, 'slot_unavailable', v_slot.id, v_slot.reserved_count, v_slot.capacity;
  end if;
end;
$$;
