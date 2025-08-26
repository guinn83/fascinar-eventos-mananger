-- Test: staff availability (default and per-event) behavior
-- Safe test: runs inside a transaction and ROLLBACKs so it doesn't persist data.
-- Usage (PowerShell):
-- psql "postgres://user:password@host:5432/dbname" -f "sql/migrations/20250825_test_staff_event_availability.sql"

BEGIN;

-- Test constants (stable UUIDs)
-- p1: default available, no event override -> should be returned by v1 and v2
-- p2: default unavailable, event override = true -> should be excluded by v1, included by v2
-- p3: default available, event override = false -> should be returned by v1, excluded by v2

-- Use specific UUIDs so this script is repeatable
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Profile One', now(), now()),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Profile Two', now(), now()),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Profile Three', now(), now());

-- Create an event on 2025-09-01
INSERT INTO public.events (id, title, event_date, created_at, updated_at)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Test Event', '2025-09-01'::timestamp with time zone, now(), now());

-- default_staff_roles entries (role = assistente)
INSERT INTO public.default_staff_roles (id, profile_id, staff_role, experience_level, is_active, created_at, updated_at)
VALUES
  ('aaaaaaa1-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'assistente'::staff_role, 3, true, now(), now()),
  ('aaaaaaa2-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'assistente'::staff_role, 2, true, now(), now()),
  ('aaaaaaa3-0000-0000-0000-000000000003'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'assistente'::staff_role, 1, true, now(), now());

-- Default availability (event_id IS NULL)
INSERT INTO public.staff_availability (id, staff_id, event_id, is_available, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000101'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, NULL, true, now(), now()),
  ('00000000-0000-0000-0000-000000000102'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, NULL, false, now(), now()),
  ('00000000-0000-0000-0000-000000000103'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, NULL, true, now(), now());

-- Per-event overrides (preferred table: staff_availability with event_id)
INSERT INTO public.staff_availability (id, staff_id, event_id, is_available, created_at, updated_at)
VALUES
  -- p2: override true
  ('00000000-0000-0000-0000-000000000201'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, true, now(), now()),
  -- p3: override false
  ('00000000-0000-0000-0000-000000000202'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, false, now(), now());

-- Show baseline data
SELECT 'staff_availability_default' AS which, * FROM public.staff_availability WHERE event_id IS NULL ORDER BY staff_id;
SELECT 'staff_availability_event' AS which, * FROM public.staff_availability WHERE event_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid ORDER BY staff_id;

-- Call original function (no event override logic)
SELECT 'get_available_staff_for_date' AS fn, * FROM get_available_staff_for_date('2025-09-01'::date, 'assistente'::staff_role) ORDER BY profile_id;

-- Call enhanced version WITHOUT event_uuid (should behave like original)
SELECT 'get_available_staff_for_date_v2_no_event' AS fn, * FROM get_available_staff_for_date_v2('2025-09-01'::date, 'assistente'::staff_role, NULL::uuid) ORDER BY profile_id;

-- Call enhanced version WITH event_uuid (overrides apply)
SELECT 'get_available_staff_for_date_v2_with_event' AS fn, * FROM get_available_staff_for_date_v2('2025-09-01'::date, 'assistente'::staff_role, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid) ORDER BY profile_id;

-- Expected outcome (comments):
-- - get_available_staff_for_date: should return p1 and p3 (p2 excluded because default unavailable)
-- - get_available_staff_for_date_v2_no_event: same as above
-- - get_available_staff_for_date_v2_with_event: should return p1 and p2 (p3 excluded because event override false; p2 included despite default unavailable because event override true)

ROLLBACK;

-- End of test
