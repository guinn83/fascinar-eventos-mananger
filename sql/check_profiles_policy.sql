-- Smoke test: verify profiles policy helper functions and basic selects
-- Safe to run in Supabase SQL Editor (read-only checks and SELECTs)

-- 1) Current user role checks
SELECT 'is_current_user_admin' AS check, public.is_current_user_admin() AS result;
SELECT 'is_current_user_organizer' AS check, public.is_current_user_organizer() AS result;
SELECT 'current_user_profile_id' AS check, public.current_user_profile_id() AS result;

-- 2) Basic profiles select (should return rows your user can see)
SELECT 'profiles_select_sample' AS check, id, user_id, full_name, role FROM public.profiles LIMIT 10;

-- 3) Event select sample (uses events_select_policy)
SELECT 'events_select_sample' AS check, id, title, event_date, client_profile_id FROM public.events LIMIT 10;

-- 4) Test that functions get_available_staff_for_date and v2 run
SELECT 'get_available_staff_for_date_test' AS test, * FROM get_available_staff_for_date(CURRENT_DATE, NULL::staff_role) LIMIT 10;
SELECT 'get_available_staff_for_date_v2_test' AS test, * FROM get_available_staff_for_date_v2(CURRENT_DATE, NULL::staff_role, NULL::uuid) LIMIT 10;

-- End of smoke test
