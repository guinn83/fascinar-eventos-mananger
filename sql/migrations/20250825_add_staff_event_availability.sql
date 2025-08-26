-- Migration: 2025-08-25 - Add staff_event_availability table
-- Purpose: Add per-event staff availability table, indexes, trigger and RLS policies.
-- Run this migration with psql or your preferred migration tool.

-- 1) Create table (safe: IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.staff_event_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,

  -- Status of availability specifically for the event
  is_available BOOLEAN NOT NULL DEFAULT false,

  -- Optional time window (within the event)
  available_from TIME NULL,
  available_until TIME NULL,

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (staff_id, event_id),
  CHECK (available_from < available_until OR (available_from IS NULL AND available_until IS NULL))
);

-- 2) Indexes to speed up common queries
CREATE INDEX IF NOT EXISTS idx_staff_event_availability_staff ON public.staff_event_availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_event_availability_event ON public.staff_event_availability(event_id);
CREATE INDEX IF NOT EXISTS idx_staff_event_availability_is_available ON public.staff_event_availability(is_available);

-- 3) Trigger to keep updated_at fresh (reuses existing function if present)
-- If update_updated_at_column() doesn't exist, this will fail; ensure the helper exists before running.
DROP TRIGGER IF EXISTS update_staff_event_availability_updated_at ON public.staff_event_availability;
CREATE TRIGGER update_staff_event_availability_updated_at
  BEFORE UPDATE ON public.staff_event_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4) Row Level Security (basic mirror of staff_availability)
-- Enable RLS (no-op if already enabled)
ALTER TABLE public.staff_event_availability ENABLE ROW LEVEL SECURITY;

-- Policy: allow admins/organizers or the staff profile itself to SELECT
CREATE POLICY IF NOT EXISTS "staff_event_availability_select_policy" ON public.staff_event_availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.id = staff_id)
  );

-- Policy: allow inserts by admins/organizers or by the staff themselves (WITH CHECK ensures insert data complies)
CREATE POLICY IF NOT EXISTS "staff_event_availability_insert_policy" ON public.staff_event_availability
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.id = staff_id)
  );

-- Policy: allow updates by admins/organizers or by the staff themselves
CREATE POLICY IF NOT EXISTS "staff_event_availability_update_policy" ON public.staff_event_availability
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.id = staff_id)
  );

-- Policy: allow delete by admins/organizers (you can extend to staff if desired)
CREATE POLICY IF NOT EXISTS "staff_event_availability_delete_policy" ON public.staff_event_availability
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organizer'))
  );

-- 5) Optional: backfill guidance (commented)
-- If you want to create initial per-event availability rows from current business rules, you can:
--  - insert rows for staff explicitly invited/assigned to events, or
--  - skip backfill and let users confirm availability per event.
-- Example: mark as available any profile already assigned (event_staff) for upcoming events:
--
-- INSERT INTO public.staff_event_availability (staff_id, event_id, is_available, available_from, available_until, notes)
-- SELECT es.profile_id, es.event_id, COALESCE(es.confirmed, false) AS is_available, NULL, NULL, 'Backfilled from event_staff'
-- FROM public.event_staff es
-- JOIN public.events e ON e.id = es.event_id
-- WHERE e.event_date >= now()::date
-- AND es.profile_id IS NOT NULL
-- ON CONFLICT (staff_id, event_id) DO NOTHING;

-- 6) Notes
-- - This migration assumes the helper trigger function update_updated_at_column() exists (it does in the project setup file).
-- - After applying this migration, consider updating the function get_available_staff_for_date to consult staff_event_availability for explicit per-event overrides.

-- End of migration

SELECT 'Migration 20250825_add_staff_event_availability applied' AS status;
